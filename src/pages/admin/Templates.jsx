import React, { useEffect, useState } from 'react';
import adminPanelService from '../../features/admin/services/adminPanelService';
import useAdminData from '../../features/admin/hooks/useAdminData';
import { Loader2, Plus, Trash2, Save, Search } from 'lucide-react';

const initialTemplateForm = {
  name: '',
  category: 'minimal',
  style: 'Modern',
  thumbnail: '',
  textName: 'Your Name',
  textRole: 'Your Role',
  textCompany: 'Your Company',
  fontSize: 46,
  spacing: 40,
  alignment: 'left',
  bgColor: '#1d4350',
  bgEnd: '#a43931',
  textColor: '#ffffff',
  accentColor: '#ffffff',
  imageSize: 120,
  imageShape: 'circle',
  template: 'minimal',
};
const PAGE_SIZE = 6;

const toTemplatePayload = (form) => ({
  name: form.name,
  category: form.category,
  style: form.style,
  thumbnail: form.thumbnail || 'https://placehold.co/600x200/1e293b/ffffff?text=Template',
  config: {
    template: form.template,
    text: {
      name: form.textName,
      role: form.textRole,
      company: form.textCompany,
    },
    style: {
      fontSize: Number(form.fontSize),
      spacing: Number(form.spacing),
      alignment: form.alignment,
      colors: {
        background: form.bgColor,
        backgroundEnd: form.bgEnd,
        text: form.textColor,
        accent: form.accentColor,
      },
      image: {
        size: Number(form.imageSize),
        shape: form.imageShape,
      },
    },
  },
});

const fromTemplate = (template) => ({
  name: template.name || '',
  category: template.category || 'minimal',
  style: template.style || 'Modern',
  thumbnail: template.thumbnail || '',
  textName: template.config?.text?.name || 'Your Name',
  textRole: template.config?.text?.role || 'Your Role',
  textCompany: template.config?.text?.company || 'Your Company',
  fontSize: template.config?.style?.fontSize ?? 46,
  spacing: template.config?.style?.spacing ?? 40,
  alignment: template.config?.style?.alignment || 'left',
  bgColor: template.config?.style?.colors?.background || '#1d4350',
  bgEnd: template.config?.style?.colors?.backgroundEnd || '#a43931',
  textColor: template.config?.style?.colors?.text || '#ffffff',
  accentColor: template.config?.style?.colors?.accent || '#ffffff',
  imageSize: template.config?.style?.image?.size ?? 120,
  imageShape: template.config?.style?.image?.shape || 'circle',
  template: template.config?.template || template.category || 'minimal',
});

