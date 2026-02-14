import { useEffect, useState } from 'react';
import { draftService } from '../../../services/draftService';
import { useDebounce } from '../../../hooks/useDebounce';

export const useAutosave = (state, userId) => {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  // Debounce the entire state (or just config)
  const debouncedState = useDebounce(state, 2000);

  useEffect(() => {
    if (!userId || !debouncedState.projectId) return;

    const save = async () => {
      setSaving(true);
      try {
        // We only save the transient draft, not the actual project record
        await draftService.saveDraft(userId, debouncedState.projectId, debouncedState);
        setLastSaved(new Date());
      } catch (err) {
        console.error("Autosave failed", err);
      } finally {
        setSaving(false);
      }
    };

    // Prevent saving on initial load or empty state
    if (Object.keys(debouncedState).length > 0) {
        save();
    }

  }, [debouncedState, userId]);

  return { saving, lastSaved };
};
