import { ProblemCategory } from '../types';

export type EvidenceStage = 'before' | 'after';
export type EvidenceSource = 'demo_illustration' | 'citizen_submitted' | 'municipal_submitted';

const DEMO_IMAGE_BY_CATEGORY: Record<ProblemCategory, Record<EvidenceStage, string>> = {
  traffic: {
    before: '/evidence/demo/traffic-signal-fault.svg',
    after: '/evidence/demo/traffic-signal-repaired.svg',
  },
  waste: {
    before: '/evidence/demo/waste-overflow.svg',
    after: '/evidence/demo/waste-cleared.svg',
  },
  water: {
    before: '/evidence/demo/water-pipeline-leak.svg',
    after: '/evidence/demo/water-pipeline-repaired.svg',
  },
  pollution: {
    before: '/evidence/demo/pollution-smoke.svg',
    after: '/evidence/demo/pollution-improved.svg',
  },
  electricity: {
    before: '/evidence/demo/streetlight-before.svg',
    after: '/evidence/demo/streetlight-after.svg',
  },
  road_pothole: {
    before: '/evidence/demo/road-pothole.svg',
    after: '/evidence/demo/road-repaired.svg',
  },
  emergency: {
    before: '/evidence/demo/public-infrastructure.svg',
    after: '/evidence/demo/public-infrastructure-repaired.svg',
  },
  public_safety: {
    before: '/evidence/demo/public-infrastructure.svg',
    after: '/evidence/demo/public-infrastructure-repaired.svg',
  },
};

const LEGACY_DEMO_IMAGE_IDS = [
  'photo-1530587191325',
  'photo-1584467735871',
  'photo-1515162816999',
  'photo-1509198397868',
  'photo-1517524008697',
  'photo-1506521781263',
  'photo-1516214104703',
  'photo-1581092160607',
];

const COMPLAINT_IMAGE_BY_ID: Record<string, string> = {
  'PRB-1075': '/images/complaints/streetlight-pole-42.jpg',
  'PRB-1083': '/images/complaints/traffic-signal-malfunction.jpg',
};

const COMPLAINT_IMAGE_FALLBACK_BY_ID: Record<string, string> = {
  'PRB-1075': '/images/complaints/prb-1075-streetlight-fault.svg',
  'PRB-1083': '/images/complaints/prb-1083-traffic-queue.jpg',
};

export const getComplaintImageUrl = (id: string, ...imageUrls: Array<string | undefined>): string | undefined =>
  COMPLAINT_IMAGE_BY_ID[id] || imageUrls.find((url) => Boolean(url));

export const getComplaintImageFallbackUrl = (id: string): string | undefined =>
  COMPLAINT_IMAGE_FALLBACK_BY_ID[id];

export const getDemoEvidenceImage = (
  category: ProblemCategory,
  stage: EvidenceStage,
  title?: string,
): string => {
  if (category === 'water' && title?.toLowerCase().includes('drain')) {
    return stage === 'before'
      ? '/evidence/demo/drainage-clog.svg'
      : '/evidence/demo/drainage-cleared.svg';
  }
  return DEMO_IMAGE_BY_CATEGORY[category][stage];
};

export const isDemoEvidenceUrl = (url?: string): boolean => {
  if (!url) return false;
  return url.includes('/evidence/demo/') || LEGACY_DEMO_IMAGE_IDS.some((imageId) => url.includes(imageId));
};

export const getEvidenceDisplayUrl = (
  url: string | undefined,
  category: ProblemCategory,
  stage: EvidenceStage,
  title?: string,
): string | undefined => {
  if (!url) return undefined;
  return isDemoEvidenceUrl(url) ? getDemoEvidenceImage(category, stage, title) : url;
};

export const getEvidenceSource = (
  source: EvidenceSource | undefined,
  url: string | undefined,
  defaultSource: Exclude<EvidenceSource, 'demo_illustration'>,
): EvidenceSource => isDemoEvidenceUrl(url) ? 'demo_illustration' : source || defaultSource;
