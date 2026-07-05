import React from 'react';
import { Info, ShieldAlert, Cpu, Database, Brain, Globe, HelpCircle } from 'lucide-react';

export default function AboutPage({ city, view = 'about' }) {
  if (view === 'privacy') {
    return (
      <div className="fade-in" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px', height: 'auto', overflowY: 'visible' }}>
        {/* Page Header */}
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '18px', fontWeight: 800 }}>
            <ShieldAlert size={18} style={{ color: 'var(--rose)' }}/>
            Data Privacy & Governance
          </h2>
          <span style={{ fontSize: '11px', color: 'var(--fg-muted)' }}>
            Compliance frameworks, anonymization layers, and telemetry privacy regulations.
          </span>
        </div>

        <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Privacy Policy Card */}
          <div className="panel">
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12.5px', lineHeight: 1.6 }}>
              <p>
                CommunityIQ respects user privacy and enforces strict data governance across all municipalities.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--fg)', fontSize: '13px' }}>1. Citizen Anonymization</div>
                  <div style={{ color: 'var(--fg-muted)', fontSize: '11.5px', marginTop: '4px', lineHeight: 1.4 }}>
                    All citizen complaints, comments, and sentiment feeds are fully anonymized. Metadata tags (user profiles, IP addresses, exact device fingerprints) are stripped at the ingest gateway before being written to BigQuery nodes.
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--fg)', fontSize: '13px' }}>2. Geolocation Safeguards</div>
                  <div style={{ color: 'var(--fg-muted)', fontSize: '11.5px', marginTop: '4px', lineHeight: 1.4 }}>
                    Our startup city-recommendation utilizes IP geolocation or browser GPS coordinates exclusively client-side to calculate distance offsets. Coordinates are never stored permanently, cached on our servers, or shared with third-party APIs.
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--fg)', fontSize: '13px' }}>3. Compliance Standards</div>
                  <div style={{ color: 'var(--fg-muted)', fontSize: '11.5px', marginTop: '4px', lineHeight: 1.4 }}>
                    Our platform conforms strictly with the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA). Under these regulations, citizens retain full "right to be forgotten" over reported municipal complaints.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default 'about' view
  return (
    <div className="fade-in" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px', height: 'auto', overflowY: 'visible' }}>
      {/* Page Header */}
      <div>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '18px', fontWeight: 800 }}>
          <Info size={18} style={{ color: 'var(--teal)' }}/>
          About CommunityIQ
        </h2>
        <span style={{ fontSize: '11px', color: 'var(--fg-muted)' }}>
          Information architecture, concept background, and system specifications.
        </span>
      </div>

      <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* About Platform Card */}
        <div className="panel">
          <div className="panel-head">
            <div className="panel-head-left">
              <Brain size={13} style={{ color: 'var(--indigo)' }}/>
              <span className="panel-head-title">Platform Mission & Concept</span>
            </div>
          </div>
          <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px', lineHeight: 1.6 }}>
            <p>
              <strong>CommunityIQ</strong> is a unified City Operating System (City OS) designed under the hackathon challenge 
              <em> "AI for Better Living and Smarter Communities."</em>
            </p>
            <p>
              Modern municipalities capture huge streams of structured and unstructured telemetry (traffic sensors, weather meters, 
              power grids, citizen comments). CommunityIQ integrates these data layers, utilizing predictive models and intelligent 
              automation to give city administrators and citizens a clear decision-making workspace.
            </p>
            
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '6px' }}>
              <div style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: '8px' }}>
                AI Core Technology Stack
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <Cpu size={14} style={{ color: 'var(--teal)', marginTop: '2px', flexShrink: 0 }}/>
                  <div>
                    <strong>Vertex AI Forecasting:</strong> Simulates grid safety, healthcare load reduction, and transit factors under extreme weather conditions before dispatcher deployment.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <Database size={14} style={{ color: 'var(--indigo)', marginTop: '2px', flexShrink: 0 }}/>
                  <div>
                    <strong>AlloyDB Vector Engine (RAG):</strong> Stores policy guidelines and disaster playbooks, enabling semantic lookups and citation indexing in our search agent.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <Globe size={14} style={{ color: 'var(--sky)', marginTop: '2px', flexShrink: 0 }}/>
                  <div>
                    <strong>Looker & BigQuery:</strong> Aggregates live weather and air quality datasets (via Open-Meteo CDN) to compute dynamic zone risks.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright & Disclaimer Card */}
        <div className="panel">
          <div className="panel-head">
            <div className="panel-head-left">
              <HelpCircle size={13} style={{ color: 'var(--amber)' }}/>
              <span className="panel-head-title">Copyright & Disclaimers</span>
            </div>
          </div>
          <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11.5px', lineHeight: 1.4 }}>
            <div>
              <strong>Copyright © 2026 CommunityIQ Platforms Inc.</strong>
              <br/>
              All code, system frameworks, assets, and design systems are property of their respective creators.
            </div>
            <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: '6px', padding: '10px', display: 'flex', gap: '8px' }}>
              <ShieldAlert size={16} style={{ color: 'var(--amber)', flexShrink: 0, marginTop: '2px' }}/>
              <div>
                <strong style={{ color: 'var(--amber)' }}>Simulated Telemetry Disclaimer:</strong>
                <br/>
                All metric models (traffic load, grid safety indexes, flood probabilities, and RAG answer references) are simulated for demonstration purposes. This dashboard is not a direct connection to active emergency dispatch services in {city.name}.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
