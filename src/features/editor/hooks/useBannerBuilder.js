import { useEditor } from '../context/EditorContext';

export const useBannerBuilder = () => {
  const { state, updateText, updateStyle, setTemplate, setMode, loadProject } = useEditor();

  // Pre-defined template styles
  const templates = {
    minimal: {
      background: '#1e293b', 
      backgroundEnd: '#0f172a',
      text: '#ffffff',
      accent: '#3b82f6',
      fontFamily: 'Inter'
    },
    corporate: {
      background: '#f8fafc',
      backgroundEnd: '#e2e8f0',
      text: '#0f172a',
      accent: '#2563eb',
       fontFamily: 'Inter'
    },
    creative: {
      background: '#4f46e5',
      backgroundEnd: '#db2777',
      text: '#ffffff',
      accent: '#facc15',
       fontFamily: 'Inter'
    },
    tech: {
        background: '#0f172a',
        backgroundEnd: '#1e1b4b',
        text: '#00dcb4',
        accent: '#7c3aed',
        fontFamily: 'Roboto Mono'
    }
  };

  const applyTemplate = (templateName) => {
    const style = templates[templateName];
    if (style) {
      setTemplate(templateName);
      updateStyle('colors', {
          background: style.background,
          backgroundEnd: style.backgroundEnd,
          text: style.text,
          accent: style.accent
      });
      updateStyle('fontFamily', style.fontFamily);
    }
  };
  
  const handleImageUpload = (file) => {
      if(!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
           updateStyle('image', { ...state.config.style.image, url: e.target.result });
      };
      reader.readAsDataURL(file);
  }

  return {
    config: state.config,
    mode: state.mode,
    setMode,
    updateText,
    updateStyle,
    applyTemplate,
    handleImageUpload,
    loadProject,
    // Helper to get current template definition if needed
    currentTemplateDef: templates[state.config.template] || templates.minimal
  };
};
