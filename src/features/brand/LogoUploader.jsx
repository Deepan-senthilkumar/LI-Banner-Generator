import React, { useState } from 'react';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { brandService } from '../../services/brandService';

const LogoUploader = ({ logos, onChange }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
        const url = await brandService.uploadLogo(file);
        const newLogo = {
            id: Date.now().toString(),
            name: file.name,
            url
        };
        onChange([...logos, newLogo]);
    } catch (err) {
        console.error(err);
        alert('Upload failed');
    } finally {
        setUploading(false);
    }
  };

  const removeLogo = (id) => {
      onChange(logos.filter(l => l.id !== id));
  };

  return (
    <div className="space-y-6">
       <label className="block w-full cursor-pointer group">
           <div className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group-hover:border-blue-400">
               {uploading ? (
                   <span>Uploading...</span>
               ) : (
                   <>
                    <Upload size={24} className="mb-2" />
                    <span className="text-sm">Click to upload logo (PNG, SVG, JPG)</span>
                   </>
               )}
           </div>
           <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
       </label>

       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
           {logos.map(logo => (
               <div key={logo.id} className="group relative aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl p-4 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                   <img src={logo.url} alt={logo.name} className="max-w-full max-h-full object-contain" />
                   <button 
                        onClick={() => removeLogo(logo.id)}
                        className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                   >
                       <Trash2 size={14} />
                   </button>
               </div>
           ))}
            {logos.length === 0 && (
                <div className="col-span-full text-center py-4 text-slate-400 text-sm">
                    No logos uploaded yet.
                </div>
            )}
       </div>
    </div>
  );
};

export default LogoUploader;
