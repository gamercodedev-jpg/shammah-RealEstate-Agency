import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [masterKeyInput, setMasterKeyInput] = useState("");
  const [error, setError] = useState("");

  function getMasterKey() {
    return window.localStorage.getItem("shammah_key") || "Shammah2026";
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredKey = masterKeyInput.trim();
    const correctKey = getMasterKey();

    if (enteredKey === correctKey) {
      window.sessionStorage.setItem("shammah_admin_authed", "1");
      setError("");
      navigate("/admin");
    } else {
      setMasterKeyInput("");
      setError("Incorrect key. Access denied.");
    }
  };

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center py-10">
        <div className="relative w-full max-w-md bg-white border rounded-2xl shadow-lg p-8 text-center overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-5 bg-center bg-contain bg-no-repeat pointer-events-none"
            style={{ backgroundImage: "url(/shammah-logo.png)" }}
          />

          <div className="relative z-10">
            <h2 className="text-xl font-bold text-blue-900 mb-2">Mthunzi-Tech Security</h2>
            <p className="text-sm text-muted-foreground mb-6">Authorized Shammah Personnel Only</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                value={masterKeyInput}
                onChange={(e) => setMasterKeyInput(e.target.value)}
                placeholder="Enter Master Key"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {error && <p className="text-xs text-red-600">{error}</p>}

              <button
                type="submit"
                className="w-full bg-blue-900 text-white rounded-md py-2 text-sm font-semibold hover:bg-blue-800 transition-colors"
              >
                Login to Admin Panel
              </button>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full text-xs text-muted-foreground mt-2 hover:underline"
              >
                Cancel and go back home
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
