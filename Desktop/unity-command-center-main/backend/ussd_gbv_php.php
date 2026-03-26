<?php
// ussd_gbv_php.php
// PHP backend for USSD GBV Support Assistant

// --- AI Prompt Configuration (for documentation/reference) ---
$AI_SYSTEM_PROMPT = "You are an empathetic, non-judgmental GBV (Gender-Based Violence) support assistant developed for a secure, anonymous USSD reporting system in Zambia. Your goal is to guide the survivor through the reporting process calmly and safely. Tone: Always maintain a supportive, trauma-informed, and calm tone. Task: Extract three specific data points from the user's input: Incident Type (e.g., rape, defilement), Location (e.g., district or specific area), and Severity Level (High, Medium, or Low). Constraint: Never ask for the survivor's name or any personally identifiable information. Emergency: If the input indicates immediate physical danger (High Severity), immediately guide the user to contact emergency services while noting the report for automated alert triggering. Output Format: Provide a brief, supportive acknowledgment followed by a request for the next missing piece of information if necessary, or a confirmation message if the report is complete. You are assisting users who may have low digital literacy or are reporting from rural areas in Zambia. Keep all responses under 160 characters (the limit for USSD/SMS). Use clear, simple, and direct language. Avoid technical jargon. If the user provides an ambiguous location, kindly ask them to name the nearest landmark or local district.";

// Dummy AI function (replace with real AI integration)
function ai_process($user_input, $context) {
    // Here you would call your AI model with the system prompt and user input
    // For demo, we return dummy extracted data
    return array(
        "incident_type" => "rape",
        "location" => "Lusaka",
        "severity" => "High",
        "response" => "Thank you. Please call 991 for help. We are alerting support." // <=160 chars
    );
}

// Dummy SMS function (replace with real SMS integration)
function send_sms($location, $incident_type) {
    // Send SMS to police and activist
    error_log("SMS sent to police and Remmy Kangwa: $incident_type at $location");
}

// Dummy emergency alert trigger
function trigger_emergency_alert($location, $incident_type) {
    error_log("Emergency alert triggered: $incident_type at $location");
}

// USSD handler
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_input = isset($_POST['text']) ? $_POST['text'] : '';
    $session_id = isset($_POST['sessionId']) ? $_POST['sessionId'] : '';
    $context = array();
    $ai_result = ai_process($user_input, $context);
    // Emergency logic
    if (strtolower($ai_result['severity']) === 'high') {
        trigger_emergency_alert($ai_result['location'], $ai_result['incident_type']);
        send_sms($ai_result['location'], $ai_result['incident_type']);
    }
    // Never store PII
    echo $ai_result['response'];
    exit;
}
?>
