/**
 * Supabase Data Provider (Scaffold)
 * Implements the same interface as localProvider for easy switching.
 */

// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);

const supabaseProvider = {
    get: async (table, id) => {
        console.warn(`Supabase Provider: get() called (Not fully implemented) - table=${table}, id=${id}`);
        // const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
        // if (error) throw error;
        // return data;
        return null;
    },

    getAll: async (table, filter = {}) => {
        console.warn(`Supabase Provider: getAll() called - table=${table}, filter=${JSON.stringify(filter)}`);
        // let query = supabase.from(table).select('*');
        // Object.keys(filter).forEach(key => {
        //     query = query.eq(key, filter[key]);
        // });
        // const { data, error } = await query;
        // if (error) throw error;
        // return data;
        return [];
    },

    create: async (table, data) => {
        console.warn(`Supabase Provider: create() called - table=${table}`);
        // const { data: created, error } = await supabase.from(table).insert(data).select().single();
        // if (error) throw error;
        // return created;
        return { ...data, id: 'supa_' + Math.random() };
    },

    update: async (table, id, data) => {
        console.warn(`Supabase Provider: update() called - table=${table}, id=${id}`);
        // const { data: updated, error } = await supabase.from(table).update(data).eq('id', id).select().single();
        // if (error) throw error;
        // return updated;
        return { ...data, id };
    },

    delete: async (table, id) => {
        console.warn(`Supabase Provider: delete() called - table=${table}, id=${id}`);
        // const { error } = await supabase.from(table).delete().eq('id', id);
        // if (error) throw error;
        return true;
    }
};

export default supabaseProvider;
