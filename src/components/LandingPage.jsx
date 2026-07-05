import React, { useState } from 'react';
import { Brain, Cpu, ShieldAlert, Leaf, MessageSquare, Database, Sparkles, ChevronRight, Activity, Globe } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function LandingPage({
  onEnter,
  initialCityId,
  onCitySelect,
  cities,
  userDetectedCity,
  onOnboardCity
}) {
  const [selectedCityId, setSelectedCityId] = useState(initialCityId);

  const handleSelectCity = (id) => {
    setSelectedCityId(id);
    onCitySelect(id);
  };

  const isDetectedOnboarded = userDetectedCity && cities[userDetectedCity.id];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 10%, #111827 0%, #030712 100%)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      overflowY: 'auto',
      position: 'relative'
    }}>
      {/* Decorative Grid Background */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        pointerEvents: 'none',
        zIndex: 0
      }}/>

      {/* Decorative Blur Orbs */}
      <div style={{
        position: 'absolute',
        top: '15%', left: '20%',
        width: '300px', height: '300px',
        background: 'rgba(20, 184, 166, 0.08)',
        filter: 'blur(80px)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }}/>
      <div style={{
        position: 'absolute',
        bottom: '15%', right: '20%',
        width: '300px', height: '300px',
        background: 'rgba(99, 102, 241, 0.08)',
        filter: 'blur(80px)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }}/>

      {/* Content wrapper */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '900px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        {/* Header Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '50px',
          padding: '8px 20px',
          marginBottom: '30px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(8px)'
        }}>
          <img
            src={logoImg}
            alt="CommunityIQ"
            style={{ height: 24, width: 'auto', objectFit: 'contain', borderRadius: '100%' }}
          />
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-dim)' }}>
            City OS Console
          </span>
          <div className="live-dot" style={{ background: 'var(--teal)', boxShadow: '0 0 8px var(--teal)' }}/>
        </div>

        {/* Hero Wording */}
        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 44px)',
          fontWeight: 900,
          lineHeight: 1.15,
          letterSpacing: '-.02em',
          margin: '0 0 16px 0',
          background: 'linear-gradient(to right, #ffffff, #9ca3af)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          CommunityIQ: AI Decision Intelligence OS
        </h1>
        <p style={{
          fontSize: 'clamp(14px, 2vw, 17px)',
          color: 'var(--fg-muted)',
          maxWidth: '650px',
          lineHeight: 1.5,
          margin: '0 0 35px 0'
        }}>
          A Google Cloud Vertex AI & AlloyDB powered command center designed to optimize urban mobility, power grid loads, climate emergencies, and community welfare in real-time.
        </p>

        {/* Action pillars */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          width: '100%',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.01)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'left'
          }}>
            <Cpu style={{ color: 'var(--teal)', marginBottom: '10px' }} size={20}/>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 700 }}>Twin Simulator</h4>
            <p style={{ margin: 0, fontSize: '10.5px', color: 'var(--fg-muted)', lineHeight: 1.4 }}>Live telemetry mapping for traffic, AQI, and municipal assets.</p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.01)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'left'
          }}>
            <Brain style={{ color: 'var(--indigo)', marginBottom: '10px' }} size={20}/>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 700 }}>AI Decision Room</h4>
            <p style={{ margin: 0, fontSize: '10.5px', color: 'var(--fg-muted)', lineHeight: 1.4 }}>Vertex AI scenario planner and AlloyDB policy search index.</p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.01)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'left'
          }}>
            <ShieldAlert style={{ color: 'var(--rose)', marginBottom: '10px' }} size={20}/>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 700 }}>Incident Command</h4>
            <p style={{ margin: 0, fontSize: '10.5px', color: 'var(--fg-muted)', lineHeight: 1.4 }}>Real-time warning toasters and mitigation dispatch protocols.</p>
          </div>
        </div>

        {/* Context Selector Card */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '20px',
          width: '100%',
          maxWidth: '580px',
          marginBottom: '35px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--fg-dim)', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Globe size={11}/>
            Select Telemetry City Context
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px'
          }}>
            {/* Render onboarded cities */}
            {Object.values(cities).map(c => (
              <button
                key={c.id}
                onClick={() => handleSelectCity(c.id)}
                style={{
                  background: selectedCityId === c.id ? 'var(--teal-glow)' : 'rgba(255,255,255,0.02)',
                  border: selectedCityId === c.id ? '1px solid var(--teal)' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  padding: '8px 4px',
                  cursor: 'pointer',
                  color: '#fff',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontSize: '16px', marginBottom: '2px' }}>{c.flag}</div>
                <div style={{ fontSize: '10.5px', fontWeight: 700 }}>{c.name}</div>
              </button>
            ))}

            {/* Dynamic "+" button to add detected location if not onboarded yet */}
            {userDetectedCity && !isDetectedOnboarded && (
              <button
                onClick={() => {
                  onOnboardCity(userDetectedCity);
                  handleSelectCity(userDetectedCity.id);
                }}
                style={{
                  background: 'rgba(20, 184, 166, 0.05)',
                  border: '1px dashed var(--teal)',
                  borderRadius: '8px',
                  padding: '8px 4px',
                  cursor: 'pointer',
                  color: '#fff',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 0 10px rgba(20, 184, 166, 0.15)'
                }}
                title={`Onboard detected location: ${userDetectedCity.name}`}
              >
                <div style={{ fontSize: '16px', marginBottom: '2px', color: 'var(--teal)'}}>+</div>
                <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--teal)' }}>{userDetectedCity.name}</div>
              </button>
            )}
          </div>
        </div>

        {/* Enter Dashboard Trigger */}
        <button
          onClick={onEnter}
          className="chat-send-btn"
          style={{
            height: '46px',
            borderRadius: '8px',
            padding: '0 32px',
            fontSize: '14px',
            fontWeight: 800,
            background: 'var(--indigo)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: 'none'
          }}
        >
          <span>Launch City OS Console</span>
          <ChevronRight size={16}/>
        </button>

      </div>
    </div>
  );
}
