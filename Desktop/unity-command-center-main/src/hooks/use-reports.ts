import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export function fetchReports() {
  return supabase
    .from('reports')
    .select('*')
    .then((r) => {
      if (r.error) throw r.error;
      return r.data;
    });
}

export function useReports(opts?: { province?: string }) {
  return useQuery(['reports', opts?.province || 'all'], async () => {
    // If a province is provided, use the redacted view filtered by province
    if (opts?.province) {
      const { data, error } = await supabase.from('reports_redacted').select('*').eq('province', opts.province);
      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase.from('reports_redacted').select('*');
    if (error) throw error;
    return data;
  });
}

export default useReports;
