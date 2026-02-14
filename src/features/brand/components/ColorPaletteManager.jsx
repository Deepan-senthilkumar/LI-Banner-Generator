import React, { useState } from 'react';
import { Plus, Trash2, Palette } from 'lucide-react';

const ColorPaletteManager = ({ palettes, onChange }) => {
  const [newPaletteName, setNewPaletteName] = useState('');

  const addPalette = () => {
    if (!newPaletteName.trim()) return;
    onChange([...palettes, { name: newPaletteName, colors: ['#000000', '#ffffff'] }]);
    setNewPaletteName('');
  };

  const removePalette = (index) => {
    const newPalettes = [...palettes];
    newPalettes.splice(index, 1);
    onChange(newPalettes);
  };

  const updateColor = (paletteIndex, colorIndex, newColor) => {
    const newPalettes = [...palettes];
    newPalettes[paletteIndex].colors[colorIndex] = newColor;
    onChange(newPalettes);
  };

  const addColor = (paletteIndex) => {
      const newPalettes = [...palettes];
      newPalettes[paletteIndex].colors.push('#cccccc');
      onChange(newPalettes);
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="New Palette Name (e.g. 'Dark Theme')"
          className="flex-1 p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white"
          value={newPaletteName}
          onChange={(e) => setNewPaletteName(e.target.value)}
        />
        <button
          onClick={addPalette}
          disabled={!newPaletteName}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="grid gap-4">
        {palettes.map((palette, pIndex) => (
          <div key={pIndex} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold dark:text-white flex items-center gap-2">
                <Palette size={16} className="text-blue-500" />
                {palette.name}
              </h3>
              <button onClick={() => removePalette(pIndex)} className="text-red-500 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {palette.colors.map((color, cIndex) => (
                <div key={cIndex} className="relative group">
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => updateColor(pIndex, cIndex, e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border-none p-0 overflow-hidden"
                    />
                </div>
              ))}
              <button 
                onClick={() => addColor(pIndex)}
                className="w-10 h-10 flex items-center justify-center border-2 border-dashed border-slate-300 rounded hover:border-slate-400 text-slate-400"
              >
                  <Plus size={16} />
              </button>
            </div>
          </div>
        ))}
        {palettes.length === 0 && (
             <div className="text-center py-8 text-slate-500 dark:text-slate-400 border-2 border-dashed rounded-xl">
                 No palettes created yet.
             </div>
        )}
      </div>
    </div>
  );
};

export default ColorPaletteManager;
