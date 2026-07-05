# CommunityIQ — Hackathon Submission PPT Brief

## Brief About the Idea

CommunityIQ is an AI-powered Decision Intelligence Platform built for the theme **"AI for Better Living and Smarter Communities."** It acts as a City Operating System (City OS) that unifies real-time urban telemetry — spanning traffic congestion, air quality indexes, power grid loads, flood risk, waste management, and citizen sentiments — into a single, actionable intelligence workspace.

### How we approached the problem statement:
- We identified that modern municipalities are drowning in raw sensor and public service data but lack the cognitive infrastructure to interpret and act on it.
- We translated this into a working platform by building a multi-layer AI decision architecture using **Google Cloud Vertex AI** for scenario forecasting, **AlloyDB** (simulated vector embeddings) for RAG-based policy retrieval, **BigQuery** for stream aggregation, and a **Gemini-powered multi-agent chatbot** for natural language query resolution.
- The **ADK (AI Decision Kit)** dispatcher orchestrates emergency response agents that recommend and validate mitigation actions.

### Real-world problem and impact:
- City governments struggle to make time-sensitive decisions during critical events — heatwaves, flash floods, smog buildup, or power grid overloads.
- CommunityIQ cuts decision response time by providing contextual AI recommendations **before** crises peak: pre-positioning cooling centres, rerouting buses, activating load-shedding — all from a single console.
- Impact: Reduced health admissions, lower emergency overload rates, carbon offsets from optimized transit, and a measurable improvement in citizen satisfaction from proactive governance.

### Core architecture and data workflow:
1. **Live Data Layer:** Open-Meteo API (weather + air quality) feeds real-time telemetry into ward-level models.
2. **AI Reasoning Layer:** Vertex AI Forecasting runs predictive scenario models (heatwave/flood/smog) to compute impact metrics before dispatch.
3. **RAG Knowledge Layer:** AlloyDB vector store indexes municipal policy directives, disaster playbooks, and WHO guidelines — allowing semantic policy search and citation-linked answers.
4. **Gemini Agent Layer:** A conversational AI agent accepts freeform queries (e.g., "Which zones have congestion?") and activates simulation parameters.
5. **Digital Twin Visualization:** Leaflet.js maps rendered with heatmap overlays and bus route polylines allow operators to see cause-and-effect decisions spatially.

---

## Opportunities

### How different is it from existing ideas?
- Most "smart city" dashboards are passive — they display data but do not recommend, simulate, or optimize decisions. CommunityIQ bridges the **observe → reason → act** loop.
- Unlike static municipal dashboards, CommunityIQ features:
  - **Real-time AI scenario sandboxing** (pre-test interventions before deploying them)
  - **Explainable RAG** (every AI answer references source policy documents — no black box)
  - **Multi-role access** (City Admin, Citizen, Healthcare NGO, School, Business all see different intelligence layers relevant to them)
  - **Live geolocation onboarding** (any city in the world can be dynamically added and analyzed in real-time)

### USP of the proposed solution:
- **Decision Intelligence, not just Data Intelligence.** CommunityIQ doesn't just show AQI — it tells you which specific zones need cooling centres, what bus routes to reroute, and predicts the outcome before you commit resources.
- **Multi-stakeholder, multi-role platform** — a single OS for citizens, hospitals, schools, businesses, and administrators with customized intelligence views.
- **Explainable AI** — all recommendations trace back to real city policy directives with clickable source references, enabling accountable governance.

---

## List of Features

| Feature | Description |
|---|---|
| **Interactive GIS Digital Twin** | Leaflet.js map with heatmap overlays for traffic, AQI, flood risk, power grid, and waste bins |
| **Clickable Bus Route Paths** | Click any route badge (e.g., J1, M15) to draw the exact route polyline on the city map |
| **Vertex AI Scenario Planner** | Simulate extreme weather events and forecast impact before dispatching interventions |
| **AlloyDB RAG Policy Search** | Semantic search over municipal directives and disaster playbooks with citation links |
| **24-Hour AI Forecasting Chart** | Interactive timeline slider for zone-specific AQI, traffic, and grid load predictions |
| **Gemini Multi-Agent Copilot** | Natural language interface for querying live telemetry and triggering optimizations |
| **Emergency Command Center** | Real-time incident console with multi-step mitigation dispatch and ward coordination |
| **Citizen Sentiment Monitor** | Crowd-sourced complaint analysis and live satisfaction scoring across city zones |
| **Sustainability Dashboard** | Green energy consumption, solar penetration, EV adoption, and carbon offset metrics |
| **Data Ingestion Portal** | Live feed visualization of weather, AQI, and telemetry streams across all city wards |
| **Smart Geolocation Startup** | IP-based city detection with proximity matching to nearest global hub and '+' onboarding |
| **Multi-Role Access Control** | 5 role types — admin, citizen, health, education, business — with filtered intelligence views |
| **Landing Page City Selector** | Pre-select telemetry city context before launching into the full dashboard console |
| **About & Privacy Modal** | Inline platform disclosures, GDPR/CCPA compliance, copyright, and tech stack notes |

---

## Process Flow / Use-Case Diagram

