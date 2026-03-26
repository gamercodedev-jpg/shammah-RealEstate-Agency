import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Gavel, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";

const punishments = [
  {
    offence: "Rape",
    law: "Penal Code Cap 87, Section 132",
    penalty: "Minimum 15 years imprisonment, up to life imprisonment",
    severity: "Maximum",
    details: "Any person who has unlawful carnal knowledge of another person without their consent commits the felony of rape. Aggravated rape (involving weapons, multiple perpetrators, or resulting in serious injury) carries a life sentence.",
  },
  {
    offence: "Defilement (child under 16)",
    law: "Penal Code (Amendment) Act 2005, Section 138",
    penalty: "Minimum 15 years to life imprisonment",
    severity: "Maximum",
    details: "Any person who unlawfully and carnally knows a child under the age of 16 commits defilement. No bail is granted. The age of consent in Zambia is 16 years.",
  },
  {
    offence: "Attempted Defilement",
    law: "Penal Code, Section 139",
    penalty: "Minimum 14 years imprisonment",
    severity: "High",
    details: "Any person who attempts to have unlawful carnal knowledge of a child under 16 years commits an offence.",
  },
  {
    offence: "Indecent Assault",
    law: "Penal Code, Section 137",
    penalty: "Up to 14 years imprisonment",
    severity: "High",
    details: "Any person who unlawfully and indecently assaults another person commits a felony. This includes unwanted touching of a sexual nature.",
  },
  {
    offence: "Domestic Violence",
    law: "Anti-GBV Act No. 1 of 2011",
    penalty: "Varies: Fine, imprisonment, or both. Protection orders available.",
    severity: "Medium",
    details: "The Act covers physical, sexual, economic, emotional, and psychological abuse within domestic settings. Victims can obtain protection orders from the court.",
  },
  {
    offence: "Protection Orders & Emergency Relief",
    law: "Anti-GBV Act No. 1 of 2011, Part III",
    penalty: "N/A (civil remedies)",
    severity: "High",
    details: "The Act enables courts to grant protection orders (including interim and long-term orders) to prevent further contact by the alleged perpetrator. Breach of a protection order can lead to arrest and criminal charges.",
  },
  {
    offence: "Support Services for Survivors",
    law: "Anti-GBV Act No. 1 of 2011",
    penalty: "N/A",
    severity: "Informational",
    details: "The law mandates the establishment of services such as safe shelter, medical care, psychosocial support, and legal aid for survivors. Agencies must coordinate referrals for comprehensive care.",
  },
  {
    offence: "Mandatory Reporting & Duty to Assist",
    law: "Anti-GBV Act No.1 of 2011 / Penal Code",
    penalty: "Varies; may include fines or imprisonment in specific contexts",
    severity: "High",
    details: "Certain professionals and community leaders may be obligated to report serious offences (e.g., defilement). Failure to report where law requires may attract sanctions under related statutes.",
  },
  {
    offence: "Sexual Harassment",
    law: "Anti-GBV Act No. 1 of 2011, Section 42",
    penalty: "Up to 3 years imprisonment or a fine, or both",
    severity: "Medium",
    details: "Any person who sexually harasses another person in a workplace, educational institution, or any other place commits an offence.",
  },
  {
    offence: "Failure to Report Defilement",
    law: "Penal Code, Section 140",
    penalty: "Up to 5 years imprisonment",
    severity: "Medium",
    details: "Any person who, having knowledge of the commission of defilement, fails to report it to the police commits an offence. This includes parents, teachers, and community leaders.",
  },
  {
    offence: "Child Trafficking",
    law: "Anti-Human Trafficking Act No. 11 of 2008",
    penalty: "Up to 25 years imprisonment",
    severity: "Maximum",
    details: "Trafficking of children for sexual exploitation, forced labour, or any other purpose is a serious offence carrying severe penalties.",
  },
];

const severityColors: Record<string, string> = {
  Maximum: "bg-destructive text-destructive-foreground",
  High: "bg-warning text-warning-foreground",
  Medium: "bg-info text-info-foreground",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

const PunishmentsPage = () => {
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

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            <Gavel className="h-4 w-4" />
            Legal Framework
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Punishments & Penalties</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Understanding the legal consequences of gender-based violence under Zambian law.</p>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {punishments.map((p, i) => (
            <motion.div key={i} variants={item}>
              <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-destructive/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{p.offence}</h3>
                        <p className="text-xs text-muted-foreground">{p.law}</p>
                      </div>
                    </div>
                    <Badge className={`${severityColors[p.severity]} text-xs shrink-0`}>{p.severity}</Badge>
                  </div>
                  <div className="bg-destructive/5 border border-destructive/10 rounded-lg p-3 mb-3">
                    <p className="text-sm font-semibold text-foreground">⚖️ Penalty: {p.penalty}</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.details}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default PunishmentsPage;
