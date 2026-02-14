import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useEditor } from '../context/EditorContext';

const CANVAS_WIDTH = 1584;
const CANVAS_HEIGHT = 396;
const SNAP_THRESHOLD = 8;

const isTypingTarget = (target) => {
  if (!target) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const overlaps = (aStart, aEnd, bStart, bEnd) => {
  return Math.max(aStart, bStart) <= Math.min(aEnd, bEnd);
};

const getBounds = (asset) => ({
  left: asset.x,
  top: asset.y,
  right: asset.x + asset.width,
  bottom: asset.y + asset.height,
  centerX: asset.x + asset.width / 2,
  centerY: asset.y + asset.height / 2,
});

const getGroupBounds = (assets) => {
  if (!assets.length) {
    return {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      centerX: 0,
      centerY: 0,
    };
  }

  const left = Math.min(...assets.map((asset) => asset.x));
  const top = Math.min(...assets.map((asset) => asset.y));
  const right = Math.max(...assets.map((asset) => asset.x + asset.width));
  const bottom = Math.max(...assets.map((asset) => asset.y + asset.height));
  return {
    left,
    top,
    right,
    bottom,
    centerX: (left + right) / 2,
    centerY: (top + bottom) / 2,
  };
};

const BannerCanvas = memo(({ canvasRef }) => {
  const {
    state,
    updateStyle,
    setSelectedAsset,
    setSelectedAssets,
    clearSelectedAssets,
    pushUndoCheckpoint,
  } = useEditor();
  const { config } = state;
  const selectedAssetIds = state.selectedAssetIds?.length
    ? state.selectedAssetIds
    : (state.selectedAssetId ? [state.selectedAssetId] : []);

  const { text, style } = config;
  const backgroundImage = style.backgroundImage || { url: null, opacity: 0.28 };
  const visualAssets = style.assets || [];
  const interactionRef = useRef(null);
  const [snapGuides, setSnapGuides] = useState([]);
  const [spacingGuides, setSpacingGuides] = useState([]);

  const selectedSet = useMemo(() => new Set(selectedAssetIds), [selectedAssetIds]);

  const normalizeAsset = (asset) => ({
    type: 'image',
    name: 'Asset',
    opacity: 0.9,
    rotation: 0,
    visible: true,
    locked: false,
    radius: 14,
    blendMode: 'normal',
    flipX: false,
    flipY: false,
    x: 120,
    y: 50,
    width: 210,
    height: 110,
    text: 'Edit text',
    color: '#ffffff',
    fontSize: 44,
    fontFamily: style.fontFamily || 'Inter',
    fontWeight: 700,
    align: 'left',
    lineHeight: 1.15,
    letterSpacing: 0,
    padding: 8,
    backgroundColor: 'transparent',
    shapeType: 'rectangle',
    fill: 'rgba(255,255,255,0.2)',
    strokeColor: 'rgba(255,255,255,0.8)',
    strokeWidth: 2,
    ...asset,
  });

  const collectSnapTargets = (excludedIds = new Set()) => {
    const vertical = [
      { value: 0, label: 'canvas-left' },
      { value: CANVAS_WIDTH / 2, label: 'canvas-center' },
      { value: CANVAS_WIDTH, label: 'canvas-right' },
    ];
    const horizontal = [
      { value: 0, label: 'canvas-top' },
      { value: CANVAS_HEIGHT / 2, label: 'canvas-middle' },
      { value: CANVAS_HEIGHT, label: 'canvas-bottom' },
    ];

    if (style.canvasGuides?.safeArea) {
      const inset = 24;
      vertical.push({ value: inset, label: 'safe-left' });
      vertical.push({ value: CANVAS_WIDTH - inset, label: 'safe-right' });
      horizontal.push({ value: inset, label: 'safe-top' });
      horizontal.push({ value: CANVAS_HEIGHT - inset, label: 'safe-bottom' });
    }

    if (style.canvasGuides?.thirds) {
      vertical.push({ value: CANVAS_WIDTH / 3, label: 'third-1' });
      vertical.push({ value: (CANVAS_WIDTH * 2) / 3, label: 'third-2' });
      horizontal.push({ value: CANVAS_HEIGHT / 3, label: 'third-1' });
      horizontal.push({ value: (CANVAS_HEIGHT * 2) / 3, label: 'third-2' });
    }

    visualAssets.forEach((rawAsset) => {
      if (excludedIds.has(rawAsset.id)) return;
      const asset = normalizeAsset(rawAsset);
      if (!asset.visible) return;
      vertical.push({ value: asset.x, label: `${asset.id}:left` });
      vertical.push({ value: asset.x + asset.width / 2, label: `${asset.id}:center` });
      vertical.push({ value: asset.x + asset.width, label: `${asset.id}:right` });
      horizontal.push({ value: asset.y, label: `${asset.id}:top` });
      horizontal.push({ value: asset.y + asset.height / 2, label: `${asset.id}:middle` });
      horizontal.push({ value: asset.y + asset.height, label: `${asset.id}:bottom` });
    });

    return { vertical, horizontal };
  };

  const findBestSnap = (candidates, targets) => {
    let best = null;
    candidates.forEach((candidate) => {
      targets.forEach((target) => {
        const delta = target.value - candidate.value;
        const absDelta = Math.abs(delta);
        if (absDelta > SNAP_THRESHOLD) return;
        if (!best || absDelta < best.absDelta) {
          best = {
            delta,
            absDelta,
            targetValue: target.value,
            targetLabel: target.label,
            candidateKey: candidate.key,
          };
        }
      });
    });
    return best;
  };

  const buildSpacingGuides = (movingBounds, excludedIds = new Set()) => {
    if (!style.canvasGuides?.spacing) return [];

    const others = visualAssets
      .map((asset) => normalizeAsset(asset))
      .filter((asset) => asset.visible && !excludedIds.has(asset.id));
    if (!others.length) return [];

    let nearestLeft = null;
    let nearestRight = null;
    let nearestTop = null;
    let nearestBottom = null;

    others.forEach((asset) => {
      const bounds = getBounds(asset);

      if (overlaps(bounds.top, bounds.bottom, movingBounds.top, movingBounds.bottom)) {
        if (bounds.right <= movingBounds.left) {
          const distance = movingBounds.left - bounds.right;
          if (!nearestLeft || distance < nearestLeft.distance) {
            nearestLeft = { bounds, distance };
          }
        }
        if (bounds.left >= movingBounds.right) {
          const distance = bounds.left - movingBounds.right;
          if (!nearestRight || distance < nearestRight.distance) {
            nearestRight = { bounds, distance };
          }
        }
      }

      if (overlaps(bounds.left, bounds.right, movingBounds.left, movingBounds.right)) {
        if (bounds.bottom <= movingBounds.top) {
          const distance = movingBounds.top - bounds.bottom;
          if (!nearestTop || distance < nearestTop.distance) {
            nearestTop = { bounds, distance };
          }
        }
        if (bounds.top >= movingBounds.bottom) {
          const distance = bounds.top - movingBounds.bottom;
          if (!nearestBottom || distance < nearestBottom.distance) {
            nearestBottom = { bounds, distance };
          }
        }
      }
    });

    const guides = [];
    const maxDistance = 220;

    if (nearestLeft && nearestLeft.distance <= maxDistance) {
      const y = clamp((Math.max(nearestLeft.bounds.top, movingBounds.top) + Math.min(nearestLeft.bounds.bottom, movingBounds.bottom)) / 2, 0, CANVAS_HEIGHT);
      guides.push({
        id: 'space-left',
        x1: nearestLeft.bounds.right,
        y1: y,
        x2: movingBounds.left,
        y2: y,
        label: `${Math.round(nearestLeft.distance)} px`,
      });
    }
    if (nearestRight && nearestRight.distance <= maxDistance) {
      const y = clamp((Math.max(nearestRight.bounds.top, movingBounds.top) + Math.min(nearestRight.bounds.bottom, movingBounds.bottom)) / 2, 0, CANVAS_HEIGHT);
      guides.push({
        id: 'space-right',
        x1: movingBounds.right,
        y1: y,
        x2: nearestRight.bounds.left,
        y2: y,
        label: `${Math.round(nearestRight.distance)} px`,
      });
    }
    if (nearestTop && nearestTop.distance <= maxDistance) {
      const x = clamp((Math.max(nearestTop.bounds.left, movingBounds.left) + Math.min(nearestTop.bounds.right, movingBounds.right)) / 2, 0, CANVAS_WIDTH);
      guides.push({
        id: 'space-top',
        x1: x,
        y1: nearestTop.bounds.bottom,
        x2: x,
        y2: movingBounds.top,
        label: `${Math.round(nearestTop.distance)} px`,
      });
    }
    if (nearestBottom && nearestBottom.distance <= maxDistance) {
      const x = clamp((Math.max(nearestBottom.bounds.left, movingBounds.left) + Math.min(nearestBottom.bounds.right, movingBounds.right)) / 2, 0, CANVAS_WIDTH);
      guides.push({
        id: 'space-bottom',
        x1: x,
        y1: movingBounds.bottom,
        x2: x,
        y2: nearestBottom.bounds.top,
        label: `${Math.round(nearestBottom.distance)} px`,
      });
    }

    return guides;
  };

  const updateAssets = (nextAssets, options = {}) => {
    updateStyle('assets', nextAssets, options);
  };

  const updateAssetById = (assetId, updater, options = {}) => {
    const nextAssets = visualAssets.map((asset) => {
      if (asset.id !== assetId) return asset;
      return typeof updater === 'function' ? updater(asset) : { ...asset, ...updater };
    });
    updateAssets(nextAssets, options);
  };

  const updateSelectedAssets = (updater, options = {}) => {
    const selectedIds = new Set(selectedAssetIds);
    if (!selectedIds.size) return;

    const nextAssets = visualAssets.map((asset) => {
      if (!selectedIds.has(asset.id)) return asset;
      const normalized = normalizeAsset(asset);
      if (normalized.locked) return asset;
      if (typeof updater === 'function') return updater(normalized, asset);
      return { ...asset, ...updater };
    });
    updateAssets(nextAssets, options);
  };

  const removeAssets = (assetIds) => {
    if (!assetIds.length) return;
    const removeSet = new Set(assetIds);
    updateAssets(visualAssets.filter((asset) => !removeSet.has(asset.id)));
    clearSelectedAssets();
  };

  const getScale = () => {
    if (!canvasRef.current) return 1;
    const rect = canvasRef.current.getBoundingClientRect();
    return rect.width > 0 ? rect.width / CANVAS_WIDTH : 1;
  };

  const toCanvasPoint = (clientX, clientY, scale) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / scale,
      y: (clientY - rect.top) / scale,
    };
  };

  const beginAssetInteraction = (event, rawAsset, mode) => {
    event.stopPropagation();
    const asset = normalizeAsset(rawAsset);
    const wantsToggle = event.metaKey || event.ctrlKey || event.shiftKey;

    if (wantsToggle && mode === 'move') {
      setSelectedAsset(asset.id, { toggle: true });
      return;
    }

    if (!selectedSet.has(asset.id)) {
      setSelectedAsset(asset.id);
    }

    const interactionIds =
      mode === 'move' && selectedSet.has(asset.id) && selectedAssetIds.length > 1
        ? selectedAssetIds
        : [asset.id];

    const unlockedIds = interactionIds.filter((id) => {
      const target = normalizeAsset(visualAssets.find((item) => item.id === id));
      return Boolean(target && !target.locked);
    });

    if (!unlockedIds.length) return;

    pushUndoCheckpoint();

    const scale = getScale();
    const startPoint = toCanvasPoint(event.clientX, event.clientY, scale);
    const startAssets = Object.fromEntries(
      unlockedIds.map((id) => {
        const value = normalizeAsset(visualAssets.find((item) => item.id === id));
        return [id, value];
      }),
    );
    const targetStart = startAssets[asset.id] || asset;
    const center = {
      x: targetStart.x + targetStart.width / 2,
      y: targetStart.y + targetStart.height / 2,
    };
    const startAngle = Math.atan2(startPoint.y - center.y, startPoint.x - center.x);

    interactionRef.current = {
      mode,
      scale,
      startPoint,
      targetId: asset.id,
      ids: unlockedIds,
      startAssets,
      startAngle,
    };
  };

  useEffect(() => {
    const onPointerMove = (event) => {
      const interaction = interactionRef.current;
      if (!interaction) return;

      const currentPoint = toCanvasPoint(event.clientX, event.clientY, interaction.scale);
      const dx = currentPoint.x - interaction.startPoint.x;
      const dy = currentPoint.y - interaction.startPoint.y;

      if (interaction.mode === 'move') {
        const interactionIds = new Set(interaction.ids);
        let nextDx = dx;
        let nextDy = dy;
        const snapLines = [];

        if (style.canvasGuides?.snap) {
          const movingAssets = interaction.ids
            .map((id) => interaction.startAssets[id])
            .filter(Boolean)
            .map((asset) => ({ ...asset, x: asset.x + dx, y: asset.y + dy }));
          const movingBounds = getGroupBounds(movingAssets);
          const targets = collectSnapTargets(interactionIds);

          const bestX = findBestSnap(
            [
              { key: 'left', value: movingBounds.left },
              { key: 'centerX', value: movingBounds.centerX },
              { key: 'right', value: movingBounds.right },
            ],
            targets.vertical,
          );
          if (bestX) {
            nextDx += bestX.delta;
            snapLines.push({ id: `snap-x-${bestX.targetValue}`, type: 'vertical', value: bestX.targetValue });
          }

          const bestY = findBestSnap(
            [
              { key: 'top', value: movingBounds.top },
              { key: 'centerY', value: movingBounds.centerY },
              { key: 'bottom', value: movingBounds.bottom },
            ],
            targets.horizontal,
          );
          if (bestY) {
            nextDy += bestY.delta;
            snapLines.push({ id: `snap-y-${bestY.targetValue}`, type: 'horizontal', value: bestY.targetValue });
          }
        }

        const movedAssets = interaction.ids
          .map((id) => interaction.startAssets[id])
          .filter(Boolean)
          .map((asset) => ({ ...asset, x: asset.x + nextDx, y: asset.y + nextDy }));
        const movedBounds = getGroupBounds(movedAssets);
        const nextSpacingGuides = buildSpacingGuides(movedBounds, interactionIds);

        const nextAssets = visualAssets.map((rawAsset) => {
          if (!interactionIds.has(rawAsset.id)) return rawAsset;
          const source = interaction.startAssets[rawAsset.id];
          if (!source) return rawAsset;
          return {
            ...rawAsset,
            x: clamp(source.x + nextDx, -400, CANVAS_WIDTH + 160),
            y: clamp(source.y + nextDy, -220, CANVAS_HEIGHT + 160),
          };
        });
        setSnapGuides(snapLines);
        setSpacingGuides(nextSpacingGuides);
        updateAssets(nextAssets, { trackHistory: false });
        return;
      }

      if (interaction.mode === 'resize') {
        const source = interaction.startAssets[interaction.targetId];
        if (!source) return;
        let nextWidth = Math.max(40, source.width + dx);
        let nextHeight = Math.max(24, source.height + dy);
        const snapLines = [];

        if (style.canvasGuides?.snap) {
          const excluded = new Set([interaction.targetId]);
          const targets = collectSnapTargets(excluded);
          const rightEdge = source.x + nextWidth;
          const bottomEdge = source.y + nextHeight;

          const bestX = findBestSnap([{ key: 'right', value: rightEdge }], targets.vertical);
          if (bestX) {
            nextWidth = Math.max(40, source.width + bestX.delta + dx);
            snapLines.push({ id: `snap-x-${bestX.targetValue}`, type: 'vertical', value: bestX.targetValue });
          }

          const bestY = findBestSnap([{ key: 'bottom', value: bottomEdge }], targets.horizontal);
          if (bestY) {
            nextHeight = Math.max(24, source.height + bestY.delta + dy);
            snapLines.push({ id: `snap-y-${bestY.targetValue}`, type: 'horizontal', value: bestY.targetValue });
          }
        }

        setSnapGuides(snapLines);
        setSpacingGuides([]);
        updateAssetById(
          interaction.targetId,
          {
            width: nextWidth,
            height: nextHeight,
          },
          { trackHistory: false },
        );
        return;
      }

      if (interaction.mode === 'rotate') {
        setSpacingGuides([]);
        setSnapGuides([]);
        const source = interaction.startAssets[interaction.targetId];
        if (!source) return;
        const center = {
          x: source.x + source.width / 2,
          y: source.y + source.height / 2,
        };
        const currentAngle = Math.atan2(currentPoint.y - center.y, currentPoint.x - center.x);
        const deltaDegrees = ((currentAngle - interaction.startAngle) * 180) / Math.PI;
        updateAssetById(
          interaction.targetId,
          {
            rotation: (source.rotation || 0) + deltaDegrees,
          },
          { trackHistory: false },
        );
      }
    };

    const onPointerUp = () => {
      interactionRef.current = null;
      setSnapGuides([]);
      setSpacingGuides([]);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [visualAssets, style.canvasGuides]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (isTypingTarget(event.target)) return;
      if (!selectedAssetIds.length) return;

      const selectedAssets = selectedAssetIds
        .map((id) => normalizeAsset(visualAssets.find((asset) => asset.id === id)))
        .filter(Boolean)
        .filter((asset) => !asset.locked);
      if (!selectedAssets.length) return;

      const selectedIds = selectedAssets.map((asset) => asset.id);
      const step = event.shiftKey ? 10 : 1;

      if (event.key === 'Escape') {
        clearSelectedAssets();
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        removeAssets(selectedIds);
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        const duplicates = selectedAssets.map((asset, index) => ({
          ...asset,
          id: `asset_${Date.now()}_${index}`,
          x: asset.x + 16,
          y: asset.y + 16,
          locked: false,
          visible: true,
        }));
        updateAssets([...visualAssets, ...duplicates]);
        setSelectedAssets(duplicates.map((item) => item.id));
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        setSelectedAssets(visualAssets.map((asset) => asset.id));
        return;
      }

      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        updateSelectedAssets((asset) => {
          if (event.key === 'ArrowLeft') return { ...asset, x: asset.x - step };
          if (event.key === 'ArrowRight') return { ...asset, x: asset.x + step };
          if (event.key === 'ArrowUp') return { ...asset, y: asset.y - step };
          return { ...asset, y: asset.y + step };
        });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedAssetIds, visualAssets]);

  const containerStyle = {
    width: `${CANVAS_WIDTH}px`,
    height: `${CANVAS_HEIGHT}px`,
    background: `linear-gradient(135deg, ${style.colors.background}, ${style.colors.backgroundEnd || style.colors.background})`,
    color: style.colors.text,
    fontFamily: style.fontFamily,
    display: 'flex',
    alignItems: 'center',
    gap: `${style.spacing}px`,
    padding: '40px',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: style.alignment === 'center' ? 'center' : style.alignment === 'right' ? 'flex-end' : 'flex-start',
    textAlign: style.alignment,
  };

  const textContainerStyle = {
    textAlign: style.alignment,
    zIndex: 20,
    transform: `translate(${style.textOffsetX || 0}px, ${style.textOffsetY || 0}px)`,
  };

  const textStyleEnhancements = {
    textTransform: style.textTransform === 'uppercase' ? 'uppercase' : 'none',
    letterSpacing: `${style.letterSpacing || 0}px`,
    textShadow: style.textShadow ? '0 6px 22px rgba(0,0,0,0.35)' : 'none',
  };

  const renderAssetInner = (asset, isSelected) => {
    const commonBoxStyle = {
      width: '100%',
      height: '100%',
      opacity: asset.opacity ?? 0.9,
      border: isSelected ? '2px solid #2563eb' : '1px solid rgba(255,255,255,0.16)',
      boxShadow: '0 12px 28px rgba(0,0,0,0.25)',
      mixBlendMode: asset.blendMode || 'normal',
      transform: `scale(${asset.flipX ? -1 : 1}, ${asset.flipY ? -1 : 1})`,
      transformOrigin: 'center',
    };

    if (asset.type === 'text') {
      return (
        <div
          className="select-none overflow-hidden"
          style={{
            ...commonBoxStyle,
            borderRadius: `${asset.radius ?? 8}px`,
            background: asset.backgroundColor || 'transparent',
            color: asset.color || '#ffffff',
            fontSize: `${asset.fontSize || 44}px`,
            fontFamily: asset.fontFamily || 'Inter',
            fontWeight: asset.fontWeight || 700,
            lineHeight: asset.lineHeight || 1.15,
            letterSpacing: `${asset.letterSpacing || 0}px`,
            whiteSpace: 'pre-wrap',
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              asset.align === 'center' ? 'center' : asset.align === 'right' ? 'flex-end' : 'flex-start',
            textAlign: asset.align || 'left',
            padding: `${asset.padding || 8}px`,
            cursor: asset.locked ? 'not-allowed' : 'move',
          }}
          onDoubleClick={() => {
            if (asset.locked) return;
            const next = window.prompt('Edit text', asset.text || '');
            if (next !== null) updateAssetById(asset.id, { text: next });
          }}
        >
          {asset.text || 'Text box'}
        </div>
      );
    }

    if (asset.type === 'shape') {
      const shapeStyle = {
        ...commonBoxStyle,
        borderRadius: asset.shapeType === 'circle' ? '9999px' : `${asset.radius ?? 10}px`,
        backgroundColor: asset.shapeType === 'line' ? asset.strokeColor || '#ffffff' : (asset.fill || 'transparent'),
        borderColor: asset.strokeColor || 'rgba(255,255,255,0.8)',
        borderWidth: `${asset.strokeWidth ?? 2}px`,
        cursor: asset.locked ? 'not-allowed' : 'move',
      };

      if (asset.shapeType === 'line') {
        return (
          <div
            style={{
              ...shapeStyle,
              height: `${Math.max(asset.strokeWidth || 2, 2)}px`,
              marginTop: `${Math.max((asset.height - (asset.strokeWidth || 2)) / 2, 0)}px`,
              borderWidth: '0px',
              borderRadius: '9999px',
            }}
          />
        );
      }
      return <div style={shapeStyle} />;
    }

    return (
      <img
        src={asset.url}
        alt={asset.name || 'Asset'}
        className="w-full h-full select-none"
        style={{
          ...commonBoxStyle,
          objectFit: 'cover',
          borderRadius: `${asset.radius ?? 14}px`,
          cursor: asset.locked ? 'not-allowed' : 'move',
        }}
        draggable={false}
      />
    );
  };

  const singleSelectedId = selectedAssetIds.length === 1 ? selectedAssetIds[0] : null;

  return (
    <div className="w-full overflow-hidden rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="relative w-full overflow-x-auto" style={{ aspectRatio: '4/1' }}>
        <div
          ref={canvasRef}
          id="banner-canvas"
          style={containerStyle}
          onPointerDown={() => clearSelectedAssets()}
          className="origin-top-left transform scale-[0.25] sm:scale-[0.35] md:scale-[0.45] lg:scale-[0.5] xl:scale-[0.6] 2xl:scale-[0.7] absolute top-0 left-0"
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white, transparent)' }} />

          {backgroundImage.url && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url(${backgroundImage.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: backgroundImage.opacity,
              }}
            />
          )}

          {visualAssets.map((rawAsset, index) => {
            const asset = normalizeAsset(rawAsset);
            if (!asset.visible) return null;
            const isSelected = selectedSet.has(asset.id);
            const isPrimarySelected = singleSelectedId === asset.id;

            return (
              <div
                key={asset.id}
                className="absolute"
                style={{
                  left: `${asset.x}px`,
                  top: `${asset.y}px`,
                  width: `${asset.width}px`,
                  height: `${asset.height}px`,
                  transform: `rotate(${asset.rotation || 0}deg)`,
                  transformOrigin: 'center center',
                  zIndex: index + 12 + (isSelected ? 100 : 0),
                }}
                onPointerDown={(event) => beginAssetInteraction(event, asset, 'move')}
              >
                {renderAssetInner(asset, isSelected)}

                {isPrimarySelected && !asset.locked && (
                  <>
                    <button
                      type="button"
                      onPointerDown={(event) => beginAssetInteraction(event, asset, 'rotate')}
                      className="absolute -top-5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-600 border border-white"
                      title="Rotate"
                    />
                    <button
                      type="button"
                      onPointerDown={(event) => beginAssetInteraction(event, asset, 'resize')}
                      className="absolute -bottom-2 -right-2 w-4 h-4 rounded-sm bg-blue-600 border border-white"
                      title="Resize"
                    />
                  </>
                )}
                {isPrimarySelected && asset.locked && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded-full bg-slate-900 text-white">
                    Locked
                  </div>
                )}
              </div>
            );
          })}

          {style.canvasGuides?.grid && (
            <div
              className="absolute inset-0 pointer-events-none z-30"
              style={{
                backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.16) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
              }}
            />
          )}
          {style.canvasGuides?.thirds && (
            <div className="absolute inset-0 pointer-events-none z-30">
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/35" />
              <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/35" />
              <div className="absolute top-1/3 left-0 right-0 h-px bg-white/35" />
              <div className="absolute top-2/3 left-0 right-0 h-px bg-white/35" />
            </div>
          )}
          {style.canvasGuides?.safeArea && (
            <div className="absolute pointer-events-none z-30 inset-6 border-2 border-dashed border-white/45 rounded-md" />
          )}
          {snapGuides.map((guide) => (
            <div
              key={guide.id}
              className="absolute pointer-events-none z-40 bg-blue-400/70"
              style={guide.type === 'vertical'
                ? { left: `${guide.value}px`, top: '0px', bottom: '0px', width: '1px' }
                : { top: `${guide.value}px`, left: '0px', right: '0px', height: '1px' }}
            />
          ))}
          {spacingGuides.map((guide) => {
            const dx = guide.x2 - guide.x1;
            const dy = guide.y2 - guide.y1;
            const length = Math.hypot(dx, dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            const midX = (guide.x1 + guide.x2) / 2;
            const midY = (guide.y1 + guide.y2) / 2;

            return (
              <React.Fragment key={guide.id}>
                <div
                  className="absolute pointer-events-none z-40"
                  style={{
                    left: `${guide.x1}px`,
                    top: `${guide.y1}px`,
                    width: `${length}px`,
                    height: '1px',
                    background: '#34d399',
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: '0 0',
                  }}
                />
                <div
                  className="absolute pointer-events-none z-40 text-[10px] px-1 py-0.5 rounded bg-emerald-500/90 text-white"
                  style={{ left: `${midX + 4}px`, top: `${midY + 4}px` }}
                >
                  {guide.label}
                </div>
              </React.Fragment>
            );
          })}

          {style.image.url && (
            <div style={{ order: style.alignment === 'right' ? 2 : 0, zIndex: 20 }}>
              <img
                src={style.image.url}
                alt="Profile"
                style={{
                  width: `${style.image.size}px`,
                  height: `${style.image.size}px`,
                  borderRadius: style.image.shape === 'circle' ? '50%' : '12px',
                  border: '4px solid rgba(255,255,255,0.3)',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}

          <div style={textContainerStyle}>
            <h1 style={{ fontSize: `${style.fontSize}px`, fontWeight: 'bold', lineHeight: style.lineHeight || 1.1, marginBottom: '8px', ...textStyleEnhancements }}>{text.name}</h1>
            {style.showRole && (
              <p style={{ fontSize: `${style.fontSize * 0.4}px`, opacity: 0.9, color: style.colors.accent, fontWeight: 500, marginBottom: '4px', ...textStyleEnhancements }}>{text.role}</p>
            )}
            {style.showCompany && (
              <p style={{ fontSize: `${style.fontSize * 0.3}px`, opacity: 0.8, ...textStyleEnhancements }}>{text.company}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default BannerCanvas;
