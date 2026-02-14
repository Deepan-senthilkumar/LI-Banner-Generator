import storage from './storage';
import { predefinedBackgrounds, predefinedStickers } from '../features/editor/data/predefinedAssets';

const KEY = 'editor_content_config';

const defaultConfig = {
  backgrounds: predefinedBackgrounds,
  stickers: predefinedStickers,
};

const normalizeItems = (items = []) =>
  items
    .filter((item) => item && item.url)
    .map((item, idx) => ({
      id: item.id || `asset_${Date.now()}_${idx}`,
      name: item.name || `Item ${idx + 1}`,
      url: item.url,
    }));

const editorContentService = {
  async getConfig() {
    const saved = storage.get(KEY, null);
    if (!saved) {
      storage.set(KEY, defaultConfig);
      return defaultConfig;
    }
    return {
      backgrounds: normalizeItems(saved.backgrounds?.length ? saved.backgrounds : defaultConfig.backgrounds),
      stickers: normalizeItems(saved.stickers?.length ? saved.stickers : defaultConfig.stickers),
    };
  },

  async updateConfig(partial) {
    const current = await editorContentService.getConfig();
    const next = {
      backgrounds: normalizeItems(partial.backgrounds ?? current.backgrounds),
      stickers: normalizeItems(partial.stickers ?? current.stickers),
    };
    storage.set(KEY, next);
    return next;
  },
};

export default editorContentService;
