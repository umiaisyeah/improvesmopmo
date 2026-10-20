import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { normalizeNumber, isCategoryHeaderOrNonItem } from './normalizer';
import { RawBaplPage } from '../types';
import { parseProjectExcel, ParsedExcelData } from './excelParser';
import {
  sortDocumentsAscending,
  normalizeItemKey,
  calculateDocumentRecencyScore,
} from './multiDocSorter';

export interface ParsedProjectDocumentsData {
  projectInfo: Partial<{
    projectName: string;
    projectCode: string;
    subproject: string;
    location: string;
    contractor: string;
    poNumber: string;
    baplNumber: string;
    date: string;
    revision: string;
  }>;
  rabInitial: Array<{
    itemNo?: string;
    item: string;
    unit: string;
    qty: number;
    unitPrice: number;
    total: number;
    subSpecs?: string[];
    sourceFile?: string;
  }>;
  rabRevised: Array<{
    itemNo?: string;
    item: string;
    unit: string;
    qty: number;
    unitPrice: number;
    total: number;
    subSpecs?: string[];
    sourceFile?: string;
  }>;
  jusTek: Array<{
    changeId: string;
    item: string;
    baseline: string;
    proposed: string;
    cause: string;
    risk: string;
    benefit: string;
    sourceFile?: string;
  }>;
  jusFin: Array<{
    changeId: string;
    item: string;
    totalInitial: number;
    totalRevised: number;
    statedDelta: number;
    justification: string;
    sourceFile?: string;
  }>;
  statedTotalInitial?: number;
  statedTotalRevised?: number;
  statedTotalJusFinDelta?: number;
  fileSummaries: Array<{
    fileName: string;
    fileType: 'EXCEL' | 'PDF' | 'WORD' | 'TEXT';
    itemsExtracted: number;
    recencyScore?: number;
    orderIndex?: number;
  }>;
  selectedSheets?: Record<string, { sheetName: string; allCandidates: string[]; reason: string }>;
  auditNotes?: string[];
  supersededItems?: Array<{
    type: 'JusTek' | 'JusFin' | 'RAB';
    identifier: string;
    olderSource: string;
    newerSource: string;
    detail: string;
  }>;
  warnings: string[];
}

/**
 * Universal Multi-File Parser for Justifikasi Teknis (JusTek), Justifikasi Finansial (JusFin), and RAB.
 * Accepts multiple files in Excel (.xlsx, .xls, .csv) and/or PDF (.pdf, .txt).
 */
