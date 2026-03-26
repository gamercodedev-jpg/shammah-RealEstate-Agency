

# SafeReport Zambia — AI-Powered GBV Reporting System (Frontend)

## Overview
A progressive web app (PWA) for anonymous reporting of rape and defilement in Zambia, combining a USSD-style reporting flow for survivors with a powerful dashboard for law enforcement and human rights activists.

## Pages & Features

### 1. Landing Page
- Hero section with the project mission and a clear call-to-action
- "Report Now" button leading to the reporting flow
- "Admin Login" button for dashboard access
- Stats section showing impact numbers (reports filed, response times, areas covered)
- Simple, calming color palette (teal/blue tones) to feel safe and approachable

### 2. USSD Reporting Flow (Survivor-Facing)
- A phone-screen simulator that mimics the USSD menu experience step-by-step:
  - **Step 1**: Welcome screen — "Press 1 to Report, 2 for Help, 3 for Emergency"
  - **Step 2**: Incident type selection (Rape / Defilement / Other)
  - **Step 3**: Location input (province/district selection)
  - **Step 4**: Anonymous description (free text)
  - **Step 5**: AI empathetic response preview (simulated)
  - **Step 6**: Confirmation — "Your report has been submitted. Help is on the way."
- Each step transitions like a real USSD session with a retro phone UI feel

### 3. Admin Dashboard (Protected by mock login)
- **Overview Cards**: Total reports, pending cases, resolved cases, average response time
- **Live Case Feed**: Table of incoming reports with status badges (New, In Progress, Resolved, Escalated)
- **Case Detail View**: Click a case to see full details — incident type, location, timestamp, assigned responder, AI-generated summary
- **Map View**: Interactive map of Zambia showing report hotspots by province/district
- **Analytics Charts**:
  - Reports over time (line chart)
  - Reports by province (bar chart)
  - Response time trends (area chart)
  - Incident type breakdown (pie chart)

### 4. Responder Management
- List of registered activists and police stations with their assigned zones
- Status indicators (Available / On Case / Offline)
- Auto-routing preview showing which responder gets assigned based on location

### 5. Alert Center
- Notification feed showing SMS/push alerts sent to responders
- Alert history with timestamps and delivery status

### 6. Settings Page
- USSD menu configuration panel (view/edit the flow steps)
- Notification preferences
- User profile management

## Navigation
- Sidebar navigation for the dashboard with icons
- Mobile-responsive with bottom navigation on small screens

## Design
- Clean, modern UI with a calming teal/green + white color scheme
- Zambia-themed subtle accents
- Accessible fonts and high contrast for readability
- PWA setup (installable, offline-capable shell)

## Data
- All data will be mock/hardcoded JSON for now, structured to match future Supabase tables
- Mock cases, responders, and analytics data pre-populated for demo purposes

