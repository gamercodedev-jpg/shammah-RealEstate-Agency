import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockCases, type CaseStatus } from "@/data/mockData";
import { motion } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const statusColors: Record<CaseStatus, string> = {
  New: "#3b82f6",
  "In Progress": "#f59e0b",
  Resolved: "#22c55e",
  Escalated: "#ef4444",
};

const MapPage = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView([-13.5, 28.5], 6);
    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mockCases.forEach((c) => {
      const color = statusColors[c.status];
      const marker = L.circleMarker([c.latitude, c.longitude], {
        radius: c.status === "Escalated" ? 12 : 8,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.6,
      }).addTo(map);

      marker.bindPopup(`
        <div style="min-width:180px">
          <strong>${c.id}</strong> — ${c.incidentType}<br/>
          <span style="color:#666">${c.district}, ${c.province}</span><br/>
          <span style="display:inline-block;padding:2px 8px;border-radius:9999px;background:${color};color:white;font-size:11px;margin-top:4px">${c.status}</span><br/>
          <span style="font-size:11px;color:#888;margin-top:4px;display:block">${c.reportChannel} · ${new Date(c.createdAt).toLocaleDateString()}</span>
          <p style="font-size:11px;margin-top:6px;color:#555">${c.aiSummary}</p>
        </div>
      `);
    });

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Map View — Live Report Locations</h1>
      <Card>
        <CardContent className="p-0 overflow-hidden rounded-lg">
          <div ref={mapRef} className="h-[500px] w-full z-0" />
        </CardContent>
      </Card>
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground flex-wrap">
        {Object.entries(statusColors).map(([status, color]) => (
          <span key={status} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }} />
            {status}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export default MapPage;
