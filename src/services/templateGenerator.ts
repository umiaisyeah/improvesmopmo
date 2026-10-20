import * as XLSX from 'xlsx';

/**
 * Generates downloadable Excel template for users wishing to upload their own project data
 */
export function downloadSampleProjectExcel(): void {
  const wb = XLSX.utils.book_new();

  // Sheet: ProjectInfo
  const infoData = [
    ['Project Name', 'Cyclical Maintenance Substation Proteksi'],
    ['Project Code', '46223A'],
    ['Subproject', 'Penggantian IPP Area Gedung Distribusi'],
    ['Location', 'Area Gedung Distribusi & Filter'],
    ['Contractor', 'PT. Rekatama Elektrikal Mandiri'],
    ['PO Number', 'PO-46223-PLN-2026'],
    ['BAPL Number', 'BAPL/46223A/CM-IPP/VIII/2026'],
    ['Date', '2026-08-14'],
    ['Revision', 'Rev.01'],
  ];
  const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
  wsInfo['!cols'] = [{ wch: 20 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, wsInfo, 'ProjectInfo');

  // Sheet: RAB_Initial
  const rabInitialData = [
    ['Item No', 'Item Pekerjaan', 'Unit', 'Qty', 'Unit Price (Rp)', 'Total (Rp)'],
    ['1', 'Tiang Penyangga H = 5 Meter Hexagonal', 'Unit', 2, 18500000, 37000000],
    ['2', 'Tiang Penyangga H = 15 Meter Hexagonal', 'Unit', 1, 65000000, 65000000],
    ['3', 'Kabel Coaxial Down Conductor 2 x 35 mm', 'Meter', 180, 900000, 162000000],
    ['4', 'Jasa Pemasangan & Wiring NYA 70 mm', 'Lot', 1, 64350000, 64350000],
    ['5', 'Air Terminal Unit Proteksi Petir Standar', 'Unit', 1, 85000000, 85000000],
    ['6', 'Pekerjaan Sipil Pondasi & Aksesoris', 'Lot', 1, 574943278, 574943278],
    ['TOTAL', '', '', '', '', 988293278],
  ];
  const wsRABInit = XLSX.utils.aoa_to_sheet(rabInitialData);
  wsRABInit['!cols'] = [{ wch: 10 }, { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 18 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsRABInit, 'RAB_Initial');

  // Sheet: RAB_Revised
  const rabRevisedData = [
    ['Item No', 'Item Pekerjaan', 'Unit', 'Qty', 'Unit Price (Rp)', 'Total (Rp)'],
    ['1', 'Tiang Penyangga H = 5 Meter Round', 'Unit', 2, 18500000, 37000000],
    ['2', 'Tiang Penyangga H = 15 Meter Round Teleskopik', 'Unit', 1, 65000000, 65000000],
    ['3', 'Kabel Coaxial Down Conductor 2 x 35 mm', 'Meter', 176.4, 900000, 158760000],
    ['4', 'Jasa Pemasangan Coaxial & Grounding H=12m', 'Lot', 1, 58295376, 58295376],
    ['5', 'Air Terminal Unit ESE Radius 105m', 'Unit', 1, 85000000, 85000000],
    ['6', 'Pekerjaan Sipil Pondasi & Aksesoris', 'Lot', 1, 574943278, 574943278],
    ['TOTAL', '', '', '', '', 978998654],
  ];
  const wsRABRev = XLSX.utils.aoa_to_sheet(rabRevisedData);
  wsRABRev['!cols'] = [{ wch: 10 }, { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 18 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsRABRev, 'RAB_Revised');

  // Sheet: JusTek
  const justekData = [
    ['Change ID', 'Item Pekerjaan', 'Kondisi Awal (Baseline)', 'Usulan Perubahan (Proposed)', 'Alasan Teknis (Cause)', 'Risiko Bila Tidak Dilakukan', 'Manfaat Perubahan'],
    ['CHG-001', 'Tiang 5 m', 'Hexagonal 1.5"-2"-2.5"', 'Round 2"-2.5"', 'Ketersediaan material fabrikasi round cepat', 'Keterlambatan COD proyek', 'Stabilitas beban angin'],
    ['CHG-002', 'Tiang 15 m', 'Hexagonal 1.5"-2"-2.5"', 'Round 2"-2.5"-3"-4"-5"', 'Kebutuhan inersia tiang tinggi', 'Struktur melengkung di angin kencang', 'Kekuatan menara stabil'],
    ['CHG-003', 'Kabel Coaxial', '180 Meter', '176,4 Meter', 'Optimasi rute penarikan aktual', 'Pemborosan kabel terpotong', 'Efisiensi biaya & impedansi'],
    ['CHG-004', 'Jasa Pemasangan', 'NYA 70mm + clamp crane', 'Coaxial 2x35mm + grounding H=12m', 'Penyesuaian metode coaxial grounding', 'Induksi lonjakan petir ke gedung', 'Sistem terisolasi aman'],
    ['CHG-005', 'Air Terminal Unit', 'Standar konvensional', 'Early Streamer Emission (ESE) R=105m', 'Cakupan proteksi area gedung distribusi', 'Area luar switchyard tidak terproteksi', 'Jangkauan radius menyeluruh'],
  ];
  const wsJusTek = XLSX.utils.aoa_to_sheet(justekData);
  wsJusTek['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 28 }, { wch: 35 }, { wch: 35 }, { wch: 30 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, wsJusTek, 'JusTek');

  // Sheet: JusFin
  const jusfinData = [
    ['Change ID', 'Item Pekerjaan', 'Nilai Awal (Rp)', 'Nilai Revisi (Rp)', 'Delta Stated (Rp)', 'Justifikasi Finansial'],
    ['CHG-001', 'Tiang 5 m', 37000000, 37000000, 0, 'Harga lump-sum kontrak tetap'],
    ['CHG-002', 'Tiang 15 m', 65000000, 65000000, 0, 'Harga lump-sum kontrak tetap'],
    ['CHG-003', 'Kabel Coaxial', 162000000, 158760000, -3240000, 'Pengurangan volume 3,6m x Rp900.000'],
    ['CHG-004', 'Jasa Pemasangan', 64350000, 58295376, -6054624, 'Efisiensi penarikan rute lurus'],
    ['CHG-005', 'Air Terminal Unit', 85000000, 85000000, 0, 'Harga satuan kontrak tetap'],
    ['TOTAL', 'REKAPITULASI PROYEK', 988293278, 978998654, -1022408.58, 'Catatan: Angka rekap delta tertulis berbeda dengan selisih hitung'],
  ];
  const wsJusFin = XLSX.utils.aoa_to_sheet(jusfinData);
  wsJusFin['!cols'] = [{ wch: 12 }, { wch: 25 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, wsJusFin, 'JusFin');

  const binary = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([binary], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'Template_Project_Excel_46223A.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
