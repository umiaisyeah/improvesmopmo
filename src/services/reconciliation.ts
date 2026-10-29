import {
  Project,
  MasterItem,
  MasterItemMapping,
  ReconciliationRow,
  ReconciliationStatus,
  DocumentChronologyCheck,
  ProjectReadinessScore,
  BOQItem,
  BeritaAcaraItem,
} from '../types';
import { computeMatchScore, normalizeTechnicalTerms } from '../utils/matchingEngine';

/**
 * Finds the master item ID for a given raw item name or WBS code
 */
export function findMasterItemForRawText(
  rawText: string,
  wbsCode: string | undefined,
  masterItems: MasterItem[],
  mappings: MasterItemMapping[]
): MasterItem | null {
  // 1. Check existing confirmed or auto mapping first
  const existingMap = mappings.find(
    (m) =>
      m.rawText.toLowerCase() === rawText.toLowerCase() &&
      (m.status === 'CONFIRMED' || m.status === 'AUTO')
  );
  if (existingMap && existingMap.masterItemId) {
    const found = masterItems.find((mi) => mi.id === existingMap.masterItemId && mi.active);
    if (found) return found;
  }

  // 2. Check WBS code match
  if (wbsCode) {
    const codeMatch = masterItems.find(
      (mi) => mi.active && mi.code.toLowerCase() === wbsCode.toLowerCase()
    );
    if (codeMatch) return codeMatch;
  }

  // 3. Check exact canonical name or aliases match
  const normalizedRaw = normalizeTechnicalTerms(rawText);
  for (const mi of masterItems) {
    if (!mi.active) continue;
    if (normalizeTechnicalTerms(mi.canonicalName) === normalizedRaw) return mi;
    for (const alias of mi.aliases) {
      if (normalizeTechnicalTerms(alias) === normalizedRaw) return mi;
    }
  }

  // 4. Check highest match score >= 80
  let bestItem: MasterItem | null = null;
  let highestScore = 0;
  for (const mi of masterItems) {
    if (!mi.active) continue;
    const score = computeMatchScore(rawText, mi.canonicalName);
    if (score > highestScore) {
      highestScore = score;
      bestItem = mi;
    }
  }

  if (highestScore >= 80) return bestItem;

  return null;
}

/**
 * Three-way reconciliation logic per item: DED vs BA MC-0 vs BA Lapangan vs JT/JF
 */
