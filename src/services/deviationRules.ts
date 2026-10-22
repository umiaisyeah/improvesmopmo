import { Project, ProposalModifikasi } from '../types';

export interface DeviationResult {
  statedPct: number;
  calculatedPct: number;
  effectivePct: number;
  exceedsThreshold: boolean;
  summaryUnderstated: boolean;
  threshold: number;
}

export function calculateItemDeviationPct(project: Project): number {
  if (!project.justifikasi || !project.justifikasi.items || project.justifikasi.items.length === 0) {
    return 0;
  }
  const originalContract = project.justifikasi.financialSummary.originalContractValue || project.contractValue;
  if (!originalContract || originalContract === 0) return 0;

  let totalItemDeltaValue = 0;
  for (const item of project.justifikasi.items) {
    const deltaVol = item.fieldVolume - item.dedVolume;
    totalItemDeltaValue += deltaVol * item.unitPrice;
  }
  return (totalItemDeltaValue / originalContract) * 100;
}

export function getDeviation(project: Project, thresholdPct: number = 10): DeviationResult {
  const statedPct = project.justifikasi?.financialSummary.variancePercentage || (project.justificationDelta / project.contractValue) * 100;
  const calculatedPct = calculateItemDeviationPct(project);
  
  const absStated = Math.abs(statedPct);
  const absCalc = Math.abs(calculatedPct);
  
  let effectivePct = statedPct;
  if (absCalc > absStated) {
    effectivePct = calculatedPct;
  }

  const exceedsThreshold = Math.abs(effectivePct) > thresholdPct;
  const summaryUnderstated = calculatedPct - statedPct > 0.5;

  return {
    statedPct: Number(statedPct.toFixed(2)),
    calculatedPct: Number(calculatedPct.toFixed(2)),
    effectivePct: Number(effectivePct.toFixed(2)),
    exceedsThreshold,
    summaryUnderstated,
    threshold: thresholdPct,
  };
}

export function isProjectStopWork(project: Project, proposals: ProposalModifikasi[], thresholdPct: number = 10): boolean {
  const dev = getDeviation(project, thresholdPct);
  if (!dev.exceedsThreshold) return false;

  const projProposal = proposals.find(p => p.projectId === project.id);
  if (!projProposal) return true; // Exceeds threshold and no proposal exists

  const sucofindoApp = projProposal.approvals.find(a => a.party === 'SUCOFINDO');
  const pamjayaApp = projProposal.approvals.find(a => a.party === 'PAMJAYA');

  const isApproved = 
    projProposal.status === 'DISETUJUI' || 
    (sucofindoApp?.status === 'APPROVED' && pamjayaApp?.status === 'APPROVED');

  return !isApproved;
}
