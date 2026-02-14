import { useAuth } from '../context/AuthContext';

export const PLANS = {
  FREE: 'free',
  PRO: 'pro',
};

export const FEATURES = {
  REMOVE_WATERMARK: 'remove_watermark',
  ALL_TEMPLATES: 'all_templates',
  UNLIMITED_PROJECTS: 'unlimited_projects',
  BRAND_KIT: 'brand_kit',
  HIGH_RES_EXPORT: 'high_res_export',
};

const ENTITLEMENTS = {
  [PLANS.FREE]: [
    // Basic features only
  ],
  [PLANS.PRO]: [
    FEATURES.REMOVE_WATERMARK,
    FEATURES.ALL_TEMPLATES,
    FEATURES.UNLIMITED_PROJECTS,
    FEATURES.BRAND_KIT,
    FEATURES.HIGH_RES_EXPORT,
  ],
};

export const useEntitlements = () => {
  const { user } = useAuth();
  const userPlan = user?.plan || PLANS.FREE;

  const canUseFeature = (feature) => {
    const allowedFeatures = ENTITLEMENTS[userPlan] || [];
    return allowedFeatures.includes(feature);
  };

  return {
    currentPlan: userPlan,
    canUseFeature,
    isPro: userPlan === PLANS.PRO,
  };
};
