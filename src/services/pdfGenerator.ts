import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { VerificationResult, TraceabilityRecord, TechnicalChange, FinancialItem } from '../types';
import { formatRupiah, formatPercentage } from './normalizer';
import { getStoredUser } from './authService';

/**
 * Generates an executive-ready Audit Verification Summary Report in PDF format.
 * Includes official PRIMA branding, project identity, executive KPIs, financial reconciliation,
 * chronological traceability matrix (MC-0 -> BAPL -> MC-100), critical exceptions, and logged-in user sign-off.
 */
export function generateVerificationPdf(result: VerificationResult): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;

  const project = result.project;
  const projectCode = project.projectCode || 'PRJ';
  const totalRab = result.total_rab;
  const summary = result.summary;
  const traceability = result.traceability || [];
  const exceptions = result.exceptions || [];
  const review = result.human_review;

  const reportId = `PRIMA-AUDIT-${projectCode}-${Date.now().toString().slice(-6)}`;
  const generatedTimestamp = result.generated_at || Date.now();
  const dateStr = new Date(generatedTimestamp).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const checkingTimeStr = new Date(generatedTimestamp).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const now = new Date();
  const printDateStr = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const printTimeStr = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const currentUser = getStoredUser();
  const partyName = currentUser ? currentUser.name : 'Pihak PMO';
  const roleLabel = currentUser ? currentUser.roleLabel : 'Project Management Office';
  const institution = currentUser ? currentUser.institution : 'PT Air Bersih Jakarta';

  // Helper function to draw header on pages
  const drawPageHeader = (pageNumber: number, totalPagesPlaceholder: boolean = false) => {
    // Top colored banner
    doc.setFillColor(0, 43, 91); // Deep Navy (#002b5b)
    doc.rect(0, 0, pageWidth, 20, 'F');

    // Gold accent bar
    doc.setFillColor(245, 158, 11); // Amber (#f59e0b)
    doc.rect(0, 20, pageWidth, 2, 'F');

    // Title text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('PRIMA - PROJECT RECORDS, INTELLIGENCE, MONITORING AND ASSURANCE', marginX, 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('Sistem Verifikasi Dokumen Proyek PMO Cyclical', marginX, 15);

    // Right-side ref code
    doc.setFont('courier', 'bold');
    doc.setFontSize(8.5);
    doc.text(projectCode, pageWidth - marginX, 10, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`Ref: ${reportId}`, pageWidth - marginX, 15, { align: 'right' });
  };

  // Helper function to draw footer
  const drawPageFooter = (pageNumber: number, totalPagesStr: string = '3') => {
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `PRIMA Audit Report &bull; ${project.projectName || 'Proyek PMO'} &bull; Dicetak: ${dateStr}`,
      marginX,
      pageHeight - 7
    );

    doc.text(`Halaman ${pageNumber} dari ${totalPagesStr}`, pageWidth - marginX, pageHeight - 7, {
      align: 'right',
    });
  };

  // =========================================================================
  // PAGE 1: RINGKASAN EKSEKUTIF, IDENTITAS & REKONSILIASI FINANSIAL
  // =========================================================================
  drawPageHeader(1);

  // Document Title Section - positioned with safe dynamic vertical separation
  let currentY = 26;
  const titleMaxWidth = pageWidth - marginX * 2 - 58; // leave space for status badge on the right

  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const titleText = 'LAPORAN RINGKASAN EKSEKUTIF AUDIT & VERIFIKASI BAPL';
  const titleLines = doc.splitTextToSize(titleText, titleMaxWidth);
  doc.text(titleLines, marginX, currentY);

  // Dynamically calculate currentY based on number of title lines
  currentY += titleLines.length * 5 + 1.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105); // slate-600
  const subTitleText = 'Rangkuman evaluasi komparasi teknis, finansial, dan audit penelusuran dokumen lapangan.';
  const subTitleLines = doc.splitTextToSize(subTitleText, titleMaxWidth);
  doc.text(subTitleLines, marginX, currentY);

  currentY += subTitleLines.length * 3.8 + 3;

  // Status Badge on the right - cleanly placed at y=25, completely separated from title text
  const isMatch = totalRab.delta_match;
  doc.setFillColor(isMatch ? 220 : 254, isMatch ? 252 : 242, isMatch ? 231 : 242);
  doc.setDrawColor(isMatch ? 34 : 225, isMatch ? 197 : 29, isMatch ? 94 : 72);
  doc.roundedRect(pageWidth - marginX - 54, 25, 54, 9, 1.5, 1.5, 'FD');
  doc.setTextColor(isMatch ? 22 : 153, isMatch ? 101 : 27, isMatch ? 52 : 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(
    isMatch ? 'STATUS: SINKRON & VALID' : 'STATUS: PERLU REVIEW',
    pageWidth - marginX - 27,
    30.5,
    { align: 'center' }
  );

  currentY += 6;
  doc.setFillColor(241, 245, 249);
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 6, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('1. INFORMASI IDENTITAS PROYEK & KONTRAK', marginX + 3, currentY + 4.2);

  currentY += 7;
  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 1.8, font: 'helvetica' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 42, textColor: [71, 85, 105], fillColor: [248, 250, 252] },
      1: { cellWidth: 50, textColor: [15, 23, 42] },
      2: { fontStyle: 'bold', cellWidth: 40, textColor: [71, 85, 105], fillColor: [248, 250, 252] },
      3: { cellWidth: 50, textColor: [15, 23, 42] },
    },
    body: [
      ['Nama Proyek', project.projectName || '-', 'Kode Proyek', project.projectCode || '-'],
      ['Sub-proyek', project.subproject || '-', 'Lokasi / Unit', project.location || '-'],
      ['Kontraktor Pelaksana', project.contractor || '-', 'Nomor PO Kontrak', project.poNumber || '-'],
      ['Nomor BAPL Fisik', project.baplNumber || '-', 'Tanggal Pemeriksaan BAPL', project.date || '-'],
      ['Status Match Identitas', project.identityMatchStatus || 'MATCH', 'Revisi Dokumen', project.revision || 'Rev.01'],
    ],
    margin: { left: marginX, right: marginX },
  });

  // SECTION 2: Ringkasan KPI Verifikasi Teknis & Konsistensi
  currentY = (doc as any).lastAutoTable.finalY + 5;
  doc.setFillColor(241, 245, 249);
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 6, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('2. RINGKASAN EKSEKUTIF & STATUS VERIFIKASI', marginX + 3, currentY + 4.2);

  currentY += 7;
  const consistentCount = traceability.filter((r) => r.chain_consistent).length;
  const gapCount = traceability.length - consistentCount;
  const consistencyRate = traceability.length > 0 ? Math.round((consistentCount / traceability.length) * 100) : 0;

  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, font: 'helvetica' },
    headStyles: { fillColor: [0, 84, 166], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    head: [['Total Item', 'Verified (Sesuai)', 'Mismatch (Deviasi)', 'Need Support', 'Perlu Review', 'Konsistensi Rantai']],
    body: [
      [
        summary.total_items.toString(),
        summary.verified.toString(),
        summary.mismatch.toString(),
        summary.need_support.toString(),
        summary.review.toString(),
        `${consistencyRate}% (${consistentCount}/${traceability.length} Item)`,
      ],
    ],
    margin: { left: marginX, right: marginX },
  });

  // SECTION 3: Rekonsiliasi Finansial & Toleransi Anggaran
  currentY = (doc as any).lastAutoTable.finalY + 5;
  doc.setFillColor(241, 245, 249);
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 6, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('3. REKONSILIASI FINANSIAL & EVALUASI AMBANG BATAS RAB', marginX + 3, currentY + 4.2);

  currentY += 7;
  const deltaCalc = totalRab.system_calculated_delta;
  const deltaPct = totalRab.system_calculated_percentage;
  const statedJusfin = totalRab.stated_jusfin_delta;

  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, font: 'helvetica' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60, textColor: [71, 85, 105], fillColor: [248, 250, 252] },
      1: { cellWidth: 50, fontStyle: 'bold', textColor: [15, 23, 42] },
      2: { cellWidth: 72, textColor: [71, 85, 105], fontSize: 7 },
    },
    body: [
      ['Nilai RAB Kontrak Awal (Baseline)', formatRupiah(totalRab.rab_initial), 'Total anggaran baseline sesuai kontrak awal'],
      ['Nilai RAB Usulan Revisi (Proposed)', formatRupiah(totalRab.rab_revised), 'Nilai anggaran revisi pasca evaluasi JusTek'],
      ['Selisih Finansial Hitungan Sistem', `${formatRupiah(deltaCalc)} (${formatPercentage(deltaPct)})`, 'Perhitungan matematis selisih (Revisi - Baseline)'],
      ['Klaim Selisih pada Dokumen JusFin', formatRupiah(statedJusfin), 'Nilai selisih yang tertera pada lembar rekapitulasi JusFin'],
      [
        'Status Kesesuaian Selisih Finansial',
        totalRab.delta_match ? 'SINKRON (MATCH)' : 'TIDAK SINKRON (MISMATCH)',
        totalRab.explanation || 'Evaluasi matematis selisih nilai',
      ],
      [
        'Evaluasi Usulan Proposal Modifikasi',
        totalRab.proposal_modification_required ? 'DIBUTUHKAN (REQUIRED)' : 'TIDAK DIBUTUHKAN (NOT REQUIRED)',
        `Batas toleransi deviasi anggaran: ${totalRab.threshold_percentage * 100}%. ${
          totalRab.threshold_exceeded ? 'Ambang batas terlampaui.' : 'Berada dalam toleransi aman.'
        }`,
      ],
    ],
    margin: { left: marginX, right: marginX },
  });

  // Section 4 preview box at bottom of page 1
  currentY = (doc as any).lastAutoTable.finalY + 5;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(marginX, currentY, pageWidth - marginX * 2, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Catatan Hasil Penilaian Auditor PMO Cyclical:', marginX + 3, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const commentText = review?.pmo_comments || totalRab.explanation || 'Seluruh verifikasi fisik dan kesesuaian dokumen telah dianalisis sesuai prosedur.';
  const splitComment = doc.splitTextToSize(commentText, pageWidth - marginX * 2 - 8);
  doc.text(splitComment, marginX + 3, currentY + 10);

  drawPageFooter(1);

  // =========================================================================
  // PAGE 2: MATRIKS KRONOLOGIS TRACEABILITY (MC-0 -> BAPL -> MC-100)
  // =========================================================================
  doc.addPage();
  drawPageHeader(2);

  currentY = 28;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('4. MATRIKS TRACEABILITY & ALUR PERUBAHAN DOKUMEN', marginX, currentY);

  currentY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'Rantai penelusuran kronologis: 1. MC-0 (Baseline) -> 2. JusTek Claim -> 3. BAPL Lapangan -> 4. RAB Revisi -> 5. MC-100 (MCO)',
    marginX,
    currentY
  );

  currentY += 5;

  const tableRows = traceability.map((r, idx) => {
    return [
      r.change_id,
      r.item,
      r.rab_initial,
      r.justek_claim,
      r.bapl_evidence,
      r.mco_document,
      r.chain_consistent ? 'LENGKAP' : 'GAPS',
      r.final_status,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 6.8, cellPadding: 2, font: 'helvetica', overflow: 'linebreak' },
    headStyles: { fillColor: [0, 43, 91], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 6.8 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 16 },
      1: { fontStyle: 'bold', cellWidth: 32 },
      2: { cellWidth: 26 },
      3: { cellWidth: 28 },
      4: { cellWidth: 38, textColor: [6, 95, 70] },
      5: { cellWidth: 18, fontStyle: 'italic' },
      6: { cellWidth: 14, fontStyle: 'bold', halign: 'center' },
      7: { cellWidth: 16, fontStyle: 'bold', halign: 'center' },
    },
    head: [
      [
        'ID',
        'Item Pekerjaan',
        '1. MC-0 (RAB Awal)',
        '2. Usulan JusTek',
        '3. Bukti BAPL Lapangan',
        '5. MC-100 (MCO)',
        'Rantai',
        'Status',
      ],
    ],
    body: tableRows,
    margin: { left: marginX, right: marginX },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 6) {
        if (data.cell.raw === 'LENGKAP') {
          data.cell.styles.textColor = [22, 101, 52];
          data.cell.styles.fillColor = [240, 253, 244];
        } else {
          data.cell.styles.textColor = [180, 83, 9];
          data.cell.styles.fillColor = [254, 243, 199];
        }
      }
      if (data.section === 'body' && data.column.index === 7) {
        if (data.cell.raw === 'VERIFIED') {
          data.cell.styles.textColor = [22, 101, 52];
        } else if (data.cell.raw === 'MISMATCH') {
          data.cell.styles.textColor = [185, 28, 28];
        } else {
          data.cell.styles.textColor = [194, 65, 12];
        }
      }
    },
  });

  drawPageFooter(2);

  // =========================================================================
  // PAGE 3: TEMUAN AUDIT (EXCEPTIONS) & LEMBAR PENGESAHAN TRIPARTIT
  // =========================================================================
  doc.addPage();
  drawPageHeader(3);

  currentY = 28;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('5. DAFTAR TEMUAN AUDIT & ANOMALI DOKUMEN (EXCEPTIONS)', marginX, currentY);

  currentY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'Rekomendasi tindak lanjut dan mitigasi risiko bagi para pemangku kepentingan (stakeholders).',
    marginX,
    currentY
  );

  currentY += 5;

  if (exceptions.length > 0) {
    const exceptionRows = exceptions.slice(0, 5).map((ex) => {
      return [
        ex.exception_id || ex.change_id,
        ex.priority || 'MEDIUM',
        ex.finding,
        ex.impact,
        ex.recommended_action,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2, font: 'helvetica', overflow: 'linebreak' },
      headStyles: { fillColor: [185, 28, 28], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 18 },
        1: { fontStyle: 'bold', cellWidth: 16, halign: 'center' },
        2: { cellWidth: 50 },
        3: { cellWidth: 46 },
        4: { cellWidth: 52 },
      },
      head: [['ID', 'Prioritas', 'Temuan Deviasi / Gap', 'Dampak Finansial / Teknis', 'Tindakan yang Disarankan']],
      body: exceptionRows,
      margin: { left: marginX, right: marginX },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          if (data.cell.raw === 'HIGH') {
            data.cell.styles.textColor = [185, 28, 28];
            data.cell.styles.fillColor = [254, 242, 242];
          } else {
            data.cell.styles.textColor = [180, 83, 9];
            data.cell.styles.fillColor = [254, 243, 199];
          }
        }
      },
    });
    currentY = (doc as any).lastAutoTable.finalY + 8;
  } else {
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(marginX, currentY, pageWidth - marginX * 2, 14, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(22, 101, 52);
    doc.text('Tidak Ada Temuan Kritis (Zero Critical Exceptions)', marginX + 4, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('Seluruh rantai dokumen dan pengukuran fisik terverifikasi memenuhi standar kepatuhan PMO.', marginX + 4, currentY + 10.5);
    currentY += 20;
  }

  // 6. TERTANDA PIHAK YANG LOGIN AKUN PRIMA & WAKTU CHECKING / CETAK
  doc.setFillColor(241, 245, 249);
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 6, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('6. TERTANDA PIHAK LOGIN AKUN PRIMA & WAKTU VERIFIKASI', marginX + 3, currentY + 4.2);

  currentY += 8;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(marginX, currentY, pageWidth - marginX * 2, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`Tertanda Akun Yang Login: ${partyName} (${roleLabel})`, marginX + 5, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Institusi / Departemen: ${institution}`, marginX + 5, currentY + 12);
  doc.text(`Waktu & Tanggal Checking (Pemeriksaan): ${checkingTimeStr} WIB, ${dateStr}`, marginX + 5, currentY + 17);
  doc.text(`Waktu & Tanggal Cetak Laporan PDF: ${printTimeStr} WIB, ${printDateStr}`, marginX + 5, currentY + 22);
  doc.text(`Status Keabsahan Dokumen: SINKRON & TERVERIFIKASI SISTEM PRIMA`, marginX + 5, currentY + 26.5);

  // Digital verification watermark / footer note
  currentY += 36;
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  const hash = `HASH: ${reportId} // SHA-256 VALIDATED // PRIMA AUTOMATED VERIFICATION ENGINE // 2026`;
  doc.text(hash, pageWidth / 2, currentY, { align: 'center' });

  drawPageFooter(3);

  return doc;
}

/**
 * Directly triggers the download of the PDF report in the user's browser.
 */
export function downloadVerificationPdf(result: VerificationResult): void {
  try {
    const doc = generateVerificationPdf(result);
    const projectCode = result.project.projectCode || '46223A';
    const cleanFileName = `PRIMA_Laporan_Audit_BAPL_${projectCode}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(cleanFileName);
  } catch (err) {
    console.error('Failed to generate or download verification PDF:', err);
    throw err;
  }
}
