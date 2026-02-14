import React, { createContext, useContext, useReducer } from 'react';

const EditorContext = createContext(null);

const initialState = {
  projectId: null,
  title: 'Untitled Banner',
  lastSaved: null,
  selectedAssetId: null,
  selectedAssetIds: [],
  history: [],
  future: [],
  config: {
    template: 'minimal',
    text: {
      name: 'Your Name',
      role: 'Your Role',
      company: 'Your Company',
    },
    style: {
      fontSize: 48,
      fontFamily: 'Inter',
      letterSpacing: 0,
      lineHeight: 1.1,
      textTransform: 'none',
      textShadow: true,
      showRole: true,
      showCompany: true,
      textOffsetX: 0,
      textOffsetY: 0,
      colors: {
        background: '#1d4350',
        backgroundEnd: '#a43931',
        text: '#ffffff',
        accent: '#ffffff',
      },
      spacing: 40,
      alignment: 'left',
      backgroundImage: {
        url: null,
        opacity: 0.28,
      },
      canvasGuides: {
        grid: false,
        safeArea: true,
        thirds: false,
        snap: true,
        spacing: true,
      },
      assets: [],
      image: {
        url: null,
        size: 120,
        shape: 'circle',
      },
    },
  },
  mode: 'beginner',
};

const MAX_HISTORY = 100;

const snapshotState = (state) => ({
  title: state.title,
  config: state.config,
  mode: state.mode,
});

const uniqueIds = (ids) => [...new Set((ids || []).filter(Boolean))];

const pushHistory = (state) => {
  const nextHistory = [...state.history, snapshotState(state)];
  if (nextHistory.length > MAX_HISTORY) nextHistory.shift();
  return nextHistory;
};

const normalizeConfig = (config = {}) => ({
  ...initialState.config,
  ...config,
  text: {
    ...initialState.config.text,
    ...(config.text || {}),
  },
  style: {
    ...initialState.config.style,
    ...(config.style || {}),
    colors: {
      ...initialState.config.style.colors,
      ...((config.style && config.style.colors) || {}),
    },
    image: {
      ...initialState.config.style.image,
      ...((config.style && config.style.image) || {}),
    },
    backgroundImage: {
      ...initialState.config.style.backgroundImage,
      ...((config.style && config.style.backgroundImage) || {}),
    },
    canvasGuides: {
      ...initialState.config.style.canvasGuides,
      ...((config.style && config.style.canvasGuides) || {}),
    },
    assets: Array.isArray(config.style?.assets) ? config.style.assets : [],
  },
});

