import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockResponders, type ResponderStatus } from "@/data/mockData";
import { User, Building2, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const statusColors: Record<ResponderStatus, string> = {
  Available: "bg-safe text-safe-foreground",
  "On Case": "bg-warning text-warning-foreground",
  Offline: "bg-muted text-muted-foreground",
};

const RespondersPage = () => {
  const [responders, setResponders] = useState(mockResponders);
  const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:4000';

  useEffect(() => {
    async function fetchResponders() {
      try {
        const res = await fetch(`${API_BASE}/api/responders`);
        if (!res.ok) throw new Error('fetch failed');
        const j = await res.json();
        setResponders(j.data);
      } catch (e) {
        setResponders(mockResponders);
      }
    }
    fetchResponders();
  }, []);

  const cycleStatus = (current: ResponderStatus) => {
    if (current === 'Available') return 'On Case' as ResponderStatus;
    if (current === 'On Case') return 'Offline' as ResponderStatus;
    return 'Available' as ResponderStatus;
  };

  async function toggleResponder(id: string) {
    const r = responders.find((x) => x.id === id);
    if (!r) return;
    const newStatus = cycleStatus(r.status);
    try {
      const res = await fetch(`${API_BASE}/api/responders/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
      if (!res.ok) throw new Error('update failed');
      const j = await res.json();
      setResponders((cur) => cur.map((c) => (c.id === id ? j.data : c)));
    } catch (e) {
      setResponders((cur) => cur.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Responder Management</h1>
      <div className="text-sm text-muted-foreground mb-2">Geofencing: new reports are auto-routed to the nearest <strong>Available</strong> responder in the incident's province. If someone is <strong>On Case</strong>, the system routes to the next available responder.</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {responders.map((r) => (
          <Card key={r.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {r.type === "Activist" ? <User className="h-5 w-5 text-primary" /> : <Building2 className="h-5 w-5 text-info" />}
                  <div>
                    <p className="font-semibold text-foreground">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.type}</p>
                  </div>
                </div>
                <Badge className={`${statusColors[r.status]} text-xs`}>{r.status}</Badge>
              </div>
              <div className="space-y-1.5 text-sm">
                <p className="text-muted-foreground">Zone: <span className="text-foreground">{r.zone}</span></p>
                <p className="text-muted-foreground">Province: <span className="text-foreground">{r.province}</span></p>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span className="text-foreground text-xs">{r.phone}</span>
                </div>
                <p className="text-muted-foreground">Cases Handled: <span className="text-foreground font-medium">{r.casesHandled}</span></p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => toggleResponder(r.id)}>Toggle Availability</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RespondersPage;
