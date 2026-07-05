# CommunityIQ — AI-Powered Decision Intelligence Platform

CommunityIQ is a next-generation City OS and Decision Intelligence Platform designed to help individuals, communities, organizations, and municipal stakeholders analyze structured/unstructured urban data, generate real-time predictive insights, and deploy optimized action protocols.

Built around the theme **"AI for Better Living and Smarter Communities"**, CommunityIQ leverages dynamic simulation models, Google Cloud Vertex AI, and AlloyDB vector stores to optimize city-wide systems including transportation, air quality, power load, flood mitigation, and citizen sentiments.

---

## 🌟 Key Features

### 1. Digital Twin Simulator (Map telemetry)
- Multi-layered Leaflet interactive visualization.
- Map overlays for **Traffic Delays**, **Air Quality Index (AQI)**, **Power Grid Load**, and **Waste Bins**.
- Interactive simulated parameters for storm rainfall, public transit boosts, and grid load-shaving.

### 2. Vertex AI Decision Room & RAG Center
- **Scenario Sandbox:** Pre-model and simulate critical actions for monsoons, heatwaves, or smog grid surges. Calculates predictive metric shifts (grid safety, medical load reduction, carbon offsets) before dispatch.
- **Explainable RAG Search:** Semantic lookup over local municipal directives (AlloyDB vector mock) with clickable source citation modals.
- **24-Hour Timeline Forecasting:** Inspect forecasted variables for the next 24 hours using custom glowing SVG analytics line charts.

### 3. Gemini Copilot (Multi-Agent Assistant)
- Integrated chatbot console capable of accepting text queries and recommending operations.
- Presets for quick telemetry query templates (e.g. *Which areas have traffic congestion?*, *Why is electricity high?*).
- Auto-collapses into a clean floating bubble or expands into a centered workspace.

### 4. Incident Command & Alerts Center
- Real-time notification toaster mapping warning and critical environmental thresholds.
- Interactive responder dispatch console and mitigation checklist, allowing operators to coordinate rescue, utility, and medical units.

### 5. Smart Geolocation Recommendations
- Automatically geolocates the user's city name (e.g. *Bengaluru*) via IP-based geolocation and matches it to the closest global regional anchor on startup.
- Prompts for safety switch confirmation (`Current Location: Bengaluru` ➔ `Target Location: New York`) before updating context.

---

## ⚙️ Tech Stack & Integrations

- **Core Framework:** React 18, Vite, Lucide Icons, React Hot Toast
- **Mapping Engine:** Leaflet.js (dark-mode CartoDB basemap, Heatmap layers)
- **API integrations:** Open-Meteo Weather API, Open-Meteo Air Quality API
- **AI Integrations (Simulated):** Google Cloud Vertex AI Search, AlloyDB Embedding index matching, BigQuery analytics nodes

---

## 🚀 Getting Started

### Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation
1. Clone or download the repository contents into your local workspace.
2. Open terminal in the directory and run:
   ```bash
   npm install
   ```

### Running Locally
To launch the hot-reload development server:
```bash
npm run dev
```
Open the printed local URL (typically `http://localhost:5173/` or `5174/`) in your browser.

---

## ⚖️ License & Data Privacy
CommunityIQ is fully compliant with modern data governance guidelines (GDPR, CCPA). Citizen complaint logs, coordinates, and telemetry metadata are anonymized. Refer to the in-app **About & Privacy** page for the complete framework disclosures.
