import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("admin@safereport.zm");
  const [password, setPassword] = useState("admin123");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login — just navigate
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">SafeReport</span>
          </div>
          <p className="text-muted-foreground">Admin Dashboard Login</p>
        </div>
        <form onSubmit={handleLogin} className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
          </div>
          <Button type="submit" className="w-full">
            <Lock className="h-4 w-4 mr-2" /> Sign In
          </Button>
          <p className="text-xs text-center text-muted-foreground">Mock login — click Sign In to proceed</p>
        </form>
        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-primary hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