const editorReducer = (state, action) => {
  switch (action.type) {
    case 'SET_METADATA':
      return { ...state, ...action.payload };
    case 'SET_TITLE':
      return { ...state, history: pushHistory(state), future: [], title: action.payload };
    case 'SET_PROJECT_ID':
      return { ...state, projectId: action.payload };
    case 'SET_CONFIG':
      return {
        ...state,
        history: pushHistory(state),
        future: [],
        config: { ...state.config, ...action.payload },
      };
    case 'UPDATE_TEXT':
      return {
        ...state,
        history: pushHistory(state),
        future: [],
        config: {
          ...state.config,
          text: { ...state.config.text, ...action.payload },
        },
      };
    case 'UPDATE_STYLE':
      return {
        ...state,
        history: pushHistory(state),
        future: [],
        config: {
          ...state.config,
          style: { ...state.config.style, ...action.payload },
        },
      };
    case 'UPDATE_STYLE_SILENT':
      return {
        ...state,
        config: {
          ...state.config,
          style: { ...state.config.style, ...action.payload },
        },
      };
    case 'SET_TEMPLATE':
      return {
        ...state,
        history: pushHistory(state),
        future: [],
        config: {
          ...state.config,
          template: action.payload,
        },
      };
    case 'PUSH_HISTORY':
      return {
        ...state,
        history: pushHistory(state),
        future: [],
      };
    case 'SET_MODE':
      return { ...state, history: pushHistory(state), future: [], mode: action.payload };
    case 'SET_SELECTED_ASSET': {
      const id = action.payload || null;
      return {
        ...state,
        selectedAssetId: id,
        selectedAssetIds: id ? [id] : [],
      };
    }
    case 'SET_SELECTED_ASSETS': {
      const ids = uniqueIds(action.payload);
      return {
        ...state,
        selectedAssetIds: ids,
        selectedAssetId: ids.length ? ids[ids.length - 1] : null,
      };
    }
    case 'TOGGLE_SELECTED_ASSET': {
      const id = action.payload;
      if (!id) return state;
      const exists = state.selectedAssetIds.includes(id);
      const ids = exists
        ? state.selectedAssetIds.filter((assetId) => assetId !== id)
        : [...state.selectedAssetIds, id];
      return {
        ...state,
        selectedAssetIds: ids,
        selectedAssetId: ids.length ? ids[ids.length - 1] : null,
      };
    }
    case 'CLEAR_SELECTED_ASSETS':
      return { ...state, selectedAssetId: null, selectedAssetIds: [] };
    case 'LOAD_PROJECT':
      return {
        ...state,
        projectId: action.payload.projectId,
        title: action.payload.title,
        config: normalizeConfig(action.payload.config),
        lastSaved: action.payload.lastSaved,
        selectedAssetId: null,
        selectedAssetIds: [],
        history: [],
        future: [],
      };
    case 'UNDO': {
      if (state.history.length === 0) return state;
      const previous = state.history[state.history.length - 1];
      return {
        ...state,
        title: previous.title,
        config: normalizeConfig(previous.config),
        mode: previous.mode,
        history: state.history.slice(0, -1),
        future: [snapshotState(state), ...state.future],
      };
    }
    case 'REDO': {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        ...state,
        title: next.title,
        config: normalizeConfig(next.config),
        mode: next.mode,
        history: [...state.history, snapshotState(state)],
        future: state.future.slice(1),
      };
    }
    case 'RESET_EDITOR':
      return initialState;
    default:
      return state;
  }
};

export const EditorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  const updateText = (field, value) => {
    dispatch({ type: 'UPDATE_TEXT', payload: { [field]: value } });
  };

  const updateStyle = (field, value, options = {}) => {
    dispatch({
      type: options.trackHistory === false ? 'UPDATE_STYLE_SILENT' : 'UPDATE_STYLE',
      payload: { [field]: value },
    });
  };

  const setTemplate = (templateId) => {
    dispatch({ type: 'SET_TEMPLATE', payload: templateId });
  };

  const setMode = (mode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  };

  const setSelectedAsset = (assetId, options = {}) => {
    if (options.toggle) {
      dispatch({ type: 'TOGGLE_SELECTED_ASSET', payload: assetId });
      return;
    }
    dispatch({ type: 'SET_SELECTED_ASSET', payload: assetId });
  };

  const setSelectedAssets = (assetIds) => {
    dispatch({ type: 'SET_SELECTED_ASSETS', payload: assetIds });
  };

  const clearSelectedAssets = () => {
    dispatch({ type: 'CLEAR_SELECTED_ASSETS' });
  };

  const setTitle = (title) => {
    dispatch({ type: 'SET_TITLE', payload: title });
  };

  const loadProject = (project) => {
    dispatch({
      type: 'LOAD_PROJECT',
      payload: {
        projectId: project.id,
        title: project.title,
        config: project.designData.config,
        lastSaved: project.updatedAt,
      },
    });
  };

  const resetEditor = () => {
    dispatch({ type: 'RESET_EDITOR' });
  };

  const undo = () => dispatch({ type: 'UNDO' });
  const redo = () => dispatch({ type: 'REDO' });
  const pushUndoCheckpoint = () => dispatch({ type: 'PUSH_HISTORY' });
  const canUndo = state.history.length > 0;
  const canRedo = state.future.length > 0;

  return (
    <EditorContext.Provider
      value={{
        state,
        dispatch,
        updateText,
        updateStyle,
        setTemplate,
        setMode,
        setTitle,
        loadProject,
        resetEditor,
        setSelectedAsset,
        setSelectedAssets,
        clearSelectedAssets,
        undo,
        redo,
        canUndo,
        canRedo,
        pushUndoCheckpoint,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