const AssetListEditor = ({ title, items, onAdd, onRemove, nameValue, setNameValue, urlValue, setUrlValue }) => (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
    <h3 className="font-semibold dark:text-white">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      <input
        className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
        placeholder="Name"
        value={nameValue}
        onChange={(e) => setNameValue(e.target.value)}
      />
      <input
        className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm md:col-span-2"
        placeholder="Image URL"
        value={urlValue}
        onChange={(e) => setUrlValue(e.target.value)}
      />
    </div>
    <button onClick={onAdd} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium">
      <Plus size={14} /> Add
    </button>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <img src={item.url} alt={item.name} className="w-full h-20 object-cover" />
          <div className="p-2 flex items-center justify-between gap-2">
            <span className="text-xs truncate">{item.name}</span>
            <button onClick={() => onRemove(item.id)} className="text-red-600">
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Templates = () => {
  const { data: templates, loading, refresh } = useAdminData(() => adminPanelService.getTemplates());
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialTemplateForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [editorContent, setEditorContent] = useState({ backgrounds: [], stickers: [] });
  const [bgName, setBgName] = useState('');
  const [bgUrl, setBgUrl] = useState('');
  const [stickerName, setStickerName] = useState('');
  const [stickerUrl, setStickerUrl] = useState('');
  const [savingAssets, setSavingAssets] = useState(false);

  useEffect(() => {
    adminPanelService.getEditorContentConfig().then(setEditorContent);
  }, []);

  const submitTemplate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = toTemplatePayload(form);
      if (editing) {
        await adminPanelService.updateTemplate(editing.id, payload);
      } else {
        await adminPanelService.createTemplate(payload);
      }
      setEditing(null);
      setForm(initialTemplateForm);
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (template) => {
    setEditing(template);
    setForm(fromTemplate(template));
  };

  const deleteTemplate = async (id) => {
    if (!confirm('Delete this template?')) return;
    await adminPanelService.deleteTemplate(id);
    if (editing?.id === id) {
      setEditing(null);
      setForm(initialTemplateForm);
    }
    refresh();
  };

  const addBackground = () => {
    if (!bgUrl.trim()) return;
    setEditorContent((prev) => ({
      ...prev,
      backgrounds: [...prev.backgrounds, { id: `bg_${Date.now()}`, name: bgName || 'Background', url: bgUrl }],
    }));
    setBgName('');
    setBgUrl('');
  };

  const addSticker = () => {
    if (!stickerUrl.trim()) return;
    setEditorContent((prev) => ({
      ...prev,
      stickers: [...prev.stickers, { id: `st_${Date.now()}`, name: stickerName || 'Sticker', url: stickerUrl }],
    }));
    setStickerName('');
    setStickerUrl('');
  };

  const removeBackground = (id) =>
    setEditorContent((prev) => ({ ...prev, backgrounds: prev.backgrounds.filter((item) => item.id !== id) }));
  const removeSticker = (id) =>
    setEditorContent((prev) => ({ ...prev, stickers: prev.stickers.filter((item) => item.id !== id) }));

  const saveEditorAssets = async () => {
    setSavingAssets(true);
    try {
      const saved = await adminPanelService.updateEditorContentConfig(editorContent);
      setEditorContent(saved);
    } finally {
      setSavingAssets(false);
    }
  };

  if (loading) return <div className="h-56 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  const filteredTemplates = templates.filter((template) => {
    const term = search.toLowerCase();
    if (!term) return true;
    return (
      (template.name || '').toLowerCase().includes(term) ||
      (template.category || '').toLowerCase().includes(term) ||
      (template.style || '').toLowerCase().includes(term)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filteredTemplates.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pagedTemplates = filteredTemplates.slice(start, start + PAGE_SIZE);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Templates & Editor Content</h1>

      <form onSubmit={submitTemplate} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold dark:text-white">{editing ? 'Edit Template' : 'Create Template'}</h2>
          {editing ? (
            <button type="button" onClick={() => { setEditing(null); setForm(initialTemplateForm); }} className="text-xs text-slate-500 hover:underline">
              Cancel edit
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Template name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          <input className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Style label" value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })} required />
          <input className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Thumbnail URL" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Default Name" value={form.textName} onChange={(e) => setForm({ ...form, textName: e.target.value })} />
          <input className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Default Role" value={form.textRole} onChange={(e) => setForm({ ...form, textRole: e.target.value })} />
          <input className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Default Company" value={form.textCompany} onChange={(e) => setForm({ ...form, textCompany: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <input type="number" className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Font size" value={form.fontSize} onChange={(e) => setForm({ ...form, fontSize: e.target.value })} />
          <input type="number" className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Spacing" value={form.spacing} onChange={(e) => setForm({ ...form, spacing: e.target.value })} />
          <select className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" value={form.alignment} onChange={(e) => setForm({ ...form, alignment: e.target.value })}>
            <option value="left">left</option>
            <option value="center">center</option>
            <option value="right">right</option>
          </select>
          <input type="number" className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="Image size" value={form.imageSize} onChange={(e) => setForm({ ...form, imageSize: e.target.value })} />
          <select className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" value={form.imageShape} onChange={(e) => setForm({ ...form, imageShape: e.target.value })}>
            <option value="circle">circle</option>
            <option value="square">square</option>
          </select>
          <input className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm" placeholder="template key" value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <label className="text-xs text-slate-500">Background <input type="color" className="mt-1 w-full h-9 rounded" value={form.bgColor} onChange={(e) => setForm({ ...form, bgColor: e.target.value })} /></label>
          <label className="text-xs text-slate-500">Gradient End <input type="color" className="mt-1 w-full h-9 rounded" value={form.bgEnd} onChange={(e) => setForm({ ...form, bgEnd: e.target.value })} /></label>
          <label className="text-xs text-slate-500">Text <input type="color" className="mt-1 w-full h-9 rounded" value={form.textColor} onChange={(e) => setForm({ ...form, textColor: e.target.value })} /></label>
          <label className="text-xs text-slate-500">Accent <input type="color" className="mt-1 w-full h-9 rounded" value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} /></label>
        </div>

        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium disabled:opacity-60">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {editing ? 'Update Template' : 'Create Template'}
        </button>
      </form>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search templates"
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
          />
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {pagedTemplates.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No templates found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Style</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedTemplates.map((template) => (
                <tr key={template.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3">{template.name}</td>
                  <td className="px-4 py-3">{template.category}</td>
                  <td className="px-4 py-3">{template.style}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => startEdit(template)} className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs">Edit</button>
                    <button onClick={() => deleteTemplate(template.id)} className="px-2 py-1 rounded bg-red-50 text-red-700 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Showing {pagedTemplates.length} of {filteredTemplates.length}</span>
        <div className="space-x-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40">Prev</button>
          <span>{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40">Next</button>
        </div>
      </div>

      <AssetListEditor
        title="Editor Background Presets"
        items={editorContent.backgrounds || []}
        onAdd={addBackground}
        onRemove={removeBackground}
        nameValue={bgName}
        setNameValue={setBgName}
        urlValue={bgUrl}
        setUrlValue={setBgUrl}
      />

      <AssetListEditor
        title="Editor Sticker/Visual Presets"
        items={editorContent.stickers || []}
        onAdd={addSticker}
        onRemove={removeSticker}
        nameValue={stickerName}
        setNameValue={setStickerName}
        urlValue={stickerUrl}
        setUrlValue={setStickerUrl}
      />

      <button
        onClick={saveEditorAssets}
        disabled={savingAssets}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium disabled:opacity-60"
      >
        {savingAssets ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Save Editor Content Changes
      </button>
    </div>
  );
};

export default Templates;
