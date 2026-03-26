export type CaseStatus = "New" | "In Progress" | "Resolved" | "Escalated";
export type IncidentType = "Rape" | "Defilement" | "Other";
export type ResponderStatus = "Available" | "On Case" | "Offline";

export interface Case {
  id: string;
  incidentType: IncidentType;
  province: string;
  district: string;
  description: string;
  status: CaseStatus;
  createdAt: string;
  assignedResponder: string | null;
  aiSummary: string;
  reportChannel: "USSD" | "PWA";
  latitude: number;
  longitude: number;
}

export interface Responder {
  id: string;
  name: string;
  type: "Activist" | "Police Station";
  zone: string;
  province: string;
  status: ResponderStatus;
  phone: string;
  casesHandled: number;
}

export interface Alert {
  id: string;
  caseId: string;
  responderId: string;
  type: "SMS" | "Push";
  message: string;
  sentAt: string;
  delivered: boolean;
}

export const provinces = [
  "Lusaka", "Copperbelt", "Southern", "Eastern", "Northern",
  "Luapula", "Western", "North-Western", "Muchinga", "Central",
];

export const districts: Record<string, string[]> = {
  Lusaka: ["Lusaka", "Kafue", "Chongwe", "Chilanga"],
  Copperbelt: ["Ndola", "Kitwe", "Mufulira", "Luanshya"],
  Southern: ["Livingstone", "Choma", "Mazabuka", "Monze"],
  Eastern: ["Chipata", "Petauke", "Katete", "Lundazi"],
  Northern: ["Kasama", "Mpulungu", "Mbala", "Luwingu"],
  Luapula: ["Mansa", "Nchelenge", "Samfya", "Kawambwa"],
  Western: ["Mongu", "Senanga", "Kaoma", "Sesheke"],
  "North-Western": ["Solwezi", "Kasempa", "Mwinilunga", "Zambezi"],
  Muchinga: ["Chinsali", "Mpika", "Nakonde", "Isoka"],
  Central: ["Kabwe", "Kapiri Mposhi", "Serenje", "Mkushi"],
};

export const mockCases: Case[] = [
  { id: "SR-001", incidentType: "Rape", province: "Lusaka", district: "Lusaka", description: "Incident reported near market area late evening.", status: "New", createdAt: "2026-02-27T08:30:00Z", assignedResponder: null, aiSummary: "Survivor reports assault near a commercial area. Immediate support and police response recommended.", reportChannel: "USSD", latitude: -15.3875, longitude: 28.3228 },
  { id: "SR-002", incidentType: "Defilement", province: "Copperbelt", district: "Kitwe", description: "Minor assaulted by known individual in residential area.", status: "In Progress", createdAt: "2026-02-26T14:15:00Z", assignedResponder: "R-002", aiSummary: "Defilement case involving a minor. Suspect known to victim. Child protection services alerted.", reportChannel: "PWA", latitude: -12.8024, longitude: 28.2132 },
  { id: "SR-003", incidentType: "Rape", province: "Southern", district: "Livingstone", description: "Assault reported near tourist lodge.", status: "Resolved", createdAt: "2026-02-24T21:00:00Z", assignedResponder: "R-003", aiSummary: "Case resolved with suspect apprehended. Survivor connected with counseling services.", reportChannel: "USSD", latitude: -17.8419, longitude: 25.8606 },
  { id: "SR-004", incidentType: "Other", province: "Eastern", district: "Chipata", description: "Attempted assault in rural community.", status: "Escalated", createdAt: "2026-02-25T06:45:00Z", assignedResponder: "R-004", aiSummary: "Attempted assault in remote area. Escalated due to lack of local responders. Provincial command notified.", reportChannel: "USSD", latitude: -13.6333, longitude: 32.6500 },
  { id: "SR-005", incidentType: "Defilement", province: "Lusaka", district: "Chilanga", description: "School-related incident reported by teacher.", status: "In Progress", createdAt: "2026-02-26T10:00:00Z", assignedResponder: "R-001", aiSummary: "Defilement case reported through school channel. Social welfare and police coordinating response.", reportChannel: "PWA", latitude: -15.5500, longitude: 28.3000 },
  { id: "SR-006", incidentType: "Rape", province: "Northern", district: "Kasama", description: "Assault reported in peri-urban settlement.", status: "New", createdAt: "2026-02-27T03:20:00Z", assignedResponder: null, aiSummary: "New case from peri-urban area. Awaiting responder assignment based on proximity.", reportChannel: "USSD", latitude: -10.2167, longitude: 31.1833 },
  { id: "SR-007", incidentType: "Rape", province: "Copperbelt", district: "Ndola", description: "Workplace-related assault reported.", status: "In Progress", createdAt: "2026-02-25T16:30:00Z", assignedResponder: "R-002", aiSummary: "Workplace assault. HR department and police both engaged. Survivor receiving medical attention.", reportChannel: "PWA", latitude: -12.9587, longitude: 28.6366 },
  { id: "SR-008", incidentType: "Other", province: "Western", district: "Mongu", description: "Harassment and threats reported.", status: "New", createdAt: "2026-02-27T07:10:00Z", assignedResponder: null, aiSummary: "Ongoing harassment case. Pattern of threats documented. Preventive action recommended.", reportChannel: "USSD", latitude: -15.2547, longitude: 23.1522 },
];