export async function parseProjectDocuments(
  files: File[],
  onProgress?: (msg: string, pct: number) => void
): Promise<ParsedProjectDocumentsData> {
  const result: ParsedProjectDocumentsData = {
    projectInfo: {},
    rabInitial: [],
    rabRevised: [],
    jusTek: [],
    jusFin: [],
    fileSummaries: [],
    selectedSheets: {},
    auditNotes: [],
    supersededItems: [],
    warnings: [],
  };

  if (!files || files.length === 0) {
    return result;
  }

  // 1. Sort files chronologically (oldest first, newest last)
  // This guarantees that in subsequent passes, newer files overwrite older files on identical points.
  const sortedFiles = sortDocumentsAscending(files);

  if (sortedFiles.length > 1) {
    const sequenceNames = sortedFiles.map((f, idx) => `[#${idx + 1}] ${f.name}`).join(' -> ');
    const note = `[Urutan Kronologis Berkas] Sistem mendeteksi ${sortedFiles.length} berkas: ${sequenceNames}. Berkas yang lebih baru memiliki otoritas untuk memperbarui poin usulan teknis, finansial, dan RAB dari berkas sebelumnya.`;
    result.auditNotes?.push(note);
  }

  // Tracking maps for items to support overwriting by newer documents
  const rabInitMap = new Map<string, typeof result.rabInitial[0]>();
  const rabRevMap = new Map<string, typeof result.rabRevised[0]>();
  const jusTekMap = new Map<string, typeof result.jusTek[0]>();
  const jusFinMap = new Map<string, typeof result.jusFin[0]>();

  for (let i = 0; i < sortedFiles.length; i++) {
    const file = sortedFiles[i];
    const fileName = file.name.toLowerCase();
    const progressPct = Math.round((i / sortedFiles.length) * 100);
    const recencyMeta = calculateDocumentRecencyScore(file.name, file.lastModified);

    onProgress?.(`Memproses berkas [${i + 1}/${sortedFiles.length}]: ${file.name}...`, progressPct);

    // Case 1: Excel / CSV File
    if (
      fileName.endsWith('.xlsx') ||
      fileName.endsWith('.xls') ||
      fileName.endsWith('.csv') ||
      file.type.includes('spreadsheet') ||
      file.type.includes('excel') ||
      file.type.includes('csv')
    ) {
      try {
        const buffer = await file.arrayBuffer();
        const parsedExcel = parseProjectExcel(buffer);

        // Capture sheet selections
        if (parsedExcel.selectedSheets) {
          result.selectedSheets = {
            ...result.selectedSheets,
            ...parsedExcel.selectedSheets,
          };
        }
        if (parsedExcel.auditNotes && parsedExcel.auditNotes.length > 0) {
          result.auditNotes?.push(...parsedExcel.auditNotes);
        }

        // Merge Project Info
        Object.assign(result.projectInfo, Object.fromEntries(
          Object.entries(parsedExcel.projectInfo).filter(([_, v]) => Boolean(v))
        ));

        // Merge RAB Initial: Ingest all rows faithfully from newest file without collapsing identically named distinct items
        if (parsedExcel.rabInitial && parsedExcel.rabInitial.length > 0) {
          rabInitMap.clear();
          for (let rIdx = 0; rIdx < parsedExcel.rabInitial.length; rIdx++) {
            const item = parsedExcel.rabInitial[rIdx];
            const uniqueKey = `init_row_${rIdx}`;
            rabInitMap.set(uniqueKey, { ...item, sourceFile: file.name });
          }
        }

        // Merge RAB Revised: Ingest all rows faithfully from newest file without collapsing identically named distinct items
        if (parsedExcel.rabRevised && parsedExcel.rabRevised.length > 0) {
          rabRevMap.clear();
          for (let rIdx = 0; rIdx < parsedExcel.rabRevised.length; rIdx++) {
            const item = parsedExcel.rabRevised[rIdx];
            const uniqueKey = `rev_row_${rIdx}`;
            rabRevMap.set(uniqueKey, { ...item, sourceFile: file.name });
          }
        }

        // Merge JusTek: Ingest all technical claims without dropping rows
        if (parsedExcel.jusTek && parsedExcel.jusTek.length > 0) {
          jusTekMap.clear();
          for (let jIdx = 0; jIdx < parsedExcel.jusTek.length; jIdx++) {
            const item = parsedExcel.jusTek[jIdx];
            const uniqueKey = `justek_row_${jIdx}`;
            jusTekMap.set(uniqueKey, { ...item, sourceFile: file.name });
          }
        }

        // Merge JusFin: Ingest all financial claims without dropping rows
        if (parsedExcel.jusFin && parsedExcel.jusFin.length > 0) {
          jusFinMap.clear();
          for (let fIdx = 0; fIdx < parsedExcel.jusFin.length; fIdx++) {
            const item = parsedExcel.jusFin[fIdx];
            const uniqueKey = `jusfin_row_${fIdx}`;
            jusFinMap.set(uniqueKey, { ...item, sourceFile: file.name });
          }
        }

        if (parsedExcel.statedTotalInitial !== undefined) {
          result.statedTotalInitial = parsedExcel.statedTotalInitial;
        }
        if (parsedExcel.statedTotalRevised !== undefined) {
          result.statedTotalRevised = parsedExcel.statedTotalRevised;
        }
        if (parsedExcel.statedTotalJusFinDelta !== undefined) {
          result.statedTotalJusFinDelta = parsedExcel.statedTotalJusFinDelta;
        }

        const totalItemsInFile =
          parsedExcel.rabRevised.length +
          parsedExcel.jusTek.length +
          parsedExcel.jusFin.length;

        result.fileSummaries.push({
          fileName: file.name,
          fileType: 'EXCEL',
          itemsExtracted: totalItemsInFile,
          recencyScore: recencyMeta.score,
          orderIndex: i + 1,
        });
      } catch (err: any) {
        result.warnings.push(`Gagal membaca berkas Excel ${file.name}: ${err.message || 'Format tidak valid'}`);
      }
    }
    // Case 2: PDF Document (Justifikasi Teknis, JusFin, or RAB in PDF)
    else if (fileName.endsWith('.pdf') || file.type.includes('pdf')) {
      try {
        onProgress?.(`Mengekstrak tabel dan pasal Justifikasi Teknis/Finansial dari PDF: ${file.name}...`, progressPct + 10);
        const base64 = await fileToBase64(file);

        const aiResponse = await fetch('/api/ai-extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: 'application/pdf',
            prompt: `You are an expert PMO Auditor. Extract all technical justifications (JusTek), financial justifications (JusFin), and RAB line items from this PDF document (${file.name}).

CRITICAL AUDIT RULES:
- Only extract substantive technical work items and financial cost rows.
- DO NOT extract approval blocks, signature sections (e.g. 'Dibuat oleh', 'Diperiksa oleh', 'Disetujui oleh', 'Mengetahui', person names, attendee lists) as items in jusTek, jusFin, or rab.
- DO NOT extract logos, company letterheads, document metadata, or category group headers (e.g. 'Supply Material', 'Jasa') as change items.

Extract these specific fields into JSON:
{
  "projectInfo": {
    "projectName": "",
    "projectCode": "",
    "subproject": "",
    "contractor": "",
    "poNumber": "",
    "location": "",
    "revision": ""
  },
  "jusTek": [
    {
      "changeId": "CHG-001",
      "item": "Pekerjaan ...",
      "baseline": "Kondisi Awal Kontrak / DED",
      "proposed": "Usulan Perubahan Lapangan",
      "cause": "Alasan Teknis Perubahan",
      "risk": "Risiko bila tidak dilakukan",
      "benefit": "Manfaat perubahan"
    }
  ],
  "jusFin": [
    {
      "changeId": "CHG-001",
      "item": "Pekerjaan ...",
      "totalInitial": 1000000,
      "totalRevised": 1200000,
      "statedDelta": 200000,
      "justification": "Penjelasan finansial"
    }
  ],
  "rabRevised": [
    {
      "itemNo": "1",
      "item": "Uraian Pekerjaan",
      "unit": "Unit / m / ls",
      "qty": 1,
      "unitPrice": 100000,
      "total": 100000
    }
  ],
  "rabInitial": [
    {
      "itemNo": "1",
      "item": "Uraian Pekerjaan",
      "unit": "Unit / m / ls",
      "qty": 1,
      "unitPrice": 100000,
      "total": 100000
    }
  ]
}`,
          }),
        });

        if (aiResponse.ok) {
          const resJson = await aiResponse.json();
          const data = resJson.data || resJson.extracted;
          if (data) {
            if (data.projectInfo) {
              Object.assign(result.projectInfo, Object.fromEntries(
                Object.entries(data.projectInfo).filter(([_, v]) => Boolean(v))
              ));
            }
            if (Array.isArray(data.jusTek) && data.jusTek.length > 0) {
              for (const item of data.jusTek) {
                const key = item.changeId ? item.changeId.toUpperCase().trim() : normalizeItemKey(item.item);
                if (key) {
                  if (jusTekMap.has(key)) {
                    const prev = jusTekMap.get(key)!;
                    result.supersededItems?.push({
                      type: 'JusTek',
                      identifier: item.changeId || item.item,
                      olderSource: prev.sourceFile || 'Berkas Sebelumnya',
                      newerSource: file.name,
                      detail: `Memperbarui JusTek PDF "${item.item}": Usulan [${item.proposed}] menggantikan [${prev.proposed}].`,
                    });
                  }
                  jusTekMap.set(key, { ...item, sourceFile: file.name });
                }
              }
            }
            if (Array.isArray(data.jusFin) && data.jusFin.length > 0) {
              for (const item of data.jusFin) {
                const key = item.changeId ? item.changeId.toUpperCase().trim() : normalizeItemKey(item.item);
                if (key) {
                  if (jusFinMap.has(key)) {
                    const prev = jusFinMap.get(key)!;
                    result.supersededItems?.push({
                      type: 'JusFin',
                      identifier: item.changeId || item.item,
                      olderSource: prev.sourceFile || 'Berkas Sebelumnya',
                      newerSource: file.name,
                      detail: `Memperbarui JusFin PDF "${item.item}": Nilai Rp ${item.totalRevised} menggantikan Rp ${prev.totalRevised}.`,
                    });
                  }
                  jusFinMap.set(key, { ...item, sourceFile: file.name });
                }
              }
            }
            if (Array.isArray(data.rabRevised) && data.rabRevised.length > 0) {
              for (const item of data.rabRevised) {
                const key = item.itemNo && item.itemNo !== '-' ? `no_${item.itemNo.trim()}` : normalizeItemKey(item.item);
                if (key) rabRevMap.set(key, { ...item, sourceFile: file.name });
              }
            }
            if (Array.isArray(data.rabInitial) && data.rabInitial.length > 0) {
              for (const item of data.rabInitial) {
                const key = item.itemNo && item.itemNo !== '-' ? `no_${item.itemNo.trim()}` : normalizeItemKey(item.item);
                if (key) rabInitMap.set(key, { ...item, sourceFile: file.name });
              }
            }

            const totalItemsInFile =
              (data.rabRevised?.length || 0) +
              (data.jusTek?.length || 0) +
              (data.jusFin?.length || 0);

            result.fileSummaries.push({
              fileName: file.name,
              fileType: 'PDF',
              itemsExtracted: totalItemsInFile,
              recencyScore: recencyMeta.score,
              orderIndex: i + 1,
            });
          }
        }
      } catch (pdfErr: any) {
        result.warnings.push(`Peringatan ekstraksi PDF ${file.name}: ${pdfErr.message}`);
      }
    }
    // Case 3: Word Document (.docx / .doc)
    else if (
      fileName.endsWith('.docx') ||
      fileName.endsWith('.doc') ||
      file.type.includes('word') ||
      file.type.includes('officedocument.wordprocessingml')
    ) {
      try {
        onProgress?.(`Mengekstrak klausul dan tabel Justifikasi Teknis/Finansial dari Word DOCX: ${file.name}...`, progressPct + 10);
        const arrayBuffer = await file.arrayBuffer();
        let extractedDocText = '';
        try {
          const rawTextRes = await mammoth.extractRawText({ arrayBuffer });
          extractedDocText = rawTextRes.value || '';
        } catch (mErr) {
          console.warn('Mammoth text extraction error', mErr);
        }

        let extractedDocHtml = '';
        try {
          const htmlRes = await mammoth.convertToHtml({ arrayBuffer });
          extractedDocHtml = htmlRes.value || '';
        } catch (mErr) {
          console.warn('Mammoth HTML extraction error', mErr);
        }

        const combinedDocContent = `${extractedDocText}\n\n=== TABULAR STRUCTURE ===\n${extractedDocHtml}`;

        const aiResponse = await fetch('/api/ai-extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentText: combinedDocContent.slice(0, 50000),
            prompt: `You are an expert PMO Auditor. Extract all technical justifications (JusTek), financial justifications (JusFin), and RAB line items from this Word Document (${file.name}).

CRITICAL AUDIT RULES:
- Only extract substantive technical work items and financial cost rows.
- DO NOT extract approval blocks, signature sections (e.g. 'Dibuat oleh', 'Diperiksa oleh', 'Disetujui oleh', 'Mengetahui', person names, attendee lists) as items in jusTek, jusFin, or rab.
- DO NOT extract logos, company letterheads, document metadata, or category group headers (e.g. 'Supply Material', 'Jasa') as change items.

Extract these specific fields into JSON:
{
  "projectInfo": {
    "projectName": "",
    "projectCode": "",
    "subproject": "",
    "contractor": "",
    "poNumber": "",
    "location": "",
    "revision": ""
  },
  "jusTek": [
    {
      "changeId": "CHG-001",
      "item": "Pekerjaan ...",
      "baseline": "Kondisi Awal Kontrak / DED",
      "proposed": "Usulan Perubahan Lapangan",
      "cause": "Alasan Teknis Perubahan",
      "risk": "Risiko bila tidak dilakukan",
      "benefit": "Manfaat perubahan"
    }
  ],
  "jusFin": [
    {
      "changeId": "CHG-001",
      "item": "Pekerjaan ...",
      "totalInitial": 1000000,
      "totalRevised": 1200000,
      "statedDelta": 200000,
      "justification": "Penjelasan finansial"
    }
  ],
  "rabRevised": [
    {
      "itemNo": "1",
      "item": "Uraian Pekerjaan",
      "unit": "Unit / m / ls",
      "qty": 1,
      "unitPrice": 100000,
      "total": 100000
    }
  ],
  "rabInitial": [
    {
      "itemNo": "1",
      "item": "Uraian Pekerjaan",
      "unit": "Unit / m / ls",
      "qty": 1,
      "unitPrice": 100000,
      "total": 100000
    }
  ]
}`,
          }),
        });

        if (aiResponse.ok) {
          const resJson = await aiResponse.json();
          const data = resJson.data || resJson.extracted;
          if (data) {
            if (data.projectInfo) {
              Object.assign(result.projectInfo, Object.fromEntries(
                Object.entries(data.projectInfo).filter(([_, v]) => Boolean(v))
              ));
            }
            if (Array.isArray(data.jusTek) && data.jusTek.length > 0) {
              for (const item of data.jusTek) {
                const key = item.changeId ? item.changeId.toUpperCase().trim() : normalizeItemKey(item.item);
                if (key) {
                  if (jusTekMap.has(key)) {
                    const prev = jusTekMap.get(key)!;
                    result.supersededItems?.push({
                      type: 'JusTek',
                      identifier: item.changeId || item.item,
                      olderSource: prev.sourceFile || 'Berkas Sebelumnya',
                      newerSource: file.name,
                      detail: `Memperbarui JusTek Word "${item.item}": Usulan [${item.proposed}] menggantikan [${prev.proposed}].`,
                    });
                  }
                  jusTekMap.set(key, { ...item, sourceFile: file.name });
                }
              }
            }
            if (Array.isArray(data.jusFin) && data.jusFin.length > 0) {
              for (const item of data.jusFin) {
                const key = item.changeId ? item.changeId.toUpperCase().trim() : normalizeItemKey(item.item);
                if (key) {
                  if (jusFinMap.has(key)) {
                    const prev = jusFinMap.get(key)!;
                    result.supersededItems?.push({
                      type: 'JusFin',
                      identifier: item.changeId || item.item,
                      olderSource: prev.sourceFile || 'Berkas Sebelumnya',
                      newerSource: file.name,
                      detail: `Memperbarui JusFin Word "${item.item}": Nilai Rp ${item.totalRevised} menggantikan Rp ${prev.totalRevised}.`,
                    });
                  }
                  jusFinMap.set(key, { ...item, sourceFile: file.name });
                }
              }
            }
            if (Array.isArray(data.rabRevised) && data.rabRevised.length > 0) {
              for (const item of data.rabRevised) {
                const key = item.itemNo && item.itemNo !== '-' ? `no_${item.itemNo.trim()}` : normalizeItemKey(item.item);
                if (key) rabRevMap.set(key, { ...item, sourceFile: file.name });
              }
            }
            if (Array.isArray(data.rabInitial) && data.rabInitial.length > 0) {
              for (const item of data.rabInitial) {
                const key = item.itemNo && item.itemNo !== '-' ? `no_${item.itemNo.trim()}` : normalizeItemKey(item.item);
                if (key) rabInitMap.set(key, { ...item, sourceFile: file.name });
              }
            }

            const totalItemsInFile =
              (data.rabRevised?.length || 0) +
              (data.jusTek?.length || 0) +
              (data.jusFin?.length || 0);

            result.fileSummaries.push({
              fileName: file.name,
              fileType: 'WORD',
              itemsExtracted: totalItemsInFile,
              recencyScore: recencyMeta.score,
              orderIndex: i + 1,
            });
          }
        }
      } catch (wordErr: any) {
        result.warnings.push(`Peringatan ekstraksi Word ${file.name}: ${wordErr.message}`);
      }
    }
    // Case 4: Plain text / markup file
    else {
      try {
        const text = await file.text();
        result.fileSummaries.push({
          fileName: file.name,
          fileType: 'TEXT',
          itemsExtracted: 1,
          recencyScore: recencyMeta.score,
          orderIndex: i + 1,
        });
      } catch {
        // ignore
      }
    }
  }

  // Populate final merged results from the maps, strictly filtering out any category headers or non-items
  result.rabInitial = Array.from(rabInitMap.values()).filter(
    (r) => !isCategoryHeaderOrNonItem(r.item, undefined, undefined, r.qty, r.unitPrice, r.total)
  );
  result.rabRevised = Array.from(rabRevMap.values()).filter(
    (r) => !isCategoryHeaderOrNonItem(r.item, undefined, undefined, r.qty, r.unitPrice, r.total)
  );
  result.jusTek = Array.from(jusTekMap.values())
    .filter((j) => !isCategoryHeaderOrNonItem(j.item, j.baseline, j.proposed))
    .map((j, idx) => ({
      ...j,
      changeId: `CHG-${String(idx + 1).padStart(3, '0')}`,
    }));
  result.jusFin = Array.from(jusFinMap.values())
    .filter(
      (f) => !isCategoryHeaderOrNonItem(f.item, undefined, undefined, undefined, undefined, Math.abs(f.totalInitial) + Math.abs(f.totalRevised))
    )
    .map((f, idx) => ({
      ...f,
      changeId: `CHG-${String(idx + 1).padStart(3, '0')}`,
    }));

  if (result.supersededItems && result.supersededItems.length > 0) {
    const summaryMsg = `[Penyesuaian Dokumen Terbaru] Terdeteksi ${result.supersededItems.length} poin perubahan yang diperbarui oleh berkas versi lebih baru. Sistem menggunakan data dari berkas terbaru.`;
    result.auditNotes?.push(summaryMsg);
  }

  // Deduplicate and synchronize JusTek & JusFin with RAB items if needed
  if (result.rabRevised.length > 0 && result.jusTek.length === 0) {
    result.jusTek = result.rabRevised
      .filter((r) => !isCategoryHeaderOrNonItem(r.item, undefined, undefined, r.qty, r.unitPrice, r.total))
      .map((r, idx) => {
        const init = result.rabInitial[idx];
        return {
          changeId: `CHG-${String(idx + 1).padStart(3, '0')}`,
          item: r.item,
          baseline: init ? `${init.qty} ${init.unit} @ Rp ${init.unitPrice.toLocaleString('id-ID')}` : 'Sesuai Kontrak Awal',
          proposed: `${r.qty} ${r.unit} @ Rp ${r.unitPrice.toLocaleString('id-ID')}`,
          cause: 'Penyesuaian kuantitas/spesifikasi sesuai dokumen Justifikasi Teknis & Lapangan.',
          risk: 'Potensi deviasi volume pekerjaan jika tidak diselaraskan.',
          benefit: 'Kesesuaian volume riil dan keabsahan pertanggungjawaban PMO.',
        };
      });
  }

  if (result.rabRevised.length > 0 && result.jusFin.length === 0) {
    result.jusFin = result.rabRevised
      .filter((r) => !isCategoryHeaderOrNonItem(r.item, undefined, undefined, r.qty, r.unitPrice, r.total))
      .map((r, idx) => {
        const init = result.rabInitial[idx] || r;
        const totInit = init.total || (init.qty * init.unitPrice);
        const totRev = r.total || (r.qty * r.unitPrice);
        return {
          changeId: `CHG-${String(idx + 1).padStart(3, '0')}`,
          item: r.item,
          totalInitial: totInit,
          totalRevised: totRev,
          statedDelta: totRev - totInit,
          justification: 'Penyesuaian nilai anggaran berdasarkan lembar justifikasi finansial.',
        };
      });
  }

  onProgress?.(`Ekstraksi selesai: Memproses ${files.length} berkas JusTek/JusFin/RAB.`, 100);
  return result;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
