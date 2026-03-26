import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useTheme } from "@/components/ThemeProvider";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mockCases, mockResponders, type Case, type CaseStatus } from "@/data/mockData";
import { X } from "lucide-react";

const statusColors: Record<CaseStatus, string> = {
  New: "bg-info text-info-foreground",
  "In Progress": "bg-warning text-warning-foreground",
  Resolved: "bg-safe text-safe-foreground",
  Escalated: "bg-destructive text-destructive-foreground",
};

const CasesPage = () => {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [filter, setFilter] = useState<CaseStatus | "All">("All");
  const [cases, setCases] = useState<Case[]>(mockCases);
  const [history, setHistory] = useState<any[] | null>(null);
  const [noteText, setNoteText] = useState('');
  const { setIncognito } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();

  const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:4000';

  useEffect(() => {
    // fetch cases from API
    async function fetchCases() {
      try {
        const res = await fetch(`${API_BASE}/api/cases`);
        if (!res.ok) throw new Error('fetch failed');
        const j = await res.json();
        setCases(j.data);
      } catch (e) {
        console.warn('Using mock cases', e);
        setCases(mockCases);
      }
    }
    fetchCases();

    // setup WebSocket to listen for new cases
    try {
      const ws = new WebSocket((location.protocol === 'https:' ? 'wss' : 'ws') + '://localhost:4000');
      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg.event === 'case:new') {
            // refetch cases
            fetchCases();
          }
        } catch (e) {}
      };
    } catch (e) {
      // ignore
    }
  }, []);

  const filtered = filter === "All" ? cases : cases.filter((c) => c.status === filter);

  const getResponderName = (id: string | null) => {
    if (!id) return "Unassigned";
    return mockResponders.find((r) => r.id === id)?.name || "Unknown";
  };

  async function loadHistory(caseId: string) {
    try {
      const res = await fetch(`${API_BASE}/api/cases/${caseId}/history`, { headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('no history');
      const j = await res.json();
      setHistory(j.data);
    } catch (e) {
      setHistory([{ error: 'History unavailable (demo)' }]);
    }
  }

  async function saveNote() {
    if (!selectedCase) return;
    const reportId = selectedCase.id;
    try {
      // Insert note into Supabase `case_notes` table
      await supabase.from('case_notes').insert([{ report_id: reportId, note_text: noteText, created_at: new Date().toISOString() }]);
      toast({ title: 'Note saved', description: 'Saved to case notes', variant: 'default' });
      // If note indicates dispatch, update report status
      if (/vsu dispatched/i.test(noteText) || /v s u dispatched/i.test(noteText)) {
        await supabase.from('reports').update({ status: 'Assigned' }).eq('id', reportId);
        toast({ title: 'Status updated', description: 'Report status set to Assigned (VSU dispatched)', variant: 'default' });
        // Update local cases state
        setCases((cur) => cur.map((c) => (c.id === reportId ? { ...c, status: 'In Progress', assignedResponder: c.assignedResponder || 'VSU' } : c)));
      }
      // refresh history/notes view
      loadHistory(reportId);
      setNoteText('');
    } catch (e) {
      toast({ title: 'Save failed', description: 'Could not save note. Check connection.', variant: 'destructive' });
      console.error('save note failed', e);
    }
  }

  function quickExit() {
    // toggle incognito and navigate to home quickly
    try { setIncognito(true); } catch {}
    navigate('/');
  }
  function quickExitWithToast() {
    try { setIncognito(true); } catch {}
    toast({ title: 'Quick Exit', description: 'Incognito enabled and redirected', variant: 'default' });
    navigate('/');
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-foreground">Case Management</h1>
        <div className="flex gap-2 flex-wrap items-center">
          {(["All", "New", "In Progress", "Resolved", "Escalated"] as const).map((s) => (
            <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)} className="text-xs">
              {s}
            </Button>
          ))}
          <Button size="sm" variant="ghost" className="ml-2 text-xs" onClick={quickExitWithToast}>Quick Exit</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="cursor-pointer" onClick={() => setSelectedCase(c)}>
                  <TableCell className="font-medium">{c.id}</TableCell>
                  <TableCell>{c.incidentType}</TableCell>
                  <TableCell>{c.district}, {c.province}</TableCell>
                  <TableCell><Badge className={`${statusColors[c.status]} text-xs`}>{c.status}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{c.reportChannel}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-xs">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedCase} onOpenChange={() => { setSelectedCase(null); setHistory(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Case {selectedCase?.id}</DialogTitle>
          </DialogHeader>
          {selectedCase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{selectedCase.incidentType}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge className={`${statusColors[selectedCase.status]} text-xs ml-1`}>{selectedCase.status}</Badge></div>
                <div><span className="text-muted-foreground">Location:</span> <span className="font-medium">{selectedCase.district}, {selectedCase.province}</span></div>
                <div><span className="text-muted-foreground">Channel:</span> <span className="font-medium">{selectedCase.reportChannel}</span></div>
                <div><span className="text-muted-foreground">Responder:</span> <span className="font-medium">{getResponderName(selectedCase.assignedResponder)}</span></div>
                <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{new Date(selectedCase.createdAt).toLocaleString()}</span></div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">{selectedCase.description}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">AI Summary</p>
                <p className="text-sm bg-primary/5 border border-primary/10 p-3 rounded-lg">{selectedCase.aiSummary}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => selectedCase && loadHistory(selectedCase.id)}>View History</Button>
                <Button size="sm" variant="outline" onClick={() => { /* placeholder: mark resolved */ }}>Mark Resolved</Button>
              </div>
              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-semibold">Add Note</h4>
                <p className="text-xs text-muted-foreground mb-2">Responder notes are saved to `case_notes`. Use succinct phrases (e.g. "VSU Dispatched").</p>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full rounded-md p-2 border bg-background text-sm"
                  rows={4}
                  placeholder="Write a short note for this case..."
                />
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={saveNote}>Save Note</Button>
                  <Button size="sm" variant="ghost" onClick={() => setNoteText('')}>Clear</Button>
                </div>
              </div>
              {history && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold">Audit History</h3>
                  <div className="text-xs mt-2 space-y-2">
                    {history.map((h, i) => (
                      <div key={i} className="p-2 bg-muted/40 rounded">{JSON.stringify(h)}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CasesPage;