export const mockResponders: Responder[] = [
  { id: "R-001", name: "Remmy Kangwa", type: "Activist", zone: "Lusaka Central", province: "Lusaka", status: "On Case", phone: "+260971234567", casesHandled: 47 },
  { id: "R-002", name: "Copperbelt VSU", type: "Police Station", zone: "Kitwe-Ndola Corridor", province: "Copperbelt", status: "Available", phone: "+260962345678", casesHandled: 83 },
  { id: "R-003", name: "Grace Mwamba", type: "Activist", zone: "Livingstone District", province: "Southern", status: "Available", phone: "+260953456789", casesHandled: 31 },
  { id: "R-004", name: "Eastern Province VSU", type: "Police Station", zone: "Chipata District", province: "Eastern", status: "Offline", phone: "+260944567890", casesHandled: 56 },
  { id: "R-005", name: "Chanda Mutale", type: "Activist", zone: "Kasama Urban", province: "Northern", status: "Available", phone: "+260935678901", casesHandled: 22 },
  { id: "R-006", name: "Western Province VSU", type: "Police Station", zone: "Mongu District", province: "Western", status: "Available", phone: "+260926789012", casesHandled: 38 },
];

export const mockAlerts: Alert[] = [
  { id: "A-001", caseId: "SR-001", responderId: "R-001", type: "SMS", message: "NEW CASE: Rape reported in Lusaka. Case SR-001. Please respond.", sentAt: "2026-02-27T08:31:00Z", delivered: true },
  { id: "A-002", caseId: "SR-002", responderId: "R-002", type: "Push", message: "ASSIGNED: Defilement case SR-002 in Kitwe. Minor involved.", sentAt: "2026-02-26T14:16:00Z", delivered: true },
  { id: "A-003", caseId: "SR-004", responderId: "R-004", type: "SMS", message: "ESCALATED: Case SR-004 in Chipata requires immediate attention.", sentAt: "2026-02-25T06:50:00Z", delivered: false },
  { id: "A-004", caseId: "SR-006", responderId: "R-005", type: "SMS", message: "NEW CASE: Rape reported in Kasama. Case SR-006.", sentAt: "2026-02-27T03:22:00Z", delivered: true },
  { id: "A-005", caseId: "SR-005", responderId: "R-001", type: "Push", message: "ASSIGNED: Defilement case SR-005 in Chilanga. School-related.", sentAt: "2026-02-26T10:02:00Z", delivered: true },
];

export const analyticsData = {
  reportsOverTime: [
    { month: "Sep", reports: 12 }, { month: "Oct", reports: 19 },
    { month: "Nov", reports: 24 }, { month: "Dec", reports: 18 },
    { month: "Jan", reports: 31 }, { month: "Feb", reports: 28 },
  ],
  reportsByProvince: [
    { province: "Lusaka", count: 34 }, { province: "Copperbelt", count: 28 },
    { province: "Southern", count: 15 }, { province: "Eastern", count: 12 },
    { province: "Northern", count: 9 }, { province: "Western", count: 7 },
    { province: "Central", count: 6 }, { province: "Luapula", count: 4 },
    { province: "Muchinga", count: 3 }, { province: "North-Western", count: 2 },
  ],
  responseTimeTrends: [
    { month: "Sep", avgMinutes: 45 }, { month: "Oct", avgMinutes: 38 },
    { month: "Nov", avgMinutes: 32 }, { month: "Dec", avgMinutes: 28 },
    { month: "Jan", avgMinutes: 22 }, { month: "Feb", avgMinutes: 18 },
  ],
  incidentTypes: [
    { type: "Rape", count: 52, fill: "hsl(174, 62%, 38%)" },
    { type: "Defilement", count: 38, fill: "hsl(43, 96%, 56%)" },
    { type: "Other", count: 18, fill: "hsl(200, 80%, 50%)" },
  ],
};
