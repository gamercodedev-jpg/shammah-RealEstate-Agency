import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockAlerts, mockCases, mockResponders } from "@/data/mockData";
import { Bell, CheckCircle, XCircle } from "lucide-react";

const AlertsPage = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Alert Center</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" /> Notification Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAlerts.map((alert) => {
              const responder = mockResponders.find((r) => r.id === alert.responderId);
              return (
                <div key={alert.id} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="shrink-0 mt-0.5">
                    {alert.delivered ? (
                      <CheckCircle className="h-4 w-4 text-safe" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{alert.type}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(alert.sentAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">To: {responder?.name || "Unknown"} · Case: {alert.caseId}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsPage;
