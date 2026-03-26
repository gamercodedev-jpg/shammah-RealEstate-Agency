import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Phone, AlertTriangle, Monitor, Car, 
  Clock, CheckCircle, X, ChevronRight, Shield, Zap,
  Users, MapPin, Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ResponsiveLoading from "@/components/ResponsiveLoading";
import MobileSkeleton from "@/components/MobileSkeleton";

interface DraftReport {
  id: string;
  timestamp: Date;
  progress: number;
  lastStep: string;
}

const SafeReportMobile = () => {
  const navigate = useNavigate();
  const [draftReport, setDraftReport] = useState<DraftReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDraftActions, setShowDraftActions] = useState(false);

  useEffect(() => {
    // Simulate loading and checking for draft reports
    const timer = setTimeout(() => {
      const hasDraft = Math.random() > 0.5; // 50% chance of having a draft
      if (hasDraft) {
        setDraftReport({
          id: "DRAFT-001",
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          progress: 65,
          lastStep: "Location details"
        });
        setShowDraftActions(true);
      }
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleRestoreDraft = () => {
    // Navigate to report page with draft data
    navigate("/report", { state: { draftId: draftReport?.id } });
  };

  const handleDiscardDraft = () => {
    setDraftReport(null);
    setShowDraftActions(false);
  };

  const actionCards = [
    {
      id: "report",
      title: "Report an Incident",
      subtitle: "Get immediate help",
      icon: AlertTriangle,
      color: "bg-gradient-to-br from-red-500 to-red-600",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      route: "/report",
      priority: "high",
      description: "Anonymous reporting with AI assistance"
    },
    {
      id: "resources",
      title: "Resources & Support",
      subtitle: "Counseling & hotlines",
      icon: Monitor,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      route: "/resources",
      priority: "medium",
      description: "24/7 support and guidance"
    },
    {
      id: "emergency",
      title: "Emergency",
      subtitle: "Call police now",
      icon: Car,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      route: "/emergency",
      priority: "critical",
      description: "Immediate emergency response"
    }
  ];

  const quickStats = [
    { icon: Users, label: "Active Responders", value: "24", color: "text-blue-600" },
    { icon: MapPin, label: "Provinces Covered", value: "10/10", color: "text-green-600" },
    { icon: Heart, label: "Lives Helped", value: "1,247", color: "text-red-600" }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <ResponsiveLoading size="lg" text="Loading SafeReport..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-blue-100"
      >
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:bg-blue-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back</span>
          </Button>
          
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Shield className="h-6 w-6 text-blue-600" />
            </motion.div>
            <span className="font-bold text-gray-800">SafeReport Zambia</span>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="p-4 pb-20">
        {/* Main Title Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-3 bg-blue-600 rounded-full shadow-lg"
            >
              <Phone className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-800">SafeReport</h1>
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
            <span className="font-mono text-lg font-semibold text-blue-800">*123#</span>
            <Badge variant="secondary" className="text-xs bg-blue-200 text-blue-800">
              USSD Code
            </Badge>
          </div>
        </motion.div>

        {/* Brand Tagline */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <Badge variant="outline" className="px-4 py-2 text-sm border-blue-200 text-blue-700">
            SAFEREPORT
          </Badge>
          <p className="text-sm text-gray-600 mt-2 italic">Your safety. Our priority.</p>
        </motion.div>

        {/* Draft Report Alert */}
        <AnimatePresence>
          {showDraftActions && draftReport && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", damping: 20 }}
              className="mb-6"
            >
              <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-orange-900 mb-1">Draft found</h3>
                      <p className="text-sm text-orange-700 mb-3">
                        Continue your unfinished report from {Math.floor((Date.now() - draftReport.timestamp.getTime()) / 60000)} minutes ago?
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleRestoreDraft}
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Restore
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDiscardDraft}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                        >
                          <X className="h-3 w-3" />
                          Discard
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="grid grid-cols-3 gap-3">
            {quickStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20"
              >
                <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
                <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Cards */}
        <div className="space-y-4">
          {actionCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to={card.route}>
                <Card className={`${card.color} border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring" }}
                          className={`p-3 ${card.iconBg} rounded-full`}
                        >
                          <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                        </motion.div>
                        <div>
                          <h3 className="font-bold text-white text-lg mb-1">{card.title}</h3>
                          <p className="text-white/90 text-sm">{card.subtitle}</p>
                          <p className="text-white/70 text-xs mt-1">{card.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {card.priority === "critical" && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <Zap className="h-4 w-4 text-yellow-300" />
                          </motion.div>
                        )}
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1, repeat: Infinity, delay: index * 0.2 }}
                        >
                          <ChevronRight className="h-5 w-5 text-white/80 group-hover:text-white transition-colors" />
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Emergency Quick Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <Button
            size="lg"
            onClick={() => navigate("/emergency")}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <AlertTriangle className="h-5 w-5" />
            </motion.div>
            Emergency Call
          </Button>
          <p className="text-xs text-gray-500 mt-2">Tap for immediate assistance</p>
        </motion.div>
      </main>

      {/* Bottom Navigation Hint */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-blue-100 p-4"
      >
        <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
          <Shield className="h-3 w-3" />
          <span>Your safety is our priority</span>
          <Shield className="h-3 w-3" />
        </div>
      </motion.div>
    </div>
  );
};

export default SafeReportMobile;
