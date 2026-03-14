# 🎵 MindBeat Live: AI Soulmate

**MindBeat Live** is an empathetic AI companion developed for the LINE messaging platform. Powered by **Google Gemini 1.5 Flash**, it serves as a safe space for users to share their stories, receive emotional support through music and reflection, and track their emotional journey over time.

## ✨ Key Features

* **AI-Powered Empathy:** Analyzes user messages to provide a personalized greeting, a supportive 4-line song lyric, and a heartfelt reflection.
* **Emotional Dashboard:** A beautiful, minimalist interface featuring a **Doughnut Chart** to visualize mood distributions.
* **Historical Tracking:** Users can view their emotional history filtered by "Today," "Last 7 Days," or "All Time."
* **Dual Access Mode:** * **LINE Integration:** Seamless automatic login using LINE Front-end Framework (LIFF).
* **Guest Access:** External browser support via a unique 5-digit Member ID.


* **Multilingual:** Full support for both **Thai** and **English** languages.

## 🚀 Tech Stack

* **Language:** JavaScript (Vanilla), HTML5, CSS3
* **Backend:** Google Apps Script (GAS)
* **AI Engine:** Google Gemini 2.5 Flash API
* **Database:** Google Sheets
* **Platform:** LINE Messaging API & LIFF

## 📋 Project Structure

* `Code.js`: The backend logic handling LINE Webhooks, Gemini API calls, and Google Sheets database management.
* `index.html`: The frontend dashboard and chat interface designed with a focus on mental well-being.

## 🔧 Installation & Setup

1. **Google Sheets:** Create a new sheet and copy its **Spreadsheet ID**.
2. **Google Apps Script:**
* Create a new GAS project.
* Paste the content of `Code.js` and `index.html`.
* Replace the placeholder constants (`GEMINI_API_KEY`, `SPREADSHEET_ID`, `LINE_ACCESS_TOKEN`) with your own credentials.


3. **Deployment:** * Deploy as a **Web App** (Set access to "Anyone").
* Copy the Web App URL for your LINE Webhook and LIFF Endpoint.


4. **LINE Developers Console:**
* Create a Messaging API channel and a LIFF app.
* Enable **Scopes** for `profile` and `openid`.



## 🛡️ Privacy & Security

This project uses a private Google Sheet as a database. For public deployment on GitHub, ensure all sensitive API keys and IDs are removed or stored as environment variables.
