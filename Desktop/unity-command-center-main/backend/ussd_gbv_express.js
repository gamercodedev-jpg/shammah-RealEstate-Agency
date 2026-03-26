// ussd_gbv_express.js
// Node.js Express backend for USSD GBV Support Assistant
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// --- AI Prompt Configuration (for documentation/reference) ---
const AI_SYSTEM_PROMPT = `You are an empathetic, non-judgmental GBV (Gender-Based Violence) support assistant developed for a secure, anonymous USSD reporting system in Zambia. Your goal is to guide the survivor through the reporting process calmly and safely. Tone: Always maintain a supportive, trauma-informed, and calm tone. Task: Extract three specific data points from the user's input: Incident Type (e.g., rape, defilement), Location (e.g., district or specific area), and Severity Level (High, Medium, or Low). Constraint: Never ask for the survivor's name or any personally identifiable information. Emergency: If the input indicates immediate physical danger (High Severity), immediately guide the user to contact emergency services while noting the report for automated alert triggering. Output Format: Provide a brief, supportive acknowledgment followed by a request for the next missing piece of information if necessary, or a confirmation message if the report is complete. You are assisting users who may have low digital literacy or are reporting from rural areas in Zambia. Keep all responses under 160 characters (the limit for USSD/SMS). Use clear, simple, and direct language. Avoid technical jargon. If the user provides an ambiguous location, kindly ask them to name the nearest landmark or local district.`;

// Dummy AI function (replace with real AI integration)
function aiProcess(userInput, context) {
    // Here you would call your AI model with the system prompt and user input
    // For demo, we return dummy extracted data
    return {
        incident_type: 'rape',
        location: 'Lusaka',
        severity: 'High',
        response: 'Thank you. Please call 991 for help. We are alerting support.' // <=160 chars
    };
}

// Dummy SMS function (replace with real SMS integration)
function sendSms(location, incidentType) {
    // Send SMS to police and activist
    console.log(`SMS sent to police and Remmy Kangwa: ${incidentType} at ${location}`);
}

// Dummy emergency alert trigger
function triggerEmergencyAlert(location, incidentType) {
    console.log(`Emergency alert triggered: ${incidentType} at ${location}`);
}

app.post('/ussd', (req, res) => {
    const userInput = req.body.text || '';
    const sessionId = req.body.sessionId || '';
    const context = {};
    const aiResult = aiProcess(userInput, context);
    // Emergency logic
    if (aiResult.severity.toLowerCase() === 'high') {
        triggerEmergencyAlert(aiResult.location, aiResult.incident_type);
        sendSms(aiResult.location, aiResult.incident_type);
    }
    // Never store PII
    res.send(aiResult.response);
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`USSD GBV Express server running on port ${PORT}`);
});
