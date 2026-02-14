const AI_STYLES = {
  abstract: ['#0f172a', '#2563eb', '#06b6d4'],
  corporate: ['#111827', '#334155', '#14b8a6'],
  creative: ['#4f46e5', '#db2777', '#f59e0b'],
  minimal: ['#0b132b', '#1c2541', '#5bc0be'],
};

const toDataUrl = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

export const aiAssetService = {
  generateAsset: async ({ prompt, style = 'abstract' }) => {
    const colors = AI_STYLES[style] || AI_STYLES.abstract;
    const safePrompt = (prompt || 'AI Asset').slice(0, 32).replace(/[<>&"]/g, '');
    const token = Math.random().toString(36).slice(2, 7);

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="420" height="220" viewBox="0 0 420 220">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${colors[0]}"/>
      <stop offset="50%" stop-color="${colors[1]}"/>
      <stop offset="100%" stop-color="${colors[2]}"/>
    </linearGradient>
  </defs>
  <rect width="420" height="220" fill="url(#g)" rx="20"/>
  <circle cx="340" cy="52" r="56" fill="white" fill-opacity="0.12"/>
  <circle cx="84" cy="188" r="70" fill="white" fill-opacity="0.09"/>
  <g stroke="white" stroke-opacity="0.3" stroke-width="2">
    <path d="M22 72 C120 18, 188 124, 286 68"/>
    <path d="M132 164 C212 124, 262 210, 392 162"/>
  </g>
  <text x="22" y="188" fill="white" font-size="20" font-family="Inter, Arial, sans-serif" font-weight="700">${safePrompt}</text>
  <text x="22" y="210" fill="white" fill-opacity="0.78" font-size="12" font-family="Inter, Arial, sans-serif">AI-${token}</text>
</svg>`;

    return {
      id: `ai_${Date.now()}`,
      name: safePrompt || 'AI Asset',
      url: toDataUrl(svg),
    };
  },
};