export function performThreeWayReconciliation(
  project: Project,
  masterItems: MasterItem[],
  mappings: MasterItemMapping[],
  tolerancePct: number = 0
): {
  rows: ReconciliationRow[];
  summary: {
    totalItems: number;
    statusCounts: Record<ReconciliationStatus, number>;
    totalProblematicValue: number;
    supportedPercentage: number;
  };
} {
  const rows: ReconciliationRow[] = [];
  const handledMasterIds = new Set<string>();

  const jtItems = project.justifikasi?.items || [];
  const baList = project.beritaAcaraList || [];

  const baMc0List = baList.filter((b) => b.baType === 'MC-0');
  const baLapanganList = baList.filter((b) => b.baType === 'Peninjauan Lapangan' || b.baType === 'MC-100');

  const allBaMc0Items = baMc0List.flatMap((b) =>
    b.items.map((it) => ({ ...it, baId: b.id, baNumber: b.baNumber }))
  );
  const allBaLapanganItems = baLapanganList.flatMap((b) =>
    b.items.map((it) => ({ ...it, baId: b.id, baNumber: b.baNumber }))
  );

  // Group items by master item or create pseudo master entries
  jtItems.forEach((jtItem) => {
    const mi = findMasterItemForRawText(jtItem.itemName, jtItem.wbsCode, masterItems, mappings);

    const masterId = mi ? mi.id : `UNMAPPED-${jtItem.id}`;
    const masterCode = mi ? mi.code : jtItem.wbsCode || 'WBS-?';
    const masterName = mi ? mi.canonicalName : jtItem.itemName;

    if (handledMasterIds.has(masterId)) return;
    handledMasterIds.add(masterId);

    // Find corresponding BA items
    const mc0Match = allBaMc0Items.find((bai) => {
      if (mi) {
        const baiMi = findMasterItemForRawText(bai.rawNameInBA, bai.canonicalWbsCode, masterItems, mappings);
        return baiMi?.id === mi.id;
      }
      return bai.canonicalWbsCode === jtItem.wbsCode || computeMatchScore(jtItem.itemName, bai.rawNameInBA) >= 80;
    });

    const lapMatch = allBaLapanganItems.find((bai) => {
      if (mi) {
        const baiMi = findMasterItemForRawText(bai.rawNameInBA, bai.canonicalWbsCode, masterItems, mappings);
        return baiMi?.id === mi.id;
      }
      return bai.canonicalWbsCode === jtItem.wbsCode || computeMatchScore(jtItem.itemName, bai.rawNameInBA) >= 80;
    });

    const dedVol = jtItem.dedVolume;
    const jtFieldVol = jtItem.fieldVolume;
    const baMc0Vol = mc0Match ? mc0Match.measuredVolume : 0;
    const baLapVol = lapMatch ? lapMatch.measuredVolume : (mc0Match ? mc0Match.measuredVolume : 0);

    const claimedDiff = jtFieldVol - dedVol;
    const baDiff = baLapVol - dedVol;
    const volDelta = Math.abs(jtFieldVol - baLapVol);
    const deltaPct = baLapVol > 0 ? (volDelta / baLapVol) * 100 : (jtFieldVol > 0 ? 100 : 0);

    let status: ReconciliationStatus = 'SESUAI';
    let notes = 'Perubahan volume JT/JF terbukti sinkron dengan BA Lapangan.';

    if (!mi) {
      status = 'NAMA_BELUM_DIPETAKAN';
      notes = `Nama item '${jtItem.itemName}' belum terpetakan ke Master Item baku WBS.`;
    } else if (claimedDiff !== 0 && !mc0Match && !lapMatch) {
      status = 'TANPA_BUKTI';
      notes = `Klaim perubahan volume (${claimedDiff > 0 ? '+' : ''}${claimedDiff} ${jtItem.unit}) tidak ditemukan di BA MC-0 maupun BA Peninjauan Lapangan.`;
    } else if (jtFieldVol > baLapVol + (baLapVol * tolerancePct / 100)) {
      status = 'MELEBIHI_BA';
      notes = `Klaim volume JT/JF (${jtFieldVol} ${jtItem.unit}) melebihi hasil ukur BA Lapangan (${baLapVol} ${jtItem.unit}).`;
    } else if (volDelta > (baLapVol * tolerancePct / 100) && (mc0Match || lapMatch)) {
      status = 'VOLUME_BEDA';
      notes = `Terdapat selisih ${volDelta.toFixed(1)} ${jtItem.unit} antara klaim JT/JF (${jtFieldVol}) dan hasil ukur BA Lapangan (${baLapVol}).`;
    } else if (claimedDiff === 0 && Math.abs(baDiff) > 0) {
      status = 'TIDAK_DIKLAIM';
      notes = `Terdapat perubahan volume di BA Lapangan (${baLapVol} ${jtItem.unit}) tetapi tidak dimasukkan dalam usulan JT/JF.`;
    }

    rows.push({
      masterItemId: masterId,
      masterItemCode: masterCode,
      masterItemName: masterName,
      unit: jtItem.unit,
      unitPrice: jtItem.unitPrice,
      dedVolume: dedVol,
      baMc0Volume: baMc0Vol,
      baMc0Id: mc0Match?.baId,
      baLapanganVolume: baLapVol,
      baLapanganId: lapMatch?.baId,
      jtFieldVolume: jtFieldVol,
      claimedVolumeDiff: claimedDiff,
      baFieldVolumeDiff: baDiff,
      volumeDelta: volDelta,
      deltaPct: Number(deltaPct.toFixed(1)),
      status,
      notes,
      linkedBaId: jtItem.linkedBaId,
      linkedBaItemName: jtItem.linkedBaItemName,
      evidenceStatus: jtItem.evidenceStatus,
    });
  });

  // Check unmapped BA items that are in BA Lapangan but not in JT
  allBaLapanganItems.forEach((bai) => {
    const baiMi = findMasterItemForRawText(bai.rawNameInBA, bai.canonicalWbsCode, masterItems, mappings);
    const masterId = baiMi ? baiMi.id : `UNMAPPED-BA-${bai.id}`;
    if (!handledMasterIds.has(masterId)) {
      handledMasterIds.add(masterId);
      rows.push({
        masterItemId: masterId,
        masterItemCode: baiMi ? baiMi.code : bai.canonicalWbsCode || 'WBS-?',
        masterItemName: baiMi ? baiMi.canonicalName : bai.rawNameInBA,
        unit: bai.unit,
        unitPrice: 1000000,
        dedVolume: 0,
        baMc0Volume: 0,
        baLapanganVolume: bai.measuredVolume,
        baLapanganId: bai.baId,
        jtFieldVolume: 0,
        claimedVolumeDiff: 0,
        baFieldVolumeDiff: bai.measuredVolume,
        volumeDelta: bai.measuredVolume,
        deltaPct: 100,
        status: baiMi ? 'TIDAK_DIKLAIM' : 'NAMA_BELUM_DIPETAKAN',
        notes: baiMi
          ? `Item terukur di BA Lapangan (${bai.measuredVolume} ${bai.unit}) tetapi belum dimasukkan ke JT/JF.`
          : `Item BA '${bai.rawNameInBA}' belum terpetakan ke Master Item baku WBS.`,
      });
    }
  });

  // Calculate summary metrics
  const statusCounts: Record<ReconciliationStatus, number> = {
    SESUAI: 0,
    TANPA_BUKTI: 0,
    VOLUME_BEDA: 0,
    MELEBIHI_BA: 0,
    TIDAK_DIKLAIM: 0,
    NAMA_BELUM_DIPETAKAN: 0,
  };

  let totalProblematicValue = 0;

  rows.forEach((r) => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    if (r.status !== 'SESUAI') {
      totalProblematicValue += Math.abs(r.volumeDelta * r.unitPrice);
    }
  });

  const totalItems = rows.length;
  const supportedCount = statusCounts.SESUAI;
  const supportedPercentage = totalItems > 0 ? Math.round((supportedCount / totalItems) * 100) : 100;

  return {
    rows,
    summary: {
      totalItems,
      statusCounts,
      totalProblematicValue,
      supportedPercentage,
    },
  };
}

