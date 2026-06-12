# AI Agents Hackathon 2026 - Translating Your Needs

Translating Your Needs is a low-bandwidth web app for urgent support scenarios in Lebanon.

This MVP focuses on a blood-support chat agent that helps a family coordinator or volunteer:
- describe an urgent blood request in natural language,
- answer follow-up questions from the agent,
- receive a grounded plan and donor outreach message from OpenAI,
- see official institutions and live official context when it is publicly reachable.

The product shell is intentionally designed so a wheelchair accessibility flow can be merged in later as a second agent experience.

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

## Notes

- The actual AI generation lives under `ai agent/`.
- The backend calls `../ai agent/agents/bloodSupportAgent`.
- `backend/.env` is the easiest place to set `OPENAI_API_KEY` for local testing.
- The app no longer claims fake blood inventory.
- Live official context is currently fetched from the Lebanese Red Cross website when reachable.
- Email sending is available through `POST /api/send-email` when SMTP env vars are configured.
- Demo donor volunteer matches are included for showcase purposes only and are clearly marked as demo data.

## Demo framing

For the hackathon pitch, describe this as:

> An AI coordination agent for people in need in Lebanon, starting with urgent blood requests and designed to expand into disability accessibility support.
