import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, AlertTriangle, Users, MapPin, Clock, Calendar, 
  Phone, Mail, Eye, EyeOff, Camera, FileText, CheckCircle,
  ArrowRight, ArrowLeft, User, Home, Building, Globe,
  Heart, Zap, Lock, Upload, Mic, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { provinces, districts } from "@/data/mockData";

interface ReportData {
  // Basic Information
  incidentType: string;
  incidentSubtype: string;
  urgency: string;
  description: string;
  
  // Location Information
  province: string;
  district: string;
  specificLocation: string;
  landmark: string;
  
  // Time Information
  incidentDate: string;
  incidentTime: string;
  isOngoing: boolean;
  
  // Victim Information (Optional)
  victimAge: string;
  victimGender: string;
  victimRelationship: string;
  
  // Perpetrator Information (Optional)
  perpetratorKnown: boolean;
  perpetratorRelationship: string;
  perpetratorDetails: string;
  
  // Evidence Information
  hasEvidence: boolean;
  evidenceType: string[];
  witnessCount: string;
  
  // Contact Information (Optional)
  contactMethod: string;
  contactPhone: string;
  contactEmail: string;
  preferredContactTime: string;
  
  // Safety Information
  currentSafety: string;
  needImmediateHelp: boolean;
  safeLocation: string;
  
  // Support Information
  needsCounseling: boolean;
  needsMedical: boolean;
  needsLegal: boolean;
  needsShelter: boolean;
}

const EnhancedReportingForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportData, setReportData] = useState<ReportData>({
    incidentType: "",
    incidentSubtype: "",
    urgency: "",
    description: "",
    province: "",
    district: "",
    specificLocation: "",
    landmark: "",
    incidentDate: "",
    incidentTime: "",
    isOngoing: false,
    victimAge: "",
    victimGender: "",
    victimRelationship: "",
    perpetratorKnown: false,
    perpetratorRelationship: "",
    perpetratorDetails: "",
    hasEvidence: false,
    evidenceType: [],
    witnessCount: "",
    contactMethod: "",
    contactPhone: "",
    contactEmail: "",
    preferredContactTime: "",
    currentSafety: "",
    needImmediateHelp: false,
    safeLocation: "",
    needsCounseling: false,
    needsMedical: false,
    needsLegal: false,
    needsShelter: false,
  });

  const totalSteps = 8;
  
  useEffect(() => {
    setProgress((currentStep / totalSteps) * 100);
  }, [currentStep]);

  const incidentTypes = [
    { 
      id: "physical", 
      label: "Physical Violence", 
      icon: AlertTriangle,
      color: "from-red-500 to-red-600",
      subtypes: ["Domestic Violence", "Assault", "Child Abuse", "Elder Abuse"]
    },
    { 
      id: "emotional", 
      label: "Emotional Abuse", 
      icon: Heart,
      color: "from-orange-500 to-orange-600",
      subtypes: ["Verbal Abuse", "Psychological Abuse", "Coercive Control", "Harassment"]
    },
    { 
      id: "sexual", 
      label: "Sexual Violence", 
      icon: Shield,
      color: "from-purple-500 to-purple-600",
      subtypes: ["Rape", "Sexual Assault", "Sexual Harassment", "Child Sexual Abuse"]
    },
    { 
      id: "economic", 
      label: "Economic Violence", 
      icon: Building,
      color: "from-yellow-500 to-yellow-600",
      subtypes: ["Financial Abuse", "Property Damage", "Employment Discrimination", "Inheritance Dispute"]
    },
    { 
      id: "online", 
      label: "Online/Cyber", 
      icon: Globe,
      color: "from-blue-500 to-blue-600",
      subtypes: ["Cyberstalking", "Online Harassment", "Revenge Porn", "Online Threats"]
    },
    { 
      id: "other", 
      label: "Other", 
      icon: FileText,
      color: "from-gray-500 to-gray-600",
      subtypes: ["Human Trafficking", "Forced Marriage", "Honor-Based Violence", "Other"]
    }
  ];

  const urgencyLevels = [
    { id: "immediate", label: "Immediate Danger", color: "bg-red-500", description: "Life-threatening situation" },
    { id: "urgent", label: "Urgent", color: "bg-orange-500", description: "Need help within hours" },
    { id: "high", label: "High Priority", color: "bg-yellow-500", description: "Need help within 24 hours" },
    { id: "medium", label: "Medium Priority", color: "bg-blue-500", description: "Need help within 3 days" },
    { id: "low", label: "Low Priority", color: "bg-green-500", description: "Need help within a week" }
  ];

  const evidenceTypes = [
    { id: "photos", label: "Photos/Videos", icon: Camera },
    { id: "messages", label: "Messages/Emails", icon: MessageSquare },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "audio", label: "Audio Recordings", icon: Mic },
    { id: "witnesses", label: "Witnesses", icon: Users },
    { id: "other", label: "Other Evidence", icon: FileText }
  ];

  const updateReportData = (field: keyof ReportData, value: any) => {
    setReportData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitReport = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setCurrentStep(totalSteps + 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to SafeReport</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Your confidential report will be handled with utmost care and urgency. 
                All information is encrypted and anonymous.
              </p>
            </div>
            
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Privacy & Security</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• End-to-end encryption</li>
                      <li>• Anonymous reporting option</li>
                      <li>• Secure data storage</li>
                      <li>• Limited access to authorized personnel</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What type of incident?</h2>
              <p className="text-gray-600">Select the category that best describes your situation</p>
            </div>
            
            <div className="grid gap-4">
              {incidentTypes.map((type) => (
                <motion.div
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateReportData("incidentType", type.id)}
                  className={`cursor-pointer transition-all ${
                    reportData.incidentType === type.id 
                      ? "ring-2 ring-blue-500 shadow-lg" 
                      : "hover:shadow-md"
                  }`}
                >
                  <Card className="border-2 border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${type.color}`}>
                          <type.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{type.label}</h3>
                          <p className="text-sm text-gray-600">
                            {type.subtypes.slice(0, 2).join(", ")}
                            {type.subtypes.length > 2 && "..."}
                          </p>
                        </div>
                        {reportData.incidentType === type.id && (
                          <CheckCircle className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">How urgent is this?</h2>
              <p className="text-gray-600">This helps us prioritize your response</p>
            </div>
            
            <div className="grid gap-4">
              {urgencyLevels.map((level) => (
                <motion.div
                  key={level.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateReportData("urgency", level.id)}
                  className={`cursor-pointer transition-all ${
                    reportData.urgency === level.id 
                      ? "ring-2 ring-blue-500 shadow-lg" 
                      : "hover:shadow-md"
                  }`}
                >
                  <Card className="border-2 border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full ${level.color}`} />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{level.label}</h3>
                          <p className="text-sm text-gray-600">{level.description}</p>
                        </div>
                        {reportData.urgency === level.id && (
                          <CheckCircle className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Where did this happen?</h2>
              <p className="text-gray-600">Location information helps us respond quickly</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Province <span className="text-red-500">*</span>
                </label>
                <select
                  value={reportData.province}
                  onChange={(e) => updateReportData("province", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Province</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  value={reportData.district}
                  onChange={(e) => updateReportData("district", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!reportData.province}
                >
                  <option value="">Select District</option>
                  {reportData.province && districts[reportData.province]?.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Location
                </label>
                <Input
                  value={reportData.specificLocation}
                  onChange={(e) => updateReportData("specificLocation", e.target.value)}
                  placeholder="e.g., House number, street name, building name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nearby Landmark
                </label>
                <Input
                  value={reportData.landmark}
                  onChange={(e) => updateReportData("landmark", e.target.value)}
                  placeholder="e.g., Near school, market, church, hospital"
                />
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">When did this happen?</h2>
              <p className="text-gray-600">Time information helps with investigation</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reportData.isOngoing}
                      onChange={(e) => updateReportData("isOngoing", e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-900">This is still happening</span>
                  </label>
                  <p className="text-sm text-gray-600 mt-1">Check if the incident is currently ongoing</p>
                </div>
              </div>
              
              {!reportData.isOngoing && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Incident <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={reportData.incidentDate}
                      onChange={(e) => updateReportData("incidentDate", e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time of Incident
                    </label>
                    <Input
                      type="time"
                      value={reportData.incidentTime}
                      onChange={(e) => updateReportData("incidentTime", e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us what happened</h2>
              <p className="text-gray-600">Please provide as much detail as you're comfortable sharing</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={reportData.description}
                  onChange={(e) => updateReportData("description", e.target.value)}
                  placeholder="Please describe what happened in your own words. Include any details you think are important..."
                  rows={6}
                  className="resize-none"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {reportData.description.length}/500 characters
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Do you have any evidence?
                </label>
                <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={reportData.hasEvidence}
                    onChange={(e) => updateReportData("hasEvidence", e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-900">Yes, I have evidence</span>
                </div>
                
                {reportData.hasEvidence && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {evidenceTypes.map((type) => (
                      <label key={type.id} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={reportData.evidenceType.includes(type.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateReportData("evidenceType", [...reportData.evidenceType, type.id]);
                            } else {
                              updateReportData("evidenceType", reportData.evidenceType.filter(id => id !== type.id));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <type.icon className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-700">{type.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Were there any witnesses?
                </label>
                <select
                  value={reportData.witnessCount}
                  onChange={(e) => updateReportData("witnessCount", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select</option>
                  <option value="none">No witnesses</option>
                  <option value="1">1 witness</option>
                  <option value="2-3">2-3 witnesses</option>
                  <option value="4+">4 or more witnesses</option>
                  <option value="unsure">Not sure</option>
                </select>
              </div>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Safety Check</h2>
              <p className="text-gray-600">Your current safety is our priority</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How would you describe your current safety level?
                </label>
                <select
                  value={reportData.currentSafety}
                  onChange={(e) => updateReportData("currentSafety", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select safety level</option>
                  <option value="safe">I am safe right now</option>
                  <option value="unsafe">I am in immediate danger</option>
                  <option value="uncertain">I'm not sure if I'm safe</option>
                  <option value="monitored">I'm being watched or monitored</option>
                </select>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <Zap className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reportData.needImmediateHelp}
                      onChange={(e) => updateReportData("needImmediateHelp", e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="font-medium text-gray-900">I need immediate help</span>
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    Check this if you are in immediate danger and need emergency services
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Is there a safe place you can go?
                </label>
                <Input
                  value={reportData.safeLocation}
                  onChange={(e) => updateReportData("safeLocation", e.target.value)}
                  placeholder="e.g., Friend's house, family member, police station, shelter"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Heart className="h-5 w-5 text-blue-600" />
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reportData.needsCounseling}
                        onChange={(e) => updateReportData("needsCounseling", e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="font-medium text-gray-900 text-sm">Counseling</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reportData.needsMedical}
                        onChange={(e) => updateReportData("needsMedical", e.target.checked)}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="font-medium text-gray-900 text-sm">Medical Care</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 7:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Preferences</h2>
              <p className="text-gray-600">How would you like us to contact you? (Optional)</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Contact Method
                </label>
                <select
                  value={reportData.contactMethod}
                  onChange={(e) => updateReportData("contactMethod", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">No contact needed</option>
                  <option value="phone">Phone Call</option>
                  <option value="sms">SMS/Text Message</option>
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
              
              {(reportData.contactMethod === "phone" || reportData.contactMethod === "sms" || reportData.contactMethod === "whatsapp") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={reportData.contactPhone}
                    onChange={(e) => updateReportData("contactPhone", e.target.value)}
                    placeholder="+260 123 456 789"
                  />
                </div>
              )}
              
              {reportData.contactMethod === "email" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={reportData.contactEmail}
                    onChange={(e) => updateReportData("contactEmail", e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>
              )}
              
              {reportData.contactMethod && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Best Time to Contact
                  </label>
                  <select
                    value={reportData.preferredContactTime}
                    onChange={(e) => updateReportData("preferredContactTime", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Any time</option>
                    <option value="morning">Morning (8AM - 12PM)</option>
                    <option value="afternoon">Afternoon (12PM - 5PM)</option>
                    <option value="evening">Evening (5PM - 8PM)</option>
                    <option value="night">Night (8PM - 10PM)</option>
                  </select>
                </div>
              )}
            </div>
          </motion.div>
        );

      case 8:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Report</h2>
              <p className="text-gray-600">Please review your information before submitting</p>
            </div>
            
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Report Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Incident Type:</span>
                    <p className="font-medium">
                      {incidentTypes.find(t => t.id === reportData.incidentType)?.label}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Urgency:</span>
                    <p className="font-medium">
                      {urgencyLevels.find(u => u.id === reportData.urgency)?.label}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Location:</span>
                    <p className="font-medium">
                      {reportData.district}, {reportData.province}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Date:</span>
                    <p className="font-medium">
                      {reportData.isOngoing ? "Ongoing" : reportData.incidentDate}
                    </p>
                  </div>
                </div>
                
                {reportData.description && (
                  <div>
                    <span className="text-sm text-gray-600">Description:</span>
                    <p className="font-medium text-sm mt-1">{reportData.description}</p>
                  </div>
                )}
                
                {reportData.needImmediateHelp && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-800">
                      ⚠️ Immediate help requested
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Confidentiality Agreement</h3>
                  <p className="text-sm text-blue-800">
                    By submitting this report, you confirm that the information provided is accurate 
                    to the best of your knowledge. Your report will be handled confidentially 
                    and with priority based on the urgency level indicated.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 9:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Report Submitted Successfully</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Your report has been received and will be handled with the utmost urgency. 
                A reference number has been generated for your records.
              </p>
            </div>
            
            <Card className="border-2 border-green-200 bg-green-50 max-w-sm mx-auto">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-green-600 font-medium mb-2">Reference Number</p>
                  <p className="text-2xl font-bold text-green-800">SR-2024-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600">What happens next?</p>
              <div className="text-left space-y-2 max-w-sm mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <p className="text-sm">Your report is reviewed by our team</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <p className="text-sm">Appropriate responders are notified</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <p className="text-sm">You'll be contacted based on your preferences</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => window.print()}>
                Print Reference
              </Button>
              <Button onClick={() => window.location.href = "/"}>
                Return Home
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">SafeReport</h1>
                <p className="text-xs text-gray-600">Confidential Reporting System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-600">Step {currentStep + 1} of {totalSteps + 1}</p>
                <p className="text-sm font-medium text-gray-900">
                  {currentStep === 0 && "Welcome"}
                  {currentStep === 1 && "Incident Type"}
                  {currentStep === 2 && "Urgency Level"}
                  {currentStep === 3 && "Location"}
                  {currentStep === 4 && "Time"}
                  {currentStep === 5 && "Description"}
                  {currentStep === 6 && "Safety Check"}
                  {currentStep === 7 && "Contact"}
                  {currentStep === 8 && "Review"}
                  {currentStep === 9 && "Complete"}
                </p>
              </div>
              
              {currentStep > 0 && currentStep <= totalSteps && (
                <Button variant="outline" size="sm" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          {currentStep > 0 && currentStep <= totalSteps && (
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation Buttons */}
        {currentStep > 0 && currentStep <= totalSteps && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-between items-center mt-8"
          >
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {currentStep === totalSteps ? (
              <Button 
                onClick={submitReport} 
                disabled={isSubmitting || !reportData.incidentType || !reportData.urgency || !reportData.description}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && !reportData.incidentType) ||
                  (currentStep === 2 && !reportData.urgency) ||
                  (currentStep === 3 && (!reportData.province || !reportData.district)) ||
                  (currentStep === 5 && !reportData.description)
                }
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EnhancedReportingForm;
