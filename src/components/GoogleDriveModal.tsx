import React, { useState, useEffect } from 'react';
import {
  Cloud,
  X,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  FolderCheck,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { DocumentPackage } from '../types';
import {
  listPackagesInDrive,
  downloadPackageFromDrive,
  deletePackageFromDrive,
  uploadPackageToDrive,
  DriveFileInfo,
} from '../services/googleDriveService';

interface GoogleDriveModalProps {
  user: User | null;
  accessToken: string | null;
  packages: DocumentPackage[];
  onLogin: () => void;
  onLogout: () => void;
  onImportFromDrive: (pkg: DocumentPackage) => void;
  onClose: () => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  user,
  accessToken,
  packages,
  onLogin,
  onLogout,
  onImportFromDrive,
  onClose,
}) => {
  const [driveFiles, setDriveFiles] = useState<DriveFileInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Destructive delete confirmation state (Mandatory per skill)
  const [fileToDelete, setFileToDelete] = useState<DriveFileInfo | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchDriveFiles = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const files = await listPackagesInDrive(accessToken);
      setDriveFiles(files);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal memuat daftar file dari Google Drive.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchDriveFiles();
    }
  }, [accessToken]);

  const handleSyncAllToDrive = async () => {
    if (!accessToken || packages.length === 0) return;
    setIsSyncing(true);
    setSyncStatus(`Menyinkronkan 0/${packages.length} paket...`);
    setErrorMessage(null);

    try {
      let count = 0;
      for (const pkg of packages) {
        await uploadPackageToDrive(accessToken, pkg);
        count++;
        setSyncStatus(`Menyinkronkan ${count}/${packages.length} paket...`);
      }
      setSyncStatus(`Berhasil! ${packages.length} paket telah tersimpan aman di Google Drive Anda.`);
      await fetchDriveFiles();
      setTimeout(() => setSyncStatus(null), 5000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal menyinkronkan paket ke Google Drive.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleImportFile = async (file: DriveFileInfo) => {
    if (!accessToken) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const importedPkg = await downloadPackageFromDrive(accessToken, file.id);
      onImportFromDrive(importedPkg);
      setSyncStatus(`Paket "${importedPkg.title}" berhasil dimuat ke aplikasi!`);
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal mengimpor file dari Google Drive.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!accessToken || !fileToDelete) return;
    setIsDeleting(true);
    try {
      await deletePackageFromDrive(accessToken, fileToDelete.id);
      setFileToDelete(null);
      await fetchDriveFiles();
      setSyncStatus('File di Google Drive berhasil dihapus.');
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal menghapus file dari Google Drive.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Integrasi Google Drive</h3>
              <p className="text-xs text-slate-500">
                Simpan dan sinkronkan paket dokumen verifikasi secara permanen di akun Google Drive pribadi Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Status Section */}
        {user && accessToken ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google User'}
                  className="w-10 h-10 rounded-full border border-slate-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  {user.displayName ? user.displayName[0].toUpperCase() : 'G'}
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900">
                    {user.displayName || 'Akun Google'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Terhubung
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">{user.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Putuskan Hubungan</span>
            </button>
          </div>
        ) : (
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-5 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-white shadow-xs mx-auto flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Hubungkan Akun Google Anda</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto mt-0.5">
                Masuk dengan akun Google untuk mengaktifkan sinkronisasi otomatis ke folder khusus di Google Drive Anda.
              </p>
            </div>
            <button
              type="button"
              onClick={onLogin}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs hover:shadow transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        )}

        {/* Feedback Alerts */}
        {syncStatus && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center space-x-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncStatus}</span>
          </div>
        )}

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center space-x-2 text-xs text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Connected Operations */}
        {user && accessToken && (
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleSyncAllToDrive}
                  disabled={isSyncing || packages.length === 0}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {isSyncing ? 'Menyinkronkan...' : `Simpan ${packages.length} Paket ke Google Drive`}
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={fetchDriveFiles}
                disabled={isLoading}
                title="Segarkan daftar file dari Drive"
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Segarkan</span>
              </button>
            </div>

            {/* Folder location indicator */}
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 bg-slate-100/70 px-3 py-1.5 rounded-lg">
              <FolderCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Lokasi Folder Drive: <strong>Google Drive / BAPL &amp; RAB Audit System /</strong></span>
            </div>

            {/* Files List */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-2 min-h-[160px]">
              {isLoading && driveFiles.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                  Memuat daftar paket dari Google Drive...
                </div>
              ) : driveFiles.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 space-y-1">
                  <Cloud className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-700">Belum Ada File Paket di Google Drive</p>
                  <p className="text-[11px] text-slate-400">
                    Klik tombol "Simpan Paket ke Google Drive" di atas untuk mencadangkan paket Anda.
                  </p>
                </div>
              ) : (
                driveFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-xs"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-400">
                          Dimodifikasi: {new Date(file.modifiedTime).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0 ml-3">
                      <button
                        type="button"
                        onClick={() => handleImportFile(file)}
                        title="Buka / Impor paket ini ke aplikasi"
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Buka</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFileToDelete(file)}
                        title="Hapus file ini dari Google Drive"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Explicit Confirmation Dialog for Destructive Delete (Mandatory) */}
        {fileToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
              <div className="flex items-center space-x-2.5 text-rose-600">
                <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Konfirmasi Hapus di Drive</h4>
                  <p className="text-xs text-slate-500">Tindakan ini permanen</p>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                Apakah Anda yakin ingin menghapus file <strong>{fileToDelete.name}</strong> dari Google Drive Anda? File yang dihapus tidak dapat dipulihkan.
              </p>

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setFileToDelete(null)}
                  disabled={isDeleting}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs"
                >
                  {isDeleting ? 'Menghapus...' : 'Ya, Hapus File'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
