# ussd_gbv_flask.py
# Python Flask backend for USSD GBV Support Assistant
from flask import Flask, request, jsonify
import os

app = Flask(__name__)

# --- AI Prompt Configuration ---
AI_SYSTEM_PROMPT = (
    "You are an empathetic, non-judgmental GBV (Gender-Based Violence) support assistant developed for a secure, anonymous USSD reporting system in Zambia. "
    "Your goal is to guide the survivor through the reporting process calmly and safely. "
    "Tone: Always maintain a supportive, trauma-informed, and calm tone. "
    "Task: Extract three specific data points from the user's input: Incident Type (e.g., rape, defilement), Location (e.g., district or specific area), and Severity Level (High, Medium, or Low). "
    "Constraint: Never ask for the survivor's name or any personally identifiable information. "
    "Emergency: If the input indicates immediate physical danger (High Severity), immediately guide the user to contact emergency services while noting the report for automated alert triggering. "
    "Output Format: Provide a brief, supportive acknowledgment followed by a request for the next missing piece of information if necessary, or a confirmation message if the report is complete. "
    "You are assisting users who may have low digital literacy or are reporting from rural areas in Zambia. "
    "Keep all responses under 160 characters (the limit for USSD/SMS). Use clear, simple, and direct language. Avoid technical jargon. "
    "If the user provides an ambiguous location, kindly ask them to name the nearest landmark or local district."
)

# Dummy AI function (replace with real AI integration, e.g., OpenAI API)
def ai_process(user_input, context):
    # Here you would call your AI model with the system prompt and user input
    # For demo, we return dummy extracted data
    return {
        "incident_type": "rape",
        "location": "Lusaka",
        "severity": "High",
        "response": "Thank you. Please call 991 for help. We are alerting support."  # <=160 chars
    }

# Dummy SMS function (replace with real SMS integration)
def send_sms(location, incident_type):
    # Send SMS to police and activist
    print(f"SMS sent to police and Remmy Kangwa: {incident_type} at {location}")

# Dummy emergency alert trigger
def trigger_emergency_alert(location, incident_type):
    print(f"Emergency alert triggered: {incident_type} at {location}")

@app.route('/ussd', methods=['POST'])
def ussd_handler():
    user_input = request.form.get('text', '')
    session_id = request.form.get('sessionId', '')
    # context could be session-based or stateless
    context = {}
    ai_result = ai_process(user_input, context)
    # Emergency logic
    if ai_result["severity"].lower() == "high":
        trigger_emergency_alert(ai_result["location"], ai_result["incident_type"])
        send_sms(ai_result["location"], ai_result["incident_type"])
    # Never store PII
    return ai_result["response"]

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
