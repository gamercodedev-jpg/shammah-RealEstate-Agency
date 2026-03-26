import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, Phone, Users, MapPin, Clock, CheckCircle, AlertTriangle,
  TrendingUp, BarChart3, Zap, Globe, Heart, Lock, Eye,
  ArrowRight, Play, Star, Award, Target, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ProfessionalLanding = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const features = [
    {
      icon: Shield,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze reports for immediate routing and response prioritization.",
      color: "from-blue-500 to-cyan-500",
      stats: "99.2% Accuracy"
    },
    {
      icon: Lock,
      title: "Military-Grade Security",
      description: "End-to-end encryption with AES-256 protocols ensures complete anonymity and data protection.",
      color: "from-purple-500 to-pink-500",
      stats: "256-bit Encryption"
    },
    {
      icon: Users,
      title: "Nationwide Network",
      description: "Connected to over 500+ responders across all 10 Zambian provinces for rapid assistance.",
      color: "from-green-500 to-emerald-500",
      stats: "10/10 Provinces"
    },
    {
      icon: Zap,
      title: "Lightning Fast Response",
      description: "Average response time under 15 minutes with real-time tracking and status updates.",
      color: "from-orange-500 to-red-500",
      stats: "14 Min Average"
    }
  ];

  const stats = [
    { icon: Users, label: "Active Responders", value: "524+", change: "+12%" },
    { icon: MapPin, label: "Lives Impacted", value: "12,847", change: "+28%" },
    { icon: Clock, label: "Response Time", value: "14 min", change: "-18%" },
    { icon: CheckCircle, label: "Success Rate", value: "96.8%", change: "+5.2%" }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Mwamba",
      role: "Director, Zambian Women's Rights Organization",
      content: "SafeReport has revolutionized how we handle GBV cases. The AI analysis and rapid response system has saved countless lives.",
      rating: 5
    },
    {
      name: "Inspector James Banda",
      role: "Zambia Police Service",
      content: "The integration with law enforcement has been seamless. Real-time alerts and coordinated responses have improved our efficiency dramatically.",
      rating: 5
    },
    {
      name: "Maria Chanda",
      role: "Survivor & Advocate",
      content: "The anonymity and speed of reporting gave me the courage to seek help. This system is truly life-changing for survivors.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/10"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg"
              >
                <Shield className="h-6 w-6 text-white" />
              </motion.div>
              <span className="text-xl font-bold">SafeReport Zambia</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
              <a href="#impact" className="hover:text-blue-400 transition-colors">Impact</a>
              <a href="#testimonials" className="hover:text-blue-400 transition-colors">Testimonials</a>
              <a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => navigate('/demo')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Demo
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                onClick={() => navigate('/report')}
              >
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-20">
        <div className="container mx-auto text-center max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 px-4 py-2 bg-blue-500/20 text-blue-300 border-blue-400/30">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered GBV Management System
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent leading-tight">
              Protect. Respond.
              <span className="block text-blue-400">Save Lives.</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed px-4">
              An anonymous, AI-powered reporting system connecting survivors of gender-based violence 
              with immediate help across Zambia. Military-grade security meets lightning-fast response.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 px-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-full"
                onClick={() => navigate('/report')}
              >
                <Phone className="h-5 w-5 mr-2" />
                Report Emergency
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-full"
                onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
              >
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto px-4"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20"
              >
                <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mx-auto mb-2 sm:mb-3" />
                <div className="text-xl sm:text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-xs sm:text-sm text-blue-200 mb-2">{stat.label}</div>
                <div className="text-xs text-green-400">{stat.change}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Cutting-Edge Features
            </h2>
            <p className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto px-4">
              Powered by advanced AI and built for maximum impact across Zambia
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                onMouseEnter={() => setActiveFeature(index)}
                className="relative"
              >
                <Card className={`bg-gradient-to-br ${feature.color} p-4 sm:p-6 border-0 h-full cursor-pointer transform transition-all duration-300 hover:scale-105`}>
                  <CardContent className="p-0">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 w-fit mb-4">
                      <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-white/80 mb-4">{feature.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-white/20 text-white border-white/30 text-xs sm:text-sm">
                        {feature.stats}
                      </Badge>
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-white/60" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20 px-6 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Real Impact Across Zambia
            </h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Numbers that show our commitment to saving lives and serving communities
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-5xl font-bold text-blue-400 mb-2">10/10</div>
              <div className="text-xl text-white mb-2">Provinces Covered</div>
              <div className="text-blue-200">Complete nationwide coverage with local responder networks</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-5xl font-bold text-green-400 mb-2">96.8%</div>
              <div className="text-xl text-white mb-2">Success Rate</div>
              <div className="text-blue-200">Cases successfully resolved with positive outcomes</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-5xl font-bold text-purple-400 mb-2">14min</div>
              <div className="text-xl text-white mb-2">Avg Response Time</div>
              <div className="text-blue-200">Lightning-fast response when every second counts</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Trusted by Leaders
            </h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Hear from those who use SafeReport to make a difference
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 h-full">
                  <CardContent className="p-0">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-white/80 mb-6 italic">"{testimonial.content}"</p>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-blue-200">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-blue-200 mb-8">
              Join us in our mission to protect and serve communities across Zambia
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-lg px-8 py-4 rounded-full"
                onClick={() => navigate('/report')}
              >
                <Shield className="h-5 w-5 mr-2" />
                Start Reporting
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-4 rounded-full"
                onClick={() => navigate('/contact')}
              >
                <Target className="h-5 w-5 mr-2" />
                Partner With Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-semibold">SafeReport Zambia</span>
            </div>
            <div className="text-center md:text-right text-blue-200">
              <p>© 2024 SafeReport. Protecting communities across Zambia.</p>
              <p className="text-sm mt-1">Your safety. Our priority.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProfessionalLanding;