/**
 * Checks chronology and completeness of BA and JT/JF documents
 */
export function performChronologyCheck(project: Project): DocumentChronologyCheck[] {
  const checks: DocumentChronologyCheck[] = [];
  const baList = project.beritaAcaraList || [];
  const jt = project.justifikasi;

  const baMc0 = baList.find((b) => b.baType === 'MC-0');
  const baLap = baList.find((b) => b.baType === 'Peninjauan Lapangan' || b.baType === 'MC-100');

  // Check 1: BA Peninjauan Lapangan dated after BA MC-0
  if (!baMc0 || !baLap) {
    checks.push({
      id: 'CHRONO-1',
      title: 'Urutan Tanggal BA Lapangan vs MC-0',
      passed: false,
      explanation: 'Dokumen BA MC-0 atau BA Peninjauan Lapangan belum lengkap diunggah.',
    });
  } else {
    const mc0Date = new Date(baMc0.date);
    const lapDate = new Date(baLap.date);
    const passed = lapDate >= mc0Date;
    checks.push({
      id: 'CHRONO-1',
      title: 'Urutan Tanggal BA Lapangan vs MC-0',
      passed,
      explanation: passed
        ? `BA Peninjauan Lapangan (${baLap.date}) dilaksanakan setelah BA MC-0 (${baMc0.date}).`
        : `Anomali Kronologi: Tanggal BA Peninjauan Lapangan (${baLap.date}) mendahului BA MC-0 (${baMc0.date}).`,
    });
  }

  // Check 2: JT/JF dated after both BAs
  if (!jt) {
    checks.push({
      id: 'CHRONO-2',
      title: 'Urutan Tanggal Pengajuan JT/JF',
      passed: false,
      explanation: 'Dokumen Justifikasi Teknis / Finansial belum disusun.',
    });
  } else if (!baMc0 && !baLap) {
    checks.push({
      id: 'CHRONO-2',
      title: 'Urutan Tanggal Pengajuan JT/JF',
      passed: false,
      explanation: 'JT/JF diajukan sebelum Berita Acara Lapangan diterbitkan.',
    });
  } else {
    const jtDate = new Date(jt.submissionDate);
    const latestBaDate = new Date(
      Math.max(
        baMc0 ? new Date(baMc0.date).getTime() : 0,
        baLap ? new Date(baLap.date).getTime() : 0
      )
    );
    const passed = jtDate >= latestBaDate;
    checks.push({
      id: 'CHRONO-2',
      title: 'Urutan Tanggal Pengajuan JT/JF',
      passed,
      explanation: passed
        ? `JT/JF (${jt.submissionDate}) diajukan setelah verifikasi Berita Acara Lapangan (${latestBaDate.toISOString().split('T')[0]}).`
        : `Anomali Kronologi: JT/JF (${jt.submissionDate}) diajukan sebelum Berita Acara Lapangan selesai (${latestBaDate.toISOString().split('T')[0]}).`,
    });
  }

  // Check 3: Stationing completeness in BA items
  const allBaItems = baList.flatMap((b) => b.items);
  const itemsMissingStationing = allBaItems.filter(
    (it) => !it.stationing || it.stationing.trim() === '' || it.stationing === '-'
  );
  const stationingPassed = allBaItems.length > 0 && itemsMissingStationing.length === 0;
  checks.push({
    id: 'CHRONO-3',
    title: 'Kelengkapan Koordinat & Stationing BA',
    passed: stationingPassed,
    explanation: stationingPassed
      ? `Seluruh ${allBaItems.length} item Berita Acara terisi lokasi/stationing spesifik.`
      : `Ditemukan ${itemsMissingStationing.length} item BA yang belum mencantumkan lokasi/stationing yang jelas.`,
  });

  // Check 4: Tigres reference attached
  const baWithTigres = baList.filter(
    (b) => b.tigresRef && (b.tigresRef.docNumber || b.tigresRef.url || b.tigresRef.folderPath)
  );
  const tigresPassed = baList.length > 0 && baWithTigres.length === baList.length;
  checks.push({
    id: 'CHRONO-4',
    title: 'Referensi Tigres e-Archive',
    passed: tigresPassed,
    explanation: tigresPassed
      ? `Seluruh ${baList.length} Berita Acara telah memiliki tautan e-Archive Tigres resmi.`
      : `${baWithTigres.length} dari ${baList.length} Berita Acara terdaftar di Tigres. Harap lengkapi nomor arsip Tigres.`,
  });

  return checks;
}

