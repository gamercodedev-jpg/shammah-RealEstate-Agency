import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const CaseDetail = ({ reportId }: { reportId: string }) => {
  const [caseData, setCaseData] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    const fetchFullCase = async () => {
      // 1. Fetch the report and the profile of the person assigned to it
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          profiles:assigned_to ( full_name, organization )
        `)
        .eq('id', reportId)
        .single();

      if (data) setCaseData(data);

      // 2. Fetch all notes for this specific report
      const { data: notesData } = await supabase
        .from('case_notes')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: false });

      if (notesData) setNotes(notesData);
    };

    if (reportId) fetchFullCase();
  }, [reportId]);

  if (!caseData) return <p>Loading Case...</p>;

  return (
    <div className="p-6">
      <h2>Case: {String(caseData.id).slice(0, 8)}</h2>
      <p><strong>Type:</strong> {caseData.incident_type}</p>
      <p><strong>Assigned To:</strong> {caseData.profiles?.full_name || 'Unassigned'}</p>
      
      <hr className="my-4" />
      
      <h3>Case History (Notes)</h3>
      {notes.map(note => (
        <div key={note.id} className="border-l-4 border-blue-500 p-2 my-2 bg-gray-50">
          <p>{note.note_text}</p>
          <small className="text-gray-500">{new Date(note.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
};

export default CaseDetail;