```
[User Logs In]
      │
      ▼
[Landing Page → Select City Context]
      │
      ▼
[Dashboard Shell Loads — City OS Console]
      │
      ├──────────────────────────────────────────┐
      │                                          │
      ▼                                          ▼
[Digital Twin Simulator]              [AI Decision Room]
 - GIS heatmap layers                  - Vertex AI Scenario Planner
 - Bus route path drawing              - RAG Policy Search
 - Emergency flood overlay             - 24h Forecast Slider
      │                                          │
      ▼                                          ▼
[Gemini Copilot Query]        [Emergency Command Center]
 - Natural language Q&A         - Incident dispatch
 - Auto-set layers/zones        - Mitigation checklist
 - Recommend actions            - ADK agent activation
      │                                │
      └──────────────┬─────────────────┘
                     ▼
           [Notification Center]
            - Real-time toasters
            - Alert drawer
            - Unread badge count
```

---

## Wireframes / Mock Diagrams

> Screenshots and live demo: http://localhost:5173 (or deployed URL)

Key screens:
1. **Landing Page** — Glassmorphic city selector grid with "Launch City OS" CTA
2. **Overview Dashboard** — KPI stat cards, zone traffic bars, AI agent status table
3. **Digital Twin Map** — Dark Leaflet map with heatmaps, ward markers, and bus route polylines
4. **AI Decision Room** — 3-panel layout: Scenario Sandbox | RAG Console | 24h Forecast
5. **Emergency Center** — Split view: Dispatch console (left) + Flood risk map (right)
6. **Gemini Copilot** — Floating chat bubble / expanded modal with typing indicators

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                   CommunityIQ City OS                    │
│                React 18 + Vite Frontend                  │
└──────────┬───────────────────────────────────────────────┘
           │
    ┌──────┴─────────────────────────────────────────────┐
    │              AI Intelligence Layer                  │
    │                                                     │
    │  ┌─────────────────┐   ┌──────────────────────────┐│
    │  │  Vertex AI      │   │   AlloyDB Vector Store   ││
    │  │  Forecasting    │   │   (Policy RAG Index)     ││
    │  │  Scenario Model │   │   + Semantic Search      ││
    │  └─────────────────┘   └──────────────────────────┘│
    │                                                     │
    │  ┌─────────────────┐   ┌──────────────────────────┐│
    │  │ Gemini Agent    │   │  BigQuery Analytics      ││
    │  │ (NL Interface)  │   │  (Aggregation Layer)     ││
    │  │ + ADK Dispatch  │   │  + Looker Dashboards     ││
    │  └─────────────────┘   └──────────────────────────┘│
    └────────────────────────────────────────────────────┘
           │
    ┌──────┴──────────────────────────────────────────────┐
    │             Real-Time Data Sources                  │
    │  Open-Meteo Weather API │ Air Quality API            │
    │  IP Geolocation API     │ Leaflet GIS Engine         │
    └────────────────────────────────────────────────────┘
```

---

## Technologies / Google / Services Used

| Service | Role | Why chosen |
|---|---|---|
| **Google Vertex AI** | Predictive scenario modeling, outcome forecasting | Enterprise-grade ML forecasting with scalable inference |
| **Google AlloyDB** | Vector embedding store for policy documents (RAG) | PostgreSQL-compatible vector search for semantic retrieval |
| **Google BigQuery** | Stream aggregation, analytics, policy cross-reference | Serverless, auto-scaling data warehouse for urban telemetry |
| **Google Looker** | Energy analytics visualization (integrated reports) | Native BI integration with BigQuery for real-time dashboards |
| **Gemini (ADK)** | Natural language agent + multi-agent dispatch | Multi-modal reasoning for contextual city operations |
| **Open-Meteo API** | Real weather + air quality live data (no key required) | Free, globally available, high-frequency telemetry source |
| **Leaflet.js** | Interactive dark-mode GIS visualization | Lightweight, plugin-rich, perfect for custom map overlays |
| **React 18 + Vite** | Frontend SPA framework | Fast HMR, modern component model, small production bundle |

### Scalability & Real-World Deployment:
- The platform is designed to be **city-agnostic**: any city can be onboarded by geocoding its coordinates and dynamically generating zone models.
- **AlloyDB** vector indexes scale horizontally — adding new policy documents only requires embedding generation, not retraining.
- **Vertex AI** models can be fine-tuned on real municipal sensor data once deployed in production.
- The **ADK agent framework** supports tool chaining, allowing future integration with real emergency dispatch APIs (e.g., 911/112 systems, municipal ERP).
- Frontend is fully deployable to **Firebase Hosting** or **Google Cloud Run** with zero configuration changes.

---

## Snapshots of the Prototype

> Run `npm run dev` in the project directory and open the local URL to view the live prototype.

Key interactions to demonstrate:
1. Open landing page → select city → Launch Console
2. Navigate to Digital Twin → switch traffic/AQI/flood layers → click a zone → click a bus route (e.g., M1) to draw route on map
3. Open AI Decision Room → select Heatwave scenario → check recommendations → Run simulation → view predicted outcomes
4. Search policy in RAG agent → click citation source to open AlloyDB document modal
5. Open Gemini Copilot → type "which zones have high pollution?" → watch auto-layer switch
6. Navigate to Emergency Center → trigger incident → step through mitigation dispatch
7. Click ℹ️ topbar icon → view About platform tab and Data Privacy tab
