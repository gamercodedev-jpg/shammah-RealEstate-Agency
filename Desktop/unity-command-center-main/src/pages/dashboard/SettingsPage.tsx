import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Save } from "lucide-react";

const SettingsPage = () => {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm">Name</Label>
            <Input defaultValue="Admin User" className="mt-1" />
          </div>
          <div>
            <Label className="text-sm">Email</Label>
            <Input defaultValue="admin@safereport.zm" className="mt-1" />
          </div>
          <Button size="sm"><Save className="h-4 w-4 mr-1" /> Save Profile</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Notification Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">SMS Alerts for New Cases</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Push Notifications</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Daily Summary Email</Label>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">USSD Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-sm">USSD Shortcode</Label>
            <Input defaultValue="*123#" className="mt-1" disabled />
          </div>
          <div>
            <Label className="text-sm">Welcome Message</Label>
            <Input defaultValue="Welcome to SafeReport Zambia. Your safety matters." className="mt-1" />
          </div>
          <Button size="sm"><Save className="h-4 w-4 mr-1" /> Save Configuration</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
