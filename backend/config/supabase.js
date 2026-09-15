const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY || process.env['SUPABASE_anon-key'];

let supabase;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('[Supabase] Warning: SUPABASE_URL or API key is missing in backend/.env. Supabase operations will fall back to local data.');
  const dummyQuery = () => {
    const chain = {
      select: () => chain,
      insert: () => chain,
      update: () => chain,
      upsert: () => chain,
      delete: () => chain,
      eq: () => chain,
      order: () => chain,
      single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      maybeSingle: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      then: (resolve) => resolve({ data: null, error: new Error('Supabase not configured') })
    };
    return chain;
  };
  supabase = {
    from: () => dummyQuery()
  };
}

module.exports = supabase;