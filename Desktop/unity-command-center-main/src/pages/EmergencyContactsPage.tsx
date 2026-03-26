import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Phone, MapPin, Building2, Flame, Siren, HeartPulse, Scale, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";

type ContactCategory = "Police" | "Fire" | "Medical" | "Legal" | "Support";

const contacts: {
  name: string;
  category: ContactCategory;
  phone: string;
  address: string;
  province: string;
  available: string;
}[] = [
  { name: "Zambia Police Service — Emergency", category: "Police", phone: "999 / 991", address: "Nationwide", province: "All Provinces", available: "24/7" },
  { name: "Victim Support Unit (VSU) — HQ", category: "Police", phone: "+260 211 254 146", address: "Police HQ, Lusaka", province: "Lusaka", available: "24/7" },
  { name: "Lusaka Central Police Station", category: "Police", phone: "+260 211 229 053", address: "Cairo Road, Lusaka", province: "Lusaka", available: "24/7" },
  { name: "Woodlands Police Post", category: "Police", phone: "+260 211 264 893", address: "Woodlands, Lusaka", province: "Lusaka", available: "24/7" },
  { name: "Kitwe Central Police", category: "Police", phone: "+260 212 222 333", address: "Oxford Street, Kitwe", province: "Copperbelt", available: "24/7" },
  { name: "Ndola Central Police", category: "Police", phone: "+260 212 611 000", address: "Broadway, Ndola", province: "Copperbelt", available: "24/7" },
  { name: "Livingstone Police Station", category: "Police", phone: "+260 213 320 159", address: "Mosi-oa-Tunya Rd", province: "Southern", available: "24/7" },
  { name: "Zambia Fire Brigade — Emergency", category: "Fire", phone: "993", address: "Nationwide", province: "All Provinces", available: "24/7" },
  { name: "Lusaka Fire Station", category: "Fire", phone: "+260 211 228 822", address: "Freedom Way, Lusaka", province: "Lusaka", available: "24/7" },
  { name: "University Teaching Hospital (UTH)", category: "Medical", phone: "+260 211 252 641", address: "Nationalist Road, Lusaka", province: "Lusaka", available: "24/7" },
  { name: "Kitwe Central Hospital", category: "Medical", phone: "+260 212 222 901", address: "Obote Ave, Kitwe", province: "Copperbelt", available: "24/7" },
  { name: "Chipata General Hospital", category: "Medical", phone: "+260 216 221 333", address: "Chipata Town", province: "Eastern", available: "24/7" },
  { name: "Medical Emergency (Ambulance)", category: "Medical", phone: "992", address: "Nationwide", province: "All Provinces", available: "24/7" },
  { name: "Legal Aid Board", category: "Legal", phone: "+260 211 251 270", address: "Lusaka", province: "Lusaka", available: "Mon-Fri 8-17" },
  { name: "Human Rights Commission", category: "Legal", phone: "+260 211 251 327", address: "Lusaka", province: "Lusaka", available: "Mon-Fri 8-17" },
  { name: "YWCA — GBV Shelter", category: "Support", phone: "+260 211 252 725", address: "Lusaka", province: "Lusaka", available: "24/7" },
  { name: "Lifeline/Childline Zambia", category: "Support", phone: "116 (toll-free)", address: "Nationwide", province: "All Provinces", available: "24/7" },
  { name: "WLSA (Women & Law in Southern Africa)", category: "Support", phone: "+260 211 290 512", address: "Lusaka", province: "Lusaka", available: "Mon-Fri 8-17" },
];

const categoryConfig: Record<ContactCategory, { icon: React.ElementType; color: string; bg: string }> = {
  Police: { icon: Siren, color: "text-info", bg: "bg-info/10" },
  Fire: { icon: Flame, color: "text-destructive", bg: "bg-destructive/10" },
  Medical: { icon: HeartPulse, color: "text-safe", bg: "bg-safe/10" },
  Legal: { icon: Scale, color: "text-warning", bg: "bg-warning/10" },
  Support: { icon: Users, color: "text-primary", bg: "bg-primary/10" },
};

const categories: ContactCategory[] = ["Police", "Fire", "Medical", "Legal", "Support"];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 },
};

const EmergencyContactsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </Link>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">SafeReport</span>
        </div>
        <ThemeToggle />
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-safe/10 text-safe text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            <Phone className="h-4 w-4" />
            Emergency Directory
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Emergency Contacts</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Find police, fire, medical, legal, and support contacts across Zambia. In an emergency, dial <span className="font-bold text-foreground">999</span> or <span className="font-bold text-foreground">991</span>.</p>
        </motion.div>

        {/* Emergency banner */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 mb-10 text-center"
        >
          <p className="text-lg font-bold text-destructive mb-2">🚨 In Immediate Danger?</p>
          <p className="text-foreground">Call <span className="font-bold text-2xl">999</span> (Police) or <span className="font-bold text-2xl">993</span> (Fire) or <span className="font-bold text-2xl">992</span> (Ambulance)</p>
        </motion.div>

        {categories.map((cat) => {
          const config = categoryConfig[cat];
          const catContacts = contacts.filter((c) => c.category === cat);
          const Icon = config.icon;

          return (
            <div key={cat} className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <h2 className="text-xl font-bold text-foreground">{cat}</h2>
                <Badge variant="outline" className="text-xs">{catContacts.length}</Badge>
              </div>
              <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {catContacts.map((contact, i) => (
                  <motion.div key={i} variants={item}>
                    <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-300 h-full">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground text-sm mb-2">{contact.name}</h3>
                        <div className="space-y-1.5 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-primary shrink-0" />
                            <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="font-medium text-foreground hover:text-primary transition-colors">
                              {contact.phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span>{contact.address}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-3 w-3 shrink-0" />
                            <span>{contact.province}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] mt-1">{contact.available}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmergencyContactsPage;
