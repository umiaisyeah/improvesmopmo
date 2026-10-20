import { DocumentPackage } from '../types';

const APP_FOLDER_NAME = 'BAPL & RAB Audit System';

export interface DriveFileInfo {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
}

/**
 * Finds or creates the dedicated app folder in Google Drive.
 */
export async function getOrCreateAppFolder(accessToken: string): Promise<string> {
  // Search for folder
  const query = encodeURIComponent(
    `name = '${APP_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!searchRes.ok) {
    const err = await searchRes.text();
    throw new Error(`Gagal mencari folder di Google Drive: ${err}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: APP_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Folder penyimpanan otomatis paket verifikasi dan audit BAPL / RAB',
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Gagal membuat folder di Google Drive: ${err}`);
  }

  const createData = await createRes.json();
  return createData.id;
}

/**
 * Uploads or updates a document package file in the app's Google Drive folder.
 */
export async function uploadPackageToDrive(
  accessToken: string,
  pkg: DocumentPackage
): Promise<{ fileId: string; fileName: string }> {
  const folderId = await getOrCreateAppFolder(accessToken);
  const safeTitle = (pkg.projectCode || 'PROYEK').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Paket_${safeTitle}_${pkg.id}.bapl.json`;

  const payload = {
    schemaVersion: '2.0',
    syncedAt: new Date().toISOString(),
    pkg,
  };
  const fileContent = JSON.stringify(payload, null, 2);

  // Check if file already exists in folder
  const searchFileQuery = encodeURIComponent(
    `name = '${fileName}' and '${folderId}' in parents and trashed = false`
  );
  const existingRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${searchFileQuery}&fields=files(id,name)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const existingData = await existingRes.json();
  const existingFile = existingData.files && existingData.files.length > 0 ? existingData.files[0] : null;

  if (existingFile) {
    // Update existing file content
    const updateRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: fileContent,
      }
    );

    if (!updateRes.ok) {
      throw new Error(`Gagal memperbarui file di Google Drive: ${await updateRes.text()}`);
    }

    return { fileId: existingFile.id, fileName };
  } else {
    // Multipart upload for new file with folder metadata
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      parents: [folderId],
      description: `Paket Dokumen: ${pkg.title}`,
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      fileContent +
      closeDelimiter;

    const createRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!createRes.ok) {
      throw new Error(`Gagal mengunggah paket ke Google Drive: ${await createRes.text()}`);
    }

    const createdData = await createRes.json();
    return { fileId: createdData.id, fileName };
  }
}

/**
 * Lists all package files stored in the Google Drive app folder.
 */
export async function listPackagesInDrive(accessToken: string): Promise<DriveFileInfo[]> {
  const folderId = await getOrCreateAppFolder(accessToken);
  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,size)&orderBy=modifiedTime desc`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    throw new Error(`Gagal memuat daftar file dari Google Drive: ${await res.text()}`);
  }

  const data = await res.json();
  return (data.files || []).filter((f: any) => f.name.endsWith('.bapl.json'));
}

/**
 * Downloads and parses a document package from Google Drive.
 */
export async function downloadPackageFromDrive(
  accessToken: string,
  fileId: string
): Promise<DocumentPackage> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Gagal mengunduh file dari Google Drive: ${await res.text()}`);
  }

  const json = await res.json();
  if (json.pkg && json.pkg.id && json.pkg.result) {
    return json.pkg as DocumentPackage;
  } else if (json.id && json.result) {
    return json as DocumentPackage;
  }

  throw new Error('Format berkas paket dari Google Drive tidak valid.');
}

/**
 * Deletes a package file from Google Drive with explicit confirmation.
 */
export async function deletePackageFromDrive(
  accessToken: string,
  fileId: string
): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok && res.status !== 404) {
    throw new Error(`Gagal menghapus file dari Google Drive: ${await res.text()}`);
  }
}
