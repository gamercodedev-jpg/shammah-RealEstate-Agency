import { Link } from "react-router-dom";
import { Shield, ArrowLeft, BookOpen, Scale, AlertTriangle, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";

const articles = [
  {
    id: 1,
    title: "Understanding Gender-Based Violence in Zambia",
    category: "Awareness",
    icon: Heart,
    summary: "Gender-based violence (GBV) remains one of the most pervasive human rights violations in Zambia. Learn about the different forms, warning signs, and how communities can work together to prevent it.",
    content: "GBV includes physical, sexual, psychological, and economic violence. In Zambia, statistics show that 1 in 3 women have experienced some form of GBV. Understanding the root causes—including gender inequality, poverty, and cultural norms—is the first step toward ending the cycle.",
    readTime: "5 min read",
  },
  {
    id: 2,
    title: "Your Rights as a Survivor: A Complete Guide",
    category: "Legal Rights",
    icon: Scale,
    summary: "Every survivor has legal rights that are protected under Zambian law. This guide outlines the Anti-Gender-Based Violence Act and what protections are available to you.",
    content: "The Anti-GBV Act No. 1 of 2011 provides comprehensive protection. Survivors have the right to: report to police without being turned away, receive medical treatment, obtain a protection order, access legal aid, and maintain confidentiality throughout proceedings.",
    readTime: "8 min read",
  },
  {
    id: 3,
    title: "How to Support Someone Who Has Experienced GBV",
    category: "Support",
    icon: Heart,
    summary: "If someone you know has experienced violence, your response matters. Learn how to listen, support, and guide them to professional help without causing further harm.",
    content: "Key principles: Believe them. Don't blame them. Let them make their own decisions. Connect them with professional services. Respect their privacy. Be patient—recovery takes time. Know your local support resources.",
    readTime: "4 min read",
  },
  {
    id: 4,
    title: "Safety Planning: Protecting Yourself and Your Children",
    category: "Safety",
    icon: AlertTriangle,
    summary: "A safety plan can save your life. This guide helps you prepare for emergencies and know your options when you feel threatened.",
    content: "Keep important documents in a safe place. Memorize emergency numbers. Identify safe places you can go. Pack an emergency bag. Tell a trusted person about your situation. Know your nearest police station and safe house.",
    readTime: "6 min read",
  },
  {
    id: 5,
    title: "Defilement Laws in Zambia: What You Need to Know",
    category: "Legal Rights",
    icon: Scale,
    summary: "Defilement is one of the most serious offences under Zambian law. Understanding the legal framework helps protect children and ensures justice is served.",
    content: "Under the Penal Code (Amendment) Act of 2005, defilement of a child under 16 carries a minimum sentence of 15 years imprisonment. Attempted defilement carries 14 years. There is no bail for defilement cases. Any person who knows of defilement and fails to report it commits an offence.",
    readTime: "7 min read",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const ArticlesPage = () => {
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
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            <BookOpen className="h-4 w-4" />
            Knowledge Center
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Articles & Resources</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Empowering you with knowledge about your rights, safety planning, and how to support survivors.</p>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {articles.map((article) => (
            <motion.div key={article.id} variants={item}>
              <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <article.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">{article.category}</Badge>
                        <span className="text-xs text-muted-foreground">{article.readTime}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{article.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{article.summary}</p>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm text-foreground leading-relaxed">{article.content}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ArticlesPage;