/**
 * Calculates Project Document Readiness Score (0-100)
 */
export function calculateProjectReadinessScore(
  project: Project,
  masterItems: MasterItem[],
  mappings: MasterItemMapping[]
): ProjectReadinessScore {
  const recon = performThreeWayReconciliation(project, masterItems, mappings);
  const chronology = performChronologyCheck(project);

  const evidenceMatchPct = recon.summary.supportedPercentage;

  // Master mapping %
  const jtItems = project.justifikasi?.items || [];
  const mappedCount = jtItems.filter((it) =>
    findMasterItemForRawText(it.itemName, it.wbsCode, masterItems, mappings)
  ).length;
  const masterMappingPct = jtItems.length > 0 ? Math.round((mappedCount / jtItems.length) * 100) : 100;

  // Chronology %
  const passedChronoCount = chronology.filter((c) => c.passed).length;
  const chronologyPassed = passedChronoCount === chronology.length;
  const chronologyPct = Math.round((passedChronoCount / chronology.length) * 100);

  // BA completeness
  const baList = project.beritaAcaraList || [];
  const hasMc0 = baList.some((b) => b.baType === 'MC-0');
  const hasLap = baList.some((b) => b.baType === 'Peninjauan Lapangan');
  const baCompletenessPct = (hasMc0 ? 50 : 0) + (hasLap ? 50 : 0);

  // Weighted Total Score
  const totalScore = Math.round(
    evidenceMatchPct * 0.4 + masterMappingPct * 0.25 + chronologyPct * 0.2 + baCompletenessPct * 0.15
  );

  const pendingTasks: string[] = [];
  if (evidenceMatchPct < 100) {
    pendingTasks.push(`Selesaikan ${recon.rows.filter((r) => r.status !== 'SESUAI').length} item selisih/tanpa bukti BA`);
  }
  if (masterMappingPct < 100) {
    pendingTasks.push(`Petakan ${jtItems.length - mappedCount} item ke Master Item WBS baku`);
  }
  chronology.filter((c) => !c.passed).forEach((c) => {
    pendingTasks.push(c.explanation);
  });

  const blockingIssues = recon.rows.filter(
    (r) => r.status === 'TANPA_BUKTI' || r.status === 'MELEBIHI_BA' || r.status === 'NAMA_BELUM_DIPETAKAN'
  );

  return {
    projectId: project.id,
    totalScore,
    evidenceMatchPct,
    masterMappingPct,
    chronologyPassed,
    baCompletenessPct,
    pendingTasks,
    blockingIssues,
  };
}
