import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { brandService } from '../../services/brandService';
import ColorPaletteManager from '../../features/brand/components/ColorPaletteManager';
import LogoUploader from '../../features/brand/LogoUploader';
import { Save, Loader2 } from 'lucide-react';

const BrandKit = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [brandData, setBrandData] = useState({
      palettes: [],
      logos: []
  });

  useEffect(() => {
      if(user) loadBrandKit();
  }, [user]);

  const loadBrandKit = async () => {
      try {
          const data = await brandService.getBrandKit(user.id);
          setBrandData(data);
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  const handleSave = async () => {
      setSaving(true);
      try {
          await brandService.saveBrandKit(user.id, brandData);
          // Show toast?
      } catch (err) {
          console.error(err);
          alert('Failed to save Brand Kit');
      } finally {
          setSaving(false);
      }
  };

  if (loading) return <div className="p-10 text-center">Loading Brand Kit...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-2xl font-bold dark:text-white">Brand Kit</h1>
            <p className="text-slate-500">Manage your brand assets for quick access in the editor.</p>
        </div>
        <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Save Changes
        </button>
      </div>

      <div className="grid gap-8">
          {/* Colors Section */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold dark:text-white mb-4">Brand Colors</h2>
              <ColorPaletteManager 
                 palettes={brandData.palettes}
                 onChange={(newPalettes) => setBrandData({...brandData, palettes: newPalettes})}
              />
          </section>

          {/* Logos Section */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold dark:text-white mb-4">Assets & Logos</h2>
              <LogoUploader 
                 logos={brandData.logos}
                 onChange={(newLogos) => setBrandData({...brandData, logos: newLogos})}
              />
          </section>
      </div>
    </div>
  );
};

export default BrandKit;
