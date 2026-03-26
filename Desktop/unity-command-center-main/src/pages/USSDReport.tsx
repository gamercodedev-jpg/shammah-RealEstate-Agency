import { useState, useEffect } from "react";
import useAutoSaveReport from "@/hooks/use-auto-save-report";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { provinces, districts } from "@/data/mockData";
import { Shield, CloudSun, ArrowLeft, Phone, CheckCircle, AlertCircle, MapPin, Clock, Zap, Lock } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Link } from "react-router-dom";
import { useGeolocation } from "@/hooks/useGeolocation";
import { motion, AnimatePresence } from "framer-motion";

const USSDReport = () => {
  const [step, setStep] = useState(0);
  const [incidentType, setIncidentType] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [description, setDescription] = useState("");
  const geo = useGeolocation();
  const { restored, startAutoSave, stopAutoSave, clearSaved } = useAutoSaveReport();
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);

  const { incognito } = useTheme();

  // Silently captured — user doesn't see this
  const capturedData = {
    latitude: geo.latitude,
    longitude: geo.longitude,
    accuracy: geo.accuracy,
    timestamp: new Date().toISOString(),
  };

  const handleOption = (value: string) => {
    if (step === 1) {
      setIncidentType(value);
      setStep(2);
    } else if (step === 2) {
      setProvince(value);
      setStep(3);
    } else if (step === 3) {
      setDistrict(value);
      setStep(4);
    }
  };

  const slideVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  const renderScreen = () => {
    switch (step) {
      case 0:
        return (
          <motion.div key="s0" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
            <div className="text-center space-y-1 mb-2">
              <p className="text-xs tracking-widest uppercase text-primary font-semibold">{incognito ? "🌤️ Mode" : "🛡️ SafeReport"}</p>
              <p className="text-xs text-muted-foreground">Your safety. Our priority.</p>
            </div>
            
            {showRestorePrompt && restored && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-lg space-y-2"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-2">
                    <p className="font-semibold text-amber-900">Draft found</p>
                    <p className="text-amber-800/80">Continue your unfinished report?</p>
                    <div className="flex gap-2 pt-1">
                      <Button 
                        size="sm" 
                        onClick={() => {
                          try {
                            setStep(restored.step ?? 1);
                            setIncidentType(restored.incidentType || '');
                            setProvince(restored.province || '');
                            setDistrict(restored.district || '');
                            setDescription(restored.description || '');
                          } catch (e) {}
                          setShowRestorePrompt(false);
                          startAutoSave(() => ({ step, incidentType, province, district, description }));
                        }}
                        className="text-xs h-auto py-1.5 px-3"
                      >
                        Restore
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => { setShowRestorePrompt(false); clearSaved(); }}
                        className="text-xs h-auto py-1.5 px-3"
                      >
                        Discard
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div className="space-y-2.5 pt-1">
              <motion.button 
                onClick={() => setStep(1)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="block w-full text-left px-4 py-3.5 rounded-xl bg-gradient-to-r from-red-500/20 to-red-500/10 border border-red-500/30 hover:border-red-500/50 hover:from-red-500/25 hover:to-red-500/15 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl group-hover:scale-110 transition-transform">🚨</span>
                    <div>
                      <p className="text-sm font-semibold text-red-900 group-hover:text-red-800">Report an Incident</p>
                      <p className="text-xs text-red-800/60 group-hover:text-red-800/70">Get immediate help</p>
                    </div>
                  </div>
                  <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </motion.button>

              <motion.button 
                onClick={() => {}}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="block w-full text-left px-4 py-3.5 rounded-xl bg-gradient-to-r from-blue-500/20 to-blue-500/10 border border-blue-500/30 hover:border-blue-500/50 hover:from-blue-500/25 hover:to-blue-500/15 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl group-hover:scale-110 transition-transform">📚</span>
                    <div>
                      <p className="text-sm font-semibold text-blue-900 group-hover:text-blue-800">Resources & Support</p>
                      <p className="text-xs text-blue-800/60 group-hover:text-blue-800/70">Counseling & hotlines</p>
                    </div>
                  </div>
                  <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </motion.button>

              <motion.button 
                onClick={() => {}}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="block w-full text-left px-4 py-3.5 rounded-xl bg-gradient-to-r from-orange-500/20 to-orange-500/10 border border-orange-500/30 hover:border-orange-500/50 hover:from-orange-500/25 hover:to-orange-500/15 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl group-hover:scale-110 transition-transform">🚔</span>
                    <div>
                      <p className="text-sm font-semibold text-orange-900 group-hover:text-orange-800">Emergency</p>
                      <p className="text-xs text-orange-800/60 group-hover:text-orange-800/70">Call police now</p>
                    </div>
                  </div>
                  <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </motion.button>
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div key="s1" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
            <p className="text-sm font-semibold text-foreground">What happened?</p>
            <p className="text-xs text-muted-foreground">Your report stays anonymous</p>
            <div className="space-y-2">
              {[
                { label: "Sexual Assault", icon: "🚨", color: "bg-red-500/10 border-red-500/30 hover:border-red-500/50 hover:bg-red-500/15" },
                { label: "Defilement", icon: "⚠️", color: "bg-orange-500/10 border-orange-500/30 hover:border-orange-500/50 hover:bg-orange-500/15" },
                { label: "Other", icon: "📋", color: "bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/15" }
              ].map(({ label, icon, color }) => (
                <motion.button 
                  key={label} 
                  onClick={() => { setIncidentType(label); setStep(2); }}
                  whileHover={{ x: 4 }}
                  className={`block w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-200 ${color}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{icon}</span>
                    <span className="font-medium text-sm">{label}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="s2" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Where are you?</p>
            </div>
            <p className="text-xs text-muted-foreground">Select your province</p>
            <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin pr-2">
              {provinces.map((p) => (
                <motion.button 
                  key={p} 
                  onClick={() => handleOption(p)}
                  whileHover={{ x: 4, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                  className="block w-full text-left text-xs px-3 py-2.5 rounded-lg bg-sidebar-accent/50 text-foreground hover:bg-primary/10 transition-all duration-200 border border-transparent hover:border-primary/30"
                >
                  {p}
                </motion.button>
              ))}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="s3" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Select District</p>
            </div>
            <p className="text-xs text-muted-foreground">in {province}</p>
            <div className="space-y-1.5">
              {(districts[province] || []).map((d) => (
                <motion.button 
                  key={d} 
                  onClick={() => handleOption(d)}
                  whileHover={{ x: 4, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                  className="block w-full text-left text-xs px-3 py-2.5 rounded-lg bg-sidebar-accent/50 text-foreground hover:bg-primary/10 transition-all duration-200 border border-transparent hover:border-primary/30"
                >
                  {d}
                </motion.button>
              ))}
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="s4" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Your Story Matters</p>
            </div>
            <p className="text-xs text-muted-foreground">Share as much or as little as you're comfortable with</p>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Type your report here..."
              className="bg-sidebar-accent/50 border-primary/20 text-foreground text-xs px-3 py-2.5 rounded-lg min-h-[100px] focus:border-primary/50 focus:ring-primary/20 transition-all"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] text-muted-foreground flex items-center gap-2"
            >
              <Lock className="h-3 w-3 text-safe" />
              <span>Your report is encrypted & stays private</span>
            </motion.div>
            <Button 
              onClick={() => handleSubmit()} 
              disabled={!description.trim()} 
              size="sm" 
              className="w-full text-xs font-semibold py-2.5 h-auto"
            >
              Submit Report
            </Button>
          </motion.div>
        );
      case 5:
        return (
          <motion.div key="s5" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-3">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4 text-amber-500" />
              <p className="text-sm font-semibold text-foreground">AI Support Activated</p>
            </motion.div>
            <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 rounded-lg p-4 space-y-3">
              <p className="text-xs leading-relaxed text-foreground">
                Thank you for your courage. You've done the right thing by speaking up.
              </p>
              <div className="bg-background/50 rounded p-2.5 border border-primary/20 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3.5 w-3.5 text-safe flex-shrink-0" />
                  <span>Report routing to {district}, {province}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span>Specialist alerted within 5 minutes</span>
                </div>
                {geo.latitude && (
                  <div className="flex items-center gap-2 text-xs">
                    <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <span>Your location is secure</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                "Healing is a journey, and you don't have to walk it alone."
              </p>
            </div>
            <Button onClick={() => setStep(6)} size="sm" className="w-full text-xs font-semibold py-2.5 h-auto">
              Continue
            </Button>
          </motion.div>
        );
      case 6:
        return (
          <motion.div key="s6" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-4 text-center py-2">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 12 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-safe/40 to-safe/20 flex items-center justify-center mx-auto"
            >
              <CheckCircle className="h-10 w-10 text-safe" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-1.5"
            >
              <p className="text-lg font-bold text-safe">Reported!</p>
              <p className="text-xs text-muted-foreground">We received your submission</p>
              <div className="bg-safe/10 border border-safe/20 rounded-lg px-3 py-2 mt-3 inline-block mx-auto">
                <p className="text-[10px] font-mono text-safe font-semibold">Case ID: SR-{String(Math.floor(Math.random() * 900) + 100)}</p>
              </div>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs text-muted-foreground px-2"
            >
              You can close this now. Help is happening.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="pt-2 space-y-2"
            >
              <Button onClick={() => { setStep(0); setDescription(""); }} variant="outline" size="sm" className="text-xs w-full">
                File Another Report
              </Button>
            </motion.div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  // API base for demo server
  const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:4000';

  async function handleSubmit() {
    const payload = {
      incidentType,
      province,
      district,
      description,
      latitude: geo.latitude,
      longitude: geo.longitude,
      reportChannel: 'USSD',
    };

    // Offline queueing: if offline, save to localStorage queue and show submitted screen
    if (!navigator.onLine) {
      try {
        const q = JSON.parse(localStorage.getItem('reportQueue') || '[]');
        q.push(payload);
        localStorage.setItem('reportQueue', JSON.stringify(q));
      } catch (e) { console.error('queue save failed', e); }
      setStep(5);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to submit');
      try { clearSaved(); } catch (e) {}
      setStep(5);
    } catch (e) {
      console.error(e);
      // save to queue as fallback
      try {
        const q = JSON.parse(localStorage.getItem('reportQueue') || '[]');
        q.push(payload);
        localStorage.setItem('reportQueue', JSON.stringify(q));
      } catch (err) {}
      setStep(5);
    }
  }

  // Panic button long-press
  let panicTimer: any = null;
  function startPanic() {
    panicTimer = setTimeout(async () => {
      try {
        await fetch(`${API_BASE}/api/panic`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude: geo.latitude, longitude: geo.longitude, province, district }),
        });
        // silent acknowledgement
      } catch (e) {
        console.error('panic failed', e);
      }
    }, 3000);
  }
  function cancelPanic() {
    if (panicTimer) clearTimeout(panicTimer);
    panicTimer = null;
  }

  // Attempt to flush queued reports when back online and start autosave
  useEffect(() => {
    // start autosave
    try {
      startAutoSave(() => ({ step, incidentType, province, district, description }));
    } catch (e) {}

    // if a draft was restored, prompt the user
    if (restored) setShowRestorePrompt(true);

    async function flushQueue() {
      try {
        const q = JSON.parse(localStorage.getItem('reportQueue') || '[]');
        if (!q.length) return;
        for (const item of q) {
          try {
            await fetch(`${API_BASE}/api/reports`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
          } catch (e) {
            console.warn('flush failed', e);
            return; // stop on first failure
          }
        }
        localStorage.removeItem('reportQueue');
      } catch (e) {}
    }
    const onOnline = () => flushQueue();
    window.addEventListener('online', onOnline);
    // try immediately
    if (navigator.onLine) flushQueue();
    return () => {
      window.removeEventListener('online', onOnline);
      try { stopAutoSave(); } catch (e) {}
    };
  }, [restored]);

  // Progress indicator
  const progress = step <= 6 ? (step / 6) * 100 : 100;

  const BrandIcon = incognito ? CloudSun : Shield;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-200 via-white to-blue-100 flex flex-col items-center overflow-x-hidden">
      {/* Branding/Header */}
      <header className="w-full max-w-5xl flex items-center justify-between px-4 md:px-12 py-4 md:py-6 mt-2 md:mt-6">
        <Link to="/" className="flex items-center gap-2 text-blue-700 hover:text-blue-900 transition-colors hover:gap-3">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-base font-semibold">Back</span>
        </Link>
        <div className="flex items-center gap-3">
          <img src="/logo192.png" alt="SafeReport Logo" className="h-8 w-8 rounded-full shadow" />
          <span className="font-bold text-blue-900 text-lg tracking-tight">SafeReport Zambia</span>
        </div>
      </header>

      {/* Main Content: Fullscreen, Mobile-First */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-2 py-2">
        <section className="w-full max-w-2xl flex flex-col gap-6 md:gap-8 px-0 h-full justify-center mx-auto">
          {/* Status bar */}
          <div className="flex items-center justify-between px-4 md:px-12 py-3 md:py-6 text-[1.5rem] md:text-[2.2rem] text-blue-700 border-b border-blue-200 bg-blue-50/90 rounded-t-2xl shadow-md w-full">
            <span className="font-extrabold text-blue-900 tracking-wide text-3xl md:text-4xl">SafeReport</span>
            <div className="flex items-center gap-4">
              <Phone className="h-8 w-8" />
              <span className="font-mono text-2xl font-bold">*123#</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-2 md:h-3 bg-blue-200 mx-4 md:mx-12 rounded-full overflow-hidden w-auto">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          {/* Content */}
          <div className="flex flex-col gap-6 md:gap-8 px-2 md:px-12 py-4 md:py-8 min-h-[320px] md:min-h-[480px] w-full justify-center">
            <AnimatePresence mode="wait">
              {renderScreen()}
            </AnimatePresence>
            {step > 0 && step < 6 && (
              <motion.button 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setStep(step - 1)} 
                className="text-base font-semibold text-blue-700 hover:text-blue-900 mt-2 transition-colors hover:translate-x-0.5"
              >
                ← Go Back
              </motion.button>
            )}
          </div>
          {/* Panic Button */}
          <div className="flex justify-center items-center w-full mt-2 md:mt-4">
            <motion.button
              onMouseDown={() => startPanic()}
              onMouseUp={() => cancelPanic()}
              onMouseLeave={() => cancelPanic()}
              onTouchStart={() => startPanic()}
              onTouchEnd={() => cancelPanic()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-lg md:text-2xl font-extrabold px-8 md:px-20 py-4 md:py-6 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200 shadow-2xl hover:shadow-2xl w-full max-w-lg"
              aria-label="Hold for panic - press and hold for 3 seconds"
            >
              🚨 Hold 3s for Panic
            </motion.button>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-base md:text-lg text-blue-700 mt-2 md:mt-4 px-2 md:px-4 font-semibold"
          >
            Dial <span className="font-mono font-extrabold text-blue-900">*123#</span> on any phone to access SafeReport
          </motion.p>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs text-blue-600 opacity-80">
        SafeReport Zambia &copy; {new Date().getFullYear()} &mdash; Final Year Project by [Your Name]
      </footer>
    </div>
  );
};

export default USSDReport;
