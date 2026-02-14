import storage from './storage';

const TEMPLATES_KEY = 'templates';

const baseTemplateConfig = {
  style: {
    backgroundImage: { url: null, opacity: 0.28 },
    assets: [],
  },
};

const DEFAULT_TEMPLATES = [
  {
    id: 'minimal-1',
    name: 'Clean Slate',
    category: 'minimal',
    style: 'Modern',
    tags: ['clean', 'minimal', 'executive'],
    premium: false,
    featured: true,
    status: 'approved',
    useCount: 28,
    thumbnail: 'https://placehold.co/600x200/1e293b/ffffff?text=Minimal+Template',
    config: {
      template: 'minimal',
      text: { name: 'Your Name', role: 'Product Designer', company: 'Design.co' },
      style: {
        fontSize: 48,
        colors: { background: '#ffffff', backgroundEnd: '#f8fafc', text: '#0f172a', accent: '#3b82f6' },
        spacing: 40,
        alignment: 'left',
        image: { size: 120, shape: 'circle' },
      },
    },
  },
  {
    id: 'corp-1',
    name: 'Executive',
    category: 'corporate',
    style: 'Professional',
    tags: ['corporate', 'business', 'leadership'],
    premium: true,
    featured: true,
    status: 'approved',
    useCount: 67,
    thumbnail: 'https://placehold.co/600x200/1e3a8a/ffffff?text=Corporate+Template',
    config: {
      template: 'corporate',
      text: { name: 'Your Name', role: 'Business Development', company: 'Global Corp' },
      style: {
        fontSize: 42,
        colors: { background: '#1e3a8a', backgroundEnd: '#1e40af', text: '#ffffff', accent: '#fbbf24' },
        spacing: 30,
        alignment: 'center',
        image: { size: 140, shape: 'circle' },
      },
    },
  },
  {
    id: 'tech-1',
    name: 'Dev Terminal',
    category: 'developer',
    style: 'Dark',
    tags: ['developer', 'engineering', 'tech'],
    premium: false,
    featured: false,
    status: 'approved',
    useCount: 43,
    thumbnail: 'https://placehold.co/600x200/0f172a/22c55e?text=Dev+Template',
    config: {
      template: 'tech',
      text: { name: '<YourName />', role: 'Full Stack Developer', company: 'TechStartup' },
      style: {
        fontSize: 40,
        colors: { background: '#0f172a', backgroundEnd: '#1e293b', text: '#22c55e', accent: '#22c55e' },
        spacing: 35,
        alignment: 'left',
        image: { size: 120, shape: 'square' },
      },
    },
  },
  {
    id: 'creative-1',
    name: 'Bold Creator',
    category: 'creative',
    style: 'Vibrant',
    tags: ['creative', 'founder', 'personal brand'],
    premium: true,
    featured: true,
    status: 'approved',
    useCount: 82,
    thumbnail: 'https://placehold.co/600x200/db2777/ffffff?text=Creative+Template',
    config: {
      template: 'creative',
      text: { name: 'YOUR NAME', role: 'Content Creator', company: '@handle' },
      style: {
        fontSize: 56,
        colors: { background: '#db2777', backgroundEnd: '#9333ea', text: '#ffffff', accent: '#fcd34d' },
        spacing: 45,
        alignment: 'right',
        image: { size: 150, shape: 'circle' },
      },
    },
  },
];

const normalizeTemplate = (template) => ({
  ...template,
  tags: Array.isArray(template.tags) ? template.tags : [],
  premium: Boolean(template.premium),
  featured: Boolean(template.featured),
  status: template.status || 'approved',
  useCount: Number(template.useCount || 0),
  config: {
    ...baseTemplateConfig,
    ...(template.config || {}),
    style: {
      ...(baseTemplateConfig.style || {}),
      ...((template.config && template.config.style) || {}),
    },
  },
});

const readTemplates = () => {
  const saved = storage.get(TEMPLATES_KEY, null);
  if (Array.isArray(saved) && saved.length > 0) {
    return saved.map(normalizeTemplate);
  }
  storage.set(TEMPLATES_KEY, DEFAULT_TEMPLATES);
  return DEFAULT_TEMPLATES.map(normalizeTemplate);
};

const persistTemplates = (templates) => {
  storage.set(TEMPLATES_KEY, templates);
};

export const templateService = {
  getTemplates: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return readTemplates().filter((template) => template.status === 'approved');
  },

  getAllTemplatesRaw: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return readTemplates();
  },

  getTemplateById: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return readTemplates().find((template) => template.id === id) || null;
  },

  createTemplate: async (template) => {
    const templates = readTemplates();
    const created = normalizeTemplate({
      ...template,
      id: template.id || `tpl_${Date.now()}`,
      status: template.status || 'approved',
      tags: template.tags || [],
      premium: Boolean(template.premium),
      featured: Boolean(template.featured),
      useCount: Number(template.useCount || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    templates.push(created);
    persistTemplates(templates);
    return created;
  },

  updateTemplate: async (templateId, updates) => {
    const templates = readTemplates();
    const index = templates.findIndex((template) => template.id === templateId);
    if (index === -1) throw new Error('Template not found');

    const updated = normalizeTemplate({
      ...templates[index],
      ...updates,
      tags: updates.tags ?? templates[index].tags,
      premium: updates.premium ?? templates[index].premium,
      featured: updates.featured ?? templates[index].featured,
      status: updates.status ?? templates[index].status,
      useCount: updates.useCount ?? templates[index].useCount,
      config: {
        ...templates[index].config,
        ...(updates.config || {}),
        style: {
          ...(templates[index].config?.style || {}),
          ...(updates.config?.style || {}),
        },
      },
      updatedAt: new Date().toISOString(),
    });

    templates[index] = updated;
    persistTemplates(templates);
    return updated;
  },

  deleteTemplate: async (templateId) => {
    const templates = readTemplates().filter((template) => template.id !== templateId);
    persistTemplates(templates);
    return true;
  },

  getMarketplaceTemplates: async ({
    search = '',
    category = 'all',
    sortBy = 'featured',
    tags = [],
    includePremium = true,
  } = {}) => {
    const templates = (await templateService.getTemplates()).filter((template) => {
      if (!includePremium && template.premium) return false;
      if (category !== 'all' && template.category !== category) return false;
      if (tags.length > 0 && !tags.every((tag) => template.tags.includes(tag))) return false;

      const term = search.trim().toLowerCase();
      if (!term) return true;
      return (
        template.name.toLowerCase().includes(term) ||
        template.category.toLowerCase().includes(term) ||
        template.style.toLowerCase().includes(term) ||
        template.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    });

    const sorted = [...templates];
    if (sortBy === 'featured') {
      sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || b.useCount - a.useCount);
    } else if (sortBy === 'popular') {
      sorted.sort((a, b) => b.useCount - a.useCount);
    } else if (sortBy === 'newest') {
      sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  },

  incrementTemplateUsage: async (templateId) => {
    const template = await templateService.getTemplateById(templateId);
    if (!template) return null;
    return templateService.updateTemplate(templateId, { useCount: Number(template.useCount || 0) + 1 });
  },
};
