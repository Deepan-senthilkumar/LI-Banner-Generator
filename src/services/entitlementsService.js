export const entitlementsService = {
  canUsePremiumTemplate(user) {
    return Boolean(user?.is_pro);
  },

  getExportFormats(user) {
    if (user?.is_pro) return ['png', 'jpg', 'pdf'];
    return ['png', 'jpg'];
  },
};

export default entitlementsService;
