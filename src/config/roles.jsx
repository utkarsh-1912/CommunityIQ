import React from 'react';
import { Building2, Users, HeartPulse, GraduationCap, Briefcase } from 'lucide-react';

export const ROLES = [
  {
    id: 'admin',
    label: 'City Administrator',
    icon: <Building2 size={13}/>,
    color: 'var(--teal)',
    desc: 'Full access — all dashboards',
    pages: ['overview','twin','emergency','sustainability','sentiment','ingestion','decision','about','privacy'],
  },
  {
    id: 'citizen',
    label: 'Citizen',
    icon: <Users size={13}/>,
    color: 'var(--sky)',
    desc: 'Local transit, waste & complaints',
    pages: ['overview','sentiment','emergency','about','privacy'],
  },
  {
    id: 'health',
    label: 'Healthcare / NGO',
    icon: <HeartPulse size={13}/>,
    color: 'var(--rose)',
    desc: 'Air quality, hospitals & outbreaks',
    pages: ['overview','sustainability','emergency','sentiment','decision','about','privacy'],
  },
  {
    id: 'education',
    label: 'Schools & Colleges',
    icon: <GraduationCap size={13}/>,
    color: '#a78bfa',
    desc: 'Safe transit, AQI & flood alerts',
    pages: ['overview','emergency','sentiment','about','privacy'],
  },
  {
    id: 'business',
    label: 'Local Businesses',
    icon: <Briefcase size={13}/>,
    color: 'var(--amber)',
    desc: 'Traffic, power & supply chain',
    pages: ['overview','twin','sustainability','ingestion','decision','about','privacy'],
  },
];
