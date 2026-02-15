import React, { useEffect, useMemo, useState } from 'react';
import { useEditor } from '../context/EditorContext';
import { useBannerBuilder } from '../hooks/useBannerBuilder';
import { useAuth } from '../../../context/AuthContext';
import { brandService } from '../../../services/brandService';
import { aiAssetService } from '../../../services/aiAssetService';
import editorContentService from '../../../services/editorContentService';
import { predefinedBackgrounds, predefinedStickers } from '../data/predefinedAssets';
import {
  Type,
  Layout,
  Palette,
  Image as ImageIcon,
  Sliders,
  Star,
  Sparkles,
  Loader2,
  Wand2,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Lock,
  MoveHorizontal,
  Shapes,
  Minus,
  Square,
  Circle,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const CANVAS_WIDTH = 1584;
const CANVAS_HEIGHT = 396;

const ControlsPanel = () => {
  const { state, setMode, setSelectedAsset, setSelectedAssets, clearSelectedAssets } = useEditor();
  const { updateText, updateStyle, applyTemplate, handleImageUpload } = useBannerBuilder();
  const { user } = useAuth();
  const { config, mode } = state;

  const selectedAssetIds = useMemo(() => (
    state.selectedAssetIds?.length
      ? state.selectedAssetIds
      : (state.selectedAssetId ? [state.selectedAssetId] : [])
  ), [state.selectedAssetIds, state.selectedAssetId]);

  const assets = config.style.assets || [];
  const selectedSet = useMemo(() => new Set(selectedAssetIds), [selectedAssetIds]);
  const selectedAssets = assets.filter((asset) => selectedSet.has(asset.id));
  const selectedAsset = selectedAssets.length === 1 ? selectedAssets[0] : null;
  const hasMultiSelection = selectedAssets.length > 1;

  const [brandKit, setBrandKit] = useState(null);
  const [generating, setGenerating] = useState(null);
  const [assetPrompt, setAssetPrompt] = useState('geometric professional shape');
  const [assetStyle, setAssetStyle] = useState('abstract');
  const [presetBackgrounds, setPresetBackgrounds] = useState(predefinedBackgrounds);
  const [presetStickers, setPresetStickers] = useState(predefinedStickers);

  useEffect(() => {
    if (user) brandService.getBrandKit(user.id).then(setBrandKit);
  }, [user]);

  useEffect(() => {
    editorContentService
      .getConfig()
      .then((loaded) => {
        setPresetBackgrounds(loaded.backgrounds?.length ? loaded.backgrounds : predefinedBackgrounds);
        setPresetStickers(loaded.stickers?.length ? loaded.stickers : predefinedStickers);
      })
      .catch(() => {
        setPresetBackgrounds(predefinedBackgrounds);
        setPresetStickers(predefinedStickers);
      });
  }, []);

  const normalizeAsset = (asset) => ({
    type: 'image',
    name: 'Asset',
    x: 120,
    y: 50,
    width: 210,
    height: 110,
    rotation: 0,
    opacity: 0.9,
    visible: true,
    locked: false,
    radius: 14,
    blendMode: 'normal',
    flipX: false,
    flipY: false,
    blur: 0,
    brightness: 100,
    contrast: 100,
    saturate: 100,
    shadow: false,
    shadowColor: 'rgba(0,0,0,0.35)',
    shadowBlur: 18,
    shadowOffsetX: 0,
    shadowOffsetY: 10,
    text: 'Edit text',
    color: '#ffffff',
    fontSize: 44,
    fontFamily: config.style.fontFamily || 'Inter',
    fontWeight: 700,
    align: 'left',
    lineHeight: 1.15,
    letterSpacing: 0,
    backgroundColor: 'transparent',
    shapeType: 'rectangle',
    fill: 'rgba(255,255,255,0.2)',
    strokeColor: 'rgba(255,255,255,0.8)',
    strokeWidth: 2,
    ...asset,
  });

  const updateAssets = (nextAssets, options = {}) => updateStyle('assets', nextAssets, options);

  const updateAssetById = (assetId, updater) => {
    updateAssets(assets.map((asset) => {
      if (asset.id !== assetId) return asset;
      const normalized = normalizeAsset(asset);
      return typeof updater === 'function' ? updater(normalized, asset) : { ...asset, ...updater };
    }));
  };

  const updateSelectedAssets = (updater) => {
    const selectedIds = new Set(selectedAssetIds);
    if (!selectedIds.size) return;
    updateAssets(assets.map((asset) => {
      if (!selectedIds.has(asset.id)) return asset;
      const normalized = normalizeAsset(asset);
      if (normalized.locked) return asset;
      return typeof updater === 'function' ? updater(normalized, asset) : { ...asset, ...updater };
    }));
  };

  const addAsset = (asset) => {
    const safeAsset = normalizeAsset({
      ...asset,
      id: asset.id || `asset_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      x: asset.x ?? Math.round(130 + Math.random() * 980),
      y: asset.y ?? Math.round(50 + Math.random() * 220),
      width: asset.width ?? 210,
      height: asset.height ?? 110,
      rotation: asset.rotation ?? (Math.random() * 16 - 8),
    });
    updateAssets([...assets, safeAsset]);
    setSelectedAsset(safeAsset.id);
  };

  const addTextBox = () => {
    addAsset({
      type: 'text',
      name: 'Text Box',
      width: 520,
      height: 140,
      text: 'Add your statement',
      fontSize: 46,
      fontWeight: 700,
      color: '#ffffff',
      lineHeight: 1.1,
    });
  };

  const addShape = (shapeType) => {
    if (shapeType === 'line') {
      addAsset({ type: 'shape', shapeType: 'line', name: 'Line', width: 300, height: 8, fill: '#ffffff', strokeColor: '#ffffff', strokeWidth: 8, radius: 999 });
      return;
    }
    addAsset({
      type: 'shape',
      shapeType,
      name: shapeType === 'circle' ? 'Circle' : 'Rectangle',
      width: shapeType === 'circle' ? 160 : 260,
      height: shapeType === 'circle' ? 160 : 120,
      fill: 'rgba(255,255,255,0.18)',
      strokeColor: 'rgba(255,255,255,0.65)',
      strokeWidth: 2,
      radius: shapeType === 'circle' ? 999 : 14,
    });
  };

  const removeAssets = (ids) => {
    if (!ids.length) return;
    const removeSet = new Set(ids);
    updateAssets(assets.filter((asset) => !removeSet.has(asset.id)));
    const nextSelection = selectedAssetIds.filter((id) => !removeSet.has(id));
    if (nextSelection.length) setSelectedAssets(nextSelection);
    else clearSelectedAssets();
  };

  const duplicateSelectedAssets = () => {
    if (!selectedAssets.length) return;
    const copies = selectedAssets.map((asset, index) => ({
      ...normalizeAsset(asset),
      id: `asset_${Date.now()}_${index}`,
      x: asset.x + 16,
      y: asset.y + 16,
      locked: false,
      visible: true,
    }));
    updateAssets([...assets, ...copies]);
    setSelectedAssets(copies.map((copy) => copy.id));
  };

  const moveSelectedLayer = (direction) => {
    if (!selectedAsset) return;
    const next = [...assets];
    const i = next.findIndex((asset) => asset.id === selectedAsset.id);
    const t = direction === 'up' ? i + 1 : i - 1;
    if (i < 0 || t < 0 || t >= next.length) return;
    [next[i], next[t]] = [next[t], next[i]];
    updateAssets(next);
  };

  const moveSelectedToBoundary = (direction) => {
    if (!selectedAssetIds.length) return;
    const selectedIds = new Set(selectedAssetIds);
    const selectedRows = assets.filter((asset) => selectedIds.has(asset.id));
    const otherRows = assets.filter((asset) => !selectedIds.has(asset.id));
    updateAssets(direction === 'front' ? [...otherRows, ...selectedRows] : [...selectedRows, ...otherRows]);
  };

  const alignSelectedAsset = (placement) => {
    updateSelectedAssets((asset) => {
      const next = { ...asset };
      if (placement === 'left') next.x = 0;
      if (placement === 'center') next.x = Math.round((CANVAS_WIDTH - asset.width) / 2);
      if (placement === 'right') next.x = CANVAS_WIDTH - asset.width;
      if (placement === 'top') next.y = 0;
      if (placement === 'middle') next.y = Math.round((CANVAS_HEIGHT - asset.height) / 2);
      if (placement === 'bottom') next.y = CANVAS_HEIGHT - asset.height;
      return next;
    });
  };

  const distributeSelectedAssets = (direction) => {
    if (selectedAssets.length < 3) return;
    const axis = direction === 'horizontal' ? 'x' : 'y';
    const sorted = [...selectedAssets].sort((a, b) => a[axis] - b[axis]);
    const start = sorted[0][axis];
    const end = sorted[sorted.length - 1][axis];
    const gap = (end - start) / (sorted.length - 1);
    const byId = Object.fromEntries(sorted.map((asset, idx) => [asset.id, Math.round(start + gap * idx)]));
    updateSelectedAssets((asset) => ({ ...asset, [axis]: byId[asset.id] }));
  };

  const applySelectedEffectPreset = (preset) => {
    if (!selectedAssets.length) return;

    if (preset === 'clean') {
      updateSelectedAssets({
        opacity: 1,
        blur: 0,
        brightness: 100,
        contrast: 100,
        saturate: 100,
        shadow: false,
      });
      return;
    }

    if (preset === 'cinematic') {
      updateSelectedAssets({
        opacity: 0.92,
        blur: 0,
        brightness: 92,
        contrast: 112,
        saturate: 118,
        shadow: true,
        shadowBlur: 24,
        shadowOffsetY: 14,
      });
      return;
    }

    if (preset === 'soft') {
      updateSelectedAssets({
        opacity: 0.95,
        blur: 1,
        brightness: 106,
        contrast: 92,
        saturate: 92,
        shadow: false,
      });
    }
  };

  const toggleGuide = (guideName) => {
    updateStyle('canvasGuides', {
      ...config.style.canvasGuides,
      [guideName]: !config.style.canvasGuides?.[guideName],
    });
  };

  const handleLayerClick = (assetId, event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey) setSelectedAsset(assetId, { toggle: true });
    else setSelectedAsset(assetId);
  };

  const layerType = (asset) => (normalizeAsset(asset).type === 'text' ? 'TXT' : normalizeAsset(asset).type === 'shape' ? 'SHP' : 'IMG');

  const handleMagicWrite = async (field, type) => {
    if (!user?.is_pro) return alert('Upgrade to Pro to use AI text features.');
    setGenerating(field);
    try {
      const res = await fetch(`${API_URL}/ai/generate-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: config.text.role || 'Professional', type }),
      });
      const data = await res.json();
      updateText(field, data.result);
    } catch (error) {
      console.error(error);
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateImage = async () => {
    if (!user?.is_pro) return alert('Upgrade to Pro to use AI image features.');
    setGenerating('image');
    try {
      const res = await fetch(`${API_URL}/ai/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Abstract professional background' }),
      });
      const data = await res.json();
      updateStyle('image', { ...config.style.image, url: data.url });
    } catch (error) {
      console.error(error);
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateAiAsset = async () => {
    setGenerating('asset');
    try {
      const generated = await aiAssetService.generateAsset({ prompt: assetPrompt, style: assetStyle });
      addAsset(generated);
    } catch (error) {
      console.error(error);
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 h-full border-r border-slate-200 dark:border-slate-800 flex flex-col">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex gap-2">
        <button onClick={() => setMode('beginner')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'beginner' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Beginner</button>
        <button onClick={() => setMode('advanced')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'advanced' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Advanced</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <section>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3"><Type size={16} /> Content</h3>
          <div className="space-y-3">
            <input type="text" placeholder="Full Name" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" value={config.text.name} onChange={(e) => updateText('name', e.target.value)} />
            <div className="flex items-center gap-2">
              <input type="text" placeholder="Role / Headline" className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" value={config.text.role} onChange={(e) => updateText('role', e.target.value)} />
              <button onClick={() => handleMagicWrite('role', 'headline')} disabled={generating === 'role'} className="px-2 py-2 text-[10px] rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700">{generating === 'role' ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}</button>
            </div>
            <div className="flex items-center gap-2">
              <input type="text" placeholder="Company / Location" className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" value={config.text.company} onChange={(e) => updateText('company', e.target.value)} />
              <button onClick={() => handleMagicWrite('company', 'tagline')} disabled={generating === 'company'} className="px-2 py-2 text-[10px] rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700">{generating === 'company' ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}</button>
            </div>
          </div>
        </section>

        {mode === 'beginner' && (
          <section>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3"><Layout size={16} /> Templates</h3>
            <div className="grid grid-cols-2 gap-2">
              {['minimal', 'corporate', 'tech', 'creative'].map((tpl) => (
                <button key={tpl} onClick={() => applyTemplate(tpl)} className={`p-3 rounded-xl border text-sm capitalize ${config.template === tpl ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'border-slate-200 dark:border-slate-700 dark:text-slate-300'}`}>{tpl}</button>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3"><ImageIcon size={16} /> Photo</h3>
          {brandKit?.logos?.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {brandKit.logos.map((logo) => (
                <button key={logo.id} onClick={() => updateStyle('image', { ...config.style.image, url: logo.url })} className="w-10 h-10 border border-slate-200 dark:border-slate-700 rounded-lg p-1 bg-white dark:bg-slate-800">
                  <img src={logo.url} alt={logo.name} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <label className="flex-1 cursor-pointer">
              <div className="w-full py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-center text-xs text-slate-500">Upload</div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files[0])} />
            </label>
            <button onClick={handleGenerateImage} disabled={generating === 'image'} className="flex-1 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 border border-blue-100 dark:border-blue-800 text-xs font-bold">{generating === 'image' ? '...' : 'AI Image'}</button>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3"><Shapes size={16} /> Elements</h3>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={addTextBox} className="py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm dark:text-slate-200">Add Text Box</button>
            <button onClick={() => addShape('rectangle')} className="py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm dark:text-slate-200 inline-flex items-center justify-center gap-1"><Square size={12} /> Rectangle</button>
            <button onClick={() => addShape('circle')} className="py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm dark:text-slate-200 inline-flex items-center justify-center gap-1"><Circle size={12} /> Circle</button>
            <button onClick={() => addShape('line')} className="py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm dark:text-slate-200 inline-flex items-center justify-center gap-1"><Minus size={12} /> Line</button>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3"><Wand2 size={16} /> Asset Studio</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 mb-2 block">Predefined Backgrounds</label>
              <div className="grid grid-cols-2 gap-2">
                {presetBackgrounds.map((bg) => (
                  <button key={bg.id} onClick={() => updateStyle('backgroundImage', { ...config.style.backgroundImage, url: bg.url })} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={bg.url} alt={bg.name} className="w-full h-16 object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-2 block">Predefined Visual Assets</label>
              <div className="grid grid-cols-2 gap-2">
                {presetStickers.map((sticker) => (
                  <button key={sticker.id} onClick={() => addAsset(sticker)} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={sticker.url} alt={sticker.name} className="w-full h-16 object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2">
              <label className="text-xs text-slate-500 block">AI Asset Prompt</label>
              <input type="text" value={assetPrompt} onChange={(e) => setAssetPrompt(e.target.value)} className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none dark:text-white text-sm" />
              <div className="flex gap-2">
                {['abstract', 'corporate', 'creative', 'minimal'].map((styleName) => (
                  <button key={styleName} onClick={() => setAssetStyle(styleName)} className={`px-2 py-1 rounded-md text-xs border capitalize ${assetStyle === styleName ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 border-blue-300' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}>{styleName}</button>
                ))}
              </div>
              <button onClick={handleGenerateAiAsset} disabled={generating === 'asset'} className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold">{generating === 'asset' ? 'Generating...' : 'Generate AI Asset'}</button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-slate-500">Layers ({assets.length})</label>
                {assets.length > 0 && <button onClick={() => { updateAssets([]); clearSelectedAssets(); }} className="text-[11px] text-red-600 hover:underline">Clear all</button>}
              </div>

              <div className="mb-2 grid grid-cols-3 gap-1">
                <button onClick={() => moveSelectedLayer('up')} disabled={!selectedAsset} className="text-[11px] py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40"><ArrowUp size={12} className="mx-auto" /></button>
                <button onClick={duplicateSelectedAssets} disabled={!selectedAssets.length} className="text-[11px] py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40"><Copy size={12} className="mx-auto" /></button>
                <button onClick={() => moveSelectedLayer('down')} disabled={!selectedAsset} className="text-[11px] py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40"><ArrowDown size={12} className="mx-auto" /></button>
              </div>

              <p className="text-[10px] text-slate-500 mb-2">Multi-select: Ctrl/Cmd + click on layers/canvas objects.</p>

              <div className="space-y-1">
                {assets.map((asset) => {
                  const isSelected = selectedSet.has(asset.id);
                  return (
                    <div key={asset.id} onClick={(e) => handleLayerClick(asset.id, e)} className={`flex items-center justify-between text-xs rounded-lg px-2 py-1 border cursor-pointer ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[9px] px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">{layerType(asset)}</span>
                        <span className="truncate pr-2">{asset.name || 'Untitled Asset'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); updateAssetById(asset.id, (x) => ({ ...x, visible: x.visible === false ? true : false })); }} className="text-slate-500 hover:text-slate-700 dark:text-slate-300">{asset.visible === false ? <EyeOff size={12} /> : <Eye size={12} />}</button>
                        <button onClick={(e) => { e.stopPropagation(); updateAssetById(asset.id, (x) => ({ ...x, locked: !x.locked })); }} className={`hover:text-slate-700 dark:text-slate-300 ${asset.locked ? 'text-amber-600' : 'text-slate-500'}`}><Lock size={12} /></button>
                        <button onClick={(e) => { e.stopPropagation(); removeAssets([asset.id]); }} className="text-red-500 hover:text-red-600"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedAssets.length > 0 && (
                <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate pr-2">{hasMultiSelection ? `${selectedAssets.length} layers selected` : (selectedAsset?.name || 'Selected Asset')}</p>
                    <span className="text-[10px] text-slate-500">Inspector</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => updateSelectedAssets({ locked: true })} className="py-1 rounded-md text-xs border border-slate-300 dark:border-slate-700">Lock</button>
                    <button onClick={() => updateSelectedAssets({ locked: false })} className="py-1 rounded-md text-xs border border-slate-300 dark:border-slate-700">Unlock</button>
                    <button onClick={() => removeAssets(selectedAssetIds)} className="py-1 rounded-md text-xs border border-red-200 text-red-600">Delete</button>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <button onClick={() => alignSelectedAsset('left')} className="py-1 rounded-md text-xs border border-slate-300 dark:border-slate-700">Left</button>
                    <button onClick={() => alignSelectedAsset('center')} className="py-1 rounded-md text-xs border border-slate-300 dark:border-slate-700">Center</button>
                    <button onClick={() => alignSelectedAsset('right')} className="py-1 rounded-md text-xs border border-slate-300 dark:border-slate-700">Right</button>
                    <button onClick={() => alignSelectedAsset('top')} className="py-1 rounded-md text-xs border border-slate-300 dark:border-slate-700">Top</button>
                    <button onClick={() => alignSelectedAsset('middle')} className="py-1 rounded-md text-xs border border-slate-300 dark:border-slate-700">Middle</button>
                    <button onClick={() => alignSelectedAsset('bottom')} className="py-1 rounded-md text-xs border border-slate-300 dark:border-slate-700">Bottom</button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => distributeSelectedAssets('horizontal')} className="py-1 rounded-md text-xs border border-slate-300 dark:border-slate-700">Distribute X</button>
                    <button onClick={() => distributeSelectedAssets('vertical')} className="py-1 rounded-md text-xs border border-slate-300 dark:border-slate-700">Distribute Y</button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => moveSelectedToBoundary('back')} className="py-1 rounded-md text-xs border border-slate-300 dark:border-slate-700">Send Back</button>
                    <button onClick={() => moveSelectedToBoundary('front')} className="py-1 rounded-md text-xs border border-slate-300 dark:border-slate-700">Bring Front</button>
                  </div>

                  {selectedAsset && (
                    <>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                        <label className="space-y-1">
                          <span>X</span>
                          <input type="number" value={Math.round(selectedAsset.x)} onChange={(e) => updateAssetById(selectedAsset.id, { x: Number(e.target.value || 0) })} className="w-full rounded-md px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                        </label>
                        <label className="space-y-1">
                          <span>Y</span>
                          <input type="number" value={Math.round(selectedAsset.y)} onChange={(e) => updateAssetById(selectedAsset.id, { y: Number(e.target.value || 0) })} className="w-full rounded-md px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                        </label>
                        <label className="space-y-1">
                          <span>Width</span>
                          <input type="number" min={20} value={Math.round(selectedAsset.width || 0)} onChange={(e) => updateAssetById(selectedAsset.id, { width: Math.max(20, Number(e.target.value || 0)) })} className="w-full rounded-md px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                        </label>
                        <label className="space-y-1">
                          <span>Height</span>
                          <input type="number" min={20} value={Math.round(selectedAsset.height || 0)} onChange={(e) => updateAssetById(selectedAsset.id, { height: Math.max(20, Number(e.target.value || 0)) })} className="w-full rounded-md px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                        </label>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => applySelectedEffectPreset('clean')} className="py-1 rounded-md text-xs border border-slate-300 dark:border-slate-700">Clean</button>
                        <button onClick={() => applySelectedEffectPreset('soft')} className="py-1 rounded-md text-xs border border-slate-300 dark:border-slate-700">Soft</button>
                        <button onClick={() => applySelectedEffectPreset('cinematic')} className="py-1 rounded-md text-xs border border-slate-300 dark:border-slate-700">Cinematic</button>
                      </div>

                      <div className="space-y-2 text-[11px]">
                        <label className="block text-slate-500">Opacity</label>
                        <input type="range" min={0} max={1} step={0.01} value={selectedAsset.opacity ?? 1} onChange={(e) => updateAssetById(selectedAsset.id, { opacity: Number(e.target.value) })} className="w-full accent-blue-600" />
                        <label className="block text-slate-500">Rotation</label>
                        <input type="range" min={-180} max={180} step={1} value={selectedAsset.rotation || 0} onChange={(e) => updateAssetById(selectedAsset.id, { rotation: Number(e.target.value) })} className="w-full accent-blue-600" />
                        <label className="block text-slate-500">Blur</label>
                        <input type="range" min={0} max={20} step={0.5} value={selectedAsset.blur || 0} onChange={(e) => updateAssetById(selectedAsset.id, { blur: Number(e.target.value) })} className="w-full accent-blue-600" />
                        <label className="block text-slate-500">Brightness</label>
                        <input type="range" min={40} max={180} step={1} value={selectedAsset.brightness || 100} onChange={(e) => updateAssetById(selectedAsset.id, { brightness: Number(e.target.value) })} className="w-full accent-blue-600" />
                        <label className="block text-slate-500">Contrast</label>
                        <input type="range" min={40} max={180} step={1} value={selectedAsset.contrast || 100} onChange={(e) => updateAssetById(selectedAsset.id, { contrast: Number(e.target.value) })} className="w-full accent-blue-600" />
                        <label className="block text-slate-500">Saturation</label>
                        <input type="range" min={0} max={200} step={1} value={selectedAsset.saturate || 100} onChange={(e) => updateAssetById(selectedAsset.id, { saturate: Number(e.target.value) })} className="w-full accent-blue-600" />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => updateAssetById(selectedAsset.id, { flipX: !selectedAsset.flipX })} className="py-1 rounded-md text-xs border border-slate-300 dark:border-slate-700">{selectedAsset.flipX ? 'Unflip X' : 'Flip X'}</button>
                        <button onClick={() => updateAssetById(selectedAsset.id, { flipY: !selectedAsset.flipY })} className="py-1 rounded-md text-xs border border-slate-300 dark:border-slate-700">{selectedAsset.flipY ? 'Unflip Y' : 'Flip Y'}</button>
                      </div>

                      <div className="space-y-2">
                        <button onClick={() => updateAssetById(selectedAsset.id, { shadow: !selectedAsset.shadow })} className="w-full py-1 rounded-md text-xs border border-slate-300 dark:border-slate-700">{selectedAsset.shadow ? 'Disable Shadow' : 'Enable Shadow'}</button>
                        {selectedAsset.shadow && (
                          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                            <label className="space-y-1">
                              <span>Shadow Blur</span>
                              <input type="number" min={0} max={80} value={Math.round(selectedAsset.shadowBlur || 0)} onChange={(e) => updateAssetById(selectedAsset.id, { shadowBlur: Number(e.target.value || 0) })} className="w-full rounded-md px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                            </label>
                            <label className="space-y-1">
                              <span>Shadow Y</span>
                              <input type="number" min={-80} max={80} value={Math.round(selectedAsset.shadowOffsetY || 0)} onChange={(e) => updateAssetById(selectedAsset.id, { shadowOffsetY: Number(e.target.value || 0) })} className="w-full rounded-md px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                            </label>
                          </div>
                        )}
                      </div>

                      {selectedAsset.type === 'text' && (
                        <textarea rows={3} value={selectedAsset.text || ''} onChange={(e) => updateAssetById(selectedAsset.id, { text: e.target.value })} className="w-full rounded-md px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-slate-200" />
                      )}
                      {selectedAsset.type === 'shape' && (
                        <div className="grid grid-cols-3 gap-2">
                          <select value={selectedAsset.shapeType || 'rectangle'} onChange={(e) => updateAssetById(selectedAsset.id, { shapeType: e.target.value })} className="rounded-md px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"><option value="rectangle">Rect</option><option value="circle">Circle</option><option value="line">Line</option></select>
                          <input type="color" value={selectedAsset.fill || '#ffffff'} onChange={(e) => updateAssetById(selectedAsset.id, { fill: e.target.value })} className="h-8 rounded" />
                          <input type="color" value={selectedAsset.strokeColor || '#ffffff'} onChange={(e) => updateAssetById(selectedAsset.id, { strokeColor: e.target.value })} className="h-8 rounded" />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {mode === 'advanced' && (
          <>
            <section>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3"><Sliders size={16} /> Layout</h3>
              <div className="space-y-3">
                <input type="range" min="20" max="100" value={config.style.fontSize} onChange={(e) => updateStyle('fontSize', parseInt(e.target.value, 10))} className="w-full accent-blue-600" />
                <input type="range" min="10" max="100" value={config.style.spacing} onChange={(e) => updateStyle('spacing', parseInt(e.target.value, 10))} className="w-full accent-blue-600" />
                <div className="flex gap-2">
                  {['left', 'center', 'right'].map((align) => (
                    <button key={align} onClick={() => updateStyle('alignment', align)} className={`flex-1 py-1 text-xs rounded border capitalize ${config.style.alignment === align ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300' : 'dark:text-slate-400 dark:border-slate-700'}`}>{align}</button>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3"><MoveHorizontal size={16} /> Guides</h3>
              <div className="space-y-2 text-sm">
                <button onClick={() => toggleGuide('safeArea')} className={`w-full py-2 rounded-lg border text-left px-3 ${config.style.canvasGuides?.safeArea ? 'bg-blue-50 text-blue-700 border-blue-300' : 'border-slate-300 dark:border-slate-700 dark:text-slate-300'}`}>Safe area</button>
                <button onClick={() => toggleGuide('grid')} className={`w-full py-2 rounded-lg border text-left px-3 ${config.style.canvasGuides?.grid ? 'bg-blue-50 text-blue-700 border-blue-300' : 'border-slate-300 dark:border-slate-700 dark:text-slate-300'}`}>Grid</button>
                <button onClick={() => toggleGuide('thirds')} className={`w-full py-2 rounded-lg border text-left px-3 ${config.style.canvasGuides?.thirds ? 'bg-blue-50 text-blue-700 border-blue-300' : 'border-slate-300 dark:border-slate-700 dark:text-slate-300'}`}>Thirds</button>
                <button onClick={() => toggleGuide('snap')} className={`w-full py-2 rounded-lg border text-left px-3 ${config.style.canvasGuides?.snap ? 'bg-blue-50 text-blue-700 border-blue-300' : 'border-slate-300 dark:border-slate-700 dark:text-slate-300'}`}>Snap to guides</button>
                <button onClick={() => toggleGuide('spacing')} className={`w-full py-2 rounded-lg border text-left px-3 ${config.style.canvasGuides?.spacing ? 'bg-blue-50 text-blue-700 border-blue-300' : 'border-slate-300 dark:border-slate-700 dark:text-slate-300'}`}>Spacing indicators</button>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3"><Palette size={16} /> Colors</h3>
              {brandKit?.palettes?.length > 0 && (
                <div className="mb-3 space-y-2">
                  {brandKit.palettes.map((palette) => (
                    <div key={palette.name}>
                      <label className="text-xs text-slate-500 mb-1 block flex items-center gap-1"><Star size={10} className="text-yellow-500" /> {palette.name}</label>
                      <div className="flex flex-wrap gap-1">
                        {palette.colors.map((color, i) => (
                          <button key={`${palette.name}-${i}`} className="w-6 h-6 rounded-full border border-slate-200" style={{ backgroundColor: color }} onClick={() => updateStyle('colors', { ...config.style.colors, background: color })} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <input type="color" value={config.style.colors.background} onChange={(e) => updateStyle('colors', { ...config.style.colors, background: e.target.value })} className="w-full h-8 rounded cursor-pointer" />
                <input type="color" value={config.style.colors.backgroundEnd} onChange={(e) => updateStyle('colors', { ...config.style.colors, backgroundEnd: e.target.value })} className="w-full h-8 rounded cursor-pointer" />
                <input type="color" value={config.style.colors.text} onChange={(e) => updateStyle('colors', { ...config.style.colors, text: e.target.value })} className="w-full h-8 rounded cursor-pointer" />
                <input type="color" value={config.style.colors.accent} onChange={(e) => updateStyle('colors', { ...config.style.colors, accent: e.target.value })} className="w-full h-8 rounded cursor-pointer" />
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default ControlsPanel;
