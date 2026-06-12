# AI Agents Hackathon 2026 - Translating Your Needs

Translating Your Needs is a low-bandwidth multi-agent support app for urgent and accessibility-focused scenarios in Lebanon.

This MVP now includes three working agent tracks:

- Blood support:
  - collects urgent blood requests in natural language,
  - asks follow-up questions,
  - generates a grounded action plan,
  - shows official institutions and live official context when reachable,
  - matches demo or network donors,
  - supports donor outreach by email when SMTP is configured.
- Wheelchair accessibility:
  - helps users search accessible restaurants, hotels, and transport,
  - turns mobility needs into structured accessibility checks,
  - generates targeted Google Maps searches,
  - runs live web search for real venue or provider results,
  - suggests the best practical road or route strategy when pickup and destination are provided.
- Hearing accessibility:
  - reconstructs messy or phone-first communication,
  - analyzes written needs and pasted transcripts,
  - performs live web search for relevant services,
  - supports speech-to-text audio transcription,
  - can generate spoken replies with browser or AI voice output.

## Structure

- `backend/` Express API
- `frontend/` Static web UI
- `ai agent/` OpenAI agent prompts, logic, and verified institution data

## Run locally

1. Open a terminal in `backend`
2. Install backend dependencies:

```powershell
npm.cmd install
```

3. Install AI agent dependencies:

```powershell
Set-Location '..\\ai agent'
npm.cmd install
Set-Location '..\\backend'
```

4. Add your OpenAI key in `backend/.env`.

Start from `backend/.env.example` and create `backend/.env`:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5-mini
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password
EMAIL_FROM=your_email@example.com
```

5. Start the app:

```powershell
npm.cmd start
```

6. Open `http://localhost:4000`

## API

### `POST /api/chat`

Request body:

```json
{
  "language": "en",
  "messages": [
    {
      "role": "user",
      "text": "We need 2 units of O- blood in Beirut within 24 hours."
    }
  ]
}
```

### `POST /api/triage`

Request body:

```json
{
  "bloodType": "O-",
  "city": "Beirut",
  "unitsNeeded": 2,
  "urgency": "within_24h",
  "patientType": "surgery",
  "contactMethod": "whatsapp",
  "language": "en"
}
```

### `GET /api/institutions`

Returns the verified official institutions currently wired into the app.

### `POST /api/wheelchair-assist`

Request body:

```json
{
  "language": "en",
  "category": "transport",
  "city": "Beirut",
  "neighborhood": "Badaro",
  "userNeed": "I need the easiest wheelchair-friendly route to a mall",
  "accessibilityNeeds": ["wheelchair_vehicle", "ramp"],
  "pickup": "Badaro, Beirut",
  "destination": "City Centre Beirut"
}
```

### `POST /api/hearing-assist`

Request body:

```json
{
  "language": "en",
  "inputLanguage": "mixed",
  "userNeed": "I need an ENT appointment and they should confirm by text.",
  "searchScope": "clinics",
  "incomingTranscript": "They said call us tomorrow morning and ask for the doctor.",
  "replyIntent": "Please confirm by WhatsApp text instead of phone.",
  "preferredChannel": "whatsapp"
}
```

### `POST /api/hearing-transcribe`

Accepts recorded audio in base64 and returns AI speech-to-text transcription.

### `POST /api/hearing-speak`

Generates AI speech audio for the hearing-access reply draft.

## Notes

- The actual AI generation lives under `ai agent/`.
- The backend currently calls `bloodSupportAgent`, `wheelchairSupportAgent`, and `hearingSupportAgent`.
- `backend/.env` is the easiest place to set `OPENAI_API_KEY` for local testing.
- The app no longer claims fake blood inventory.
- Live official context is currently fetched from the Lebanese Red Cross website when reachable.
- Email sending is available through `POST /api/send-email` when SMTP env vars are configured.
- Demo donor volunteer matches are included for showcase purposes only and are clearly marked as demo data.
- Google Maps is used through standard search and directions URLs, not through a paid Google Maps API integration.
- The wheelchair route analysis is AI-assisted guidance plus live search context, not guaranteed turn-by-turn navigation.
- The hearing track can use browser speech recognition fallback or AI transcription, depending on browser support.

## Demo framing

For the hackathon pitch, describe this as:

> A multi-agent coordination platform for people in need in Lebanon, combining blood support, wheelchair accessibility planning, and hearing-access communication help in one product.
