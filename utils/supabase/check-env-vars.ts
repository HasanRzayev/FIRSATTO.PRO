 
 
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const getEnvVars = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return {
    url,
    key,
    hasValidConfig: !!(url && key && url !== 'your_supabase_project_url_here' && key !== 'your_supabase_anon_key_here')
  };
};
