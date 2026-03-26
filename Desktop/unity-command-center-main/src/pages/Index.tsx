import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, CloudSun, Phone, BarChart3, MapPin, Clock, Users, BookOpen, Gavel, PhoneCall, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import IncognitoToggle from "@/components/IncognitoToggle";
import { useTheme } from "@/components/ThemeProvider";
import { motion } from "framer-motion";

const stats = [
  { icon: BarChart3, label: "Reports Filed", value: "132", trend: 12.5 },
  { icon: Clock, label: "Avg Response Time", value: "18 min", trend: -8.3 },
  { icon: MapPin, label: "Provinces Covered", value: "10/10", trend: 0 },
  { icon: Users, label: "Active Responders", value: "24", trend: 5.2 },
];

const resources = [
  { title: "Articles & Resources", desc: "Learn about your rights and how to stay safe", icon: BookOpen, to: "/articles", color: "bg-primary/10 text-primary" },
  { title: "Punishments & Laws", desc: "Legal consequences for GBV offences in Zambia", icon: Gavel, to: "/punishments", color: "bg-destructive/10 text-destructive" },
  { title: "Emergency Contacts", desc: "Police, fire, medical, and legal aid contacts", icon: PhoneCall, to: "/contacts", color: "bg-safe/10 text-safe" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const Index = () => {
  const { incognito } = useTheme();

  const brandText = incognito ? "Local Weather" : "SafeReport";
  const brandBadge = incognito ? null : <span className="text-xs font-medium text-primary bg-secondary px-2 py-0.5 rounded-full">Zambia</span>;

  const BrandIcon = incognito ? CloudSun : Shield;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <BrandIcon className="h-7 w-7 text-primary brand-icon" />
          <span className="text-xl font-bold text-foreground">{brandText}</span>
          {brandBadge}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <IncognitoToggle />
          <Link to="/admin" className="admin-only">
            <Button variant="outline" size="sm">Admin Login</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,hsl(var(--primary)/0.08),transparent_50%)]" />
        <div className="relative container mx-auto px-6 py-24 md:py-36 text-center max-w-3xl">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-secondary text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6"
          >
            <Phone className="h-4 w-4" />
            Dial *123# or use this app
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight mb-6"
          >
            Report. Protect. <span className="text-gradient">Save Lives.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-10"
          >
            An anonymous, AI-powered reporting system connecting survivors of gender-based violence with law enforcement and human rights activists across Zambia.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/enhanced-report">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-primary-foreground px-8 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                <Shield className="h-5 w-5 mr-2" />
                Enhanced Reporting
              </Button>
            </Link>
            <Link to="/professional">
              <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105">
                <BarChart3 className="h-5 w-5 mr-2" />
                Professional View
              </Button>
            </Link>
            <Link to="/mobile">
              <Button size="lg" variant="outline" className="text-base px-8 py-3 rounded-full hover:scale-105 transition-transform">
                <Phone className="h-5 w-5 mr-2" />
                Mobile App
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-border bg-card">
        <div className="container mx-auto px-6 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Impact at a Glance</h2>
            <p className="text-lg text-foreground max-w-2xl mx-auto">Real-time metrics showing our reach and effectiveness across Zambia</p>
          </motion.div>
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.label} 
                variants={item} 
                className="metric-card group cursor-pointer"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center p-6">
                  <motion.div 
                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  >
                    <stat.icon className="h-8 w-8 text-primary" />
                  </motion.div>
                  <motion.p 
                    className="text-3xl font-bold text-foreground mb-1"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, type: "spring" }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                  {stat.trend !== 0 && (
                    <div className={`flex items-center justify-center gap-1 text-xs ${
                      stat.trend > 0 ? 'text-safe' : stat.trend < 0 ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {stat.trend > 0 ? '↑' : stat.trend < 0 ? '↓' : '→'} {Math.abs(stat.trend)}%
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Resources */}
      <section className="container mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Resources & Information</h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto">Know your rights, understand the law, and find help when you need it.</p>
        </motion.div>
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {resources.map((r, index) => (
            <motion.div key={r.title} variants={item} whileHover={{ y: -10 }}>
              <Link to={r.to} className="block group">
                <div className="glass-card p-6 rounded-xl h-full hover:shadow-xl transition-all duration-300 border border-border/50">
                  <motion.div 
                    className={`w-12 h-12 rounded-xl ${r.color} flex items-center justify-center mb-4`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring" }}
                  >
                    <r.icon className="h-6 w-6" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{r.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{r.desc}</p>
                  <motion.span 
                    className="text-sm text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
                    whileHover={{ x: 5 }}
                  >
                    Learn more <ArrowRight className="h-4 w-4" />
                  </motion.span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section className="bg-card border-t border-border">
        <div className="container mx-auto px-6 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Simple, anonymous, and effective reporting process</p>
          </motion.div>
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Report Anonymously", desc: "Dial *123# on any phone or use this web app. No personal data required." },
              { step: "2", title: "AI Processes Report", desc: "Our AI analyzes the report, provides empathetic guidance, and routes to the nearest responder." },
              { step: "3", title: "Help Arrives", desc: "Police and human rights activists are alerted instantly and dispatched to assist." },
            ].map((s, index) => (
              <motion.div 
                key={s.step} 
                variants={item} 
                className="text-center p-6 group"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                >
                  {s.step}
                </motion.div>
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">{incognito ? "Local Weather" : "SafeReport Zambia"}</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/articles" className="hover:text-foreground transition-colors">Articles</Link>
              <Link to="/punishments" className="hover:text-foreground transition-colors">Laws</Link>
              <Link to="/contacts" className="hover:text-foreground transition-colors">Contacts</Link>
              <Link to="/report" className="hover:text-foreground transition-colors">Report</Link>
            </div>
            <p className="text-sm text-muted-foreground">Empowering communities to end GBV.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
