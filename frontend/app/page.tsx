'use client';

import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { LandingHero } from '../components/landing/LandingHero';
import { LandingSeeSection } from '../components/landing/LandingSeeSection';
import { LandingDetectSection } from '../components/landing/LandingDetectSection';
import { LandingRiskSection } from '../components/landing/LandingRiskSection';
import { LandingAlertSection } from '../components/landing/LandingAlertSection';
import { LandingHumanReviewSection } from '../components/landing/LandingHumanReviewSection';
import { LandingSystemSection } from '../components/landing/LandingSystemSection';
import { LandingDashboardShowcase } from '../components/landing/LandingDashboardShowcase';
import { LandingVisitorSection } from '../components/landing/LandingVisitorSection';
import { LandingAnalyticsSection } from '../components/landing/LandingAnalyticsSection';
import { LandingTechSection } from '../components/landing/LandingTechSection';
import { LandingCTASection } from '../components/landing/LandingCTASection';
import { LandingFooter } from '../components/landing/LandingFooter';

export default function SentinelLandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* 1. Minimal Premium Navbar */}
      <LandingNavbar />

      {/* 2. Cinematic Hero Section with Product Visualizer */}
      <LandingHero />

      {/* 3. Section 1: SEE - CCTV Multi-Stream Vision */}
      <LandingSeeSection />

      {/* 4. Section 2: DETECT - Contextual Security vs Raw Motion */}
      <LandingDetectSection />

      {/* 5. Section 3: RISK ANALYSIS - 0-100 Contextual Risk Engine */}
      <LandingRiskSection />

      {/* 6. Section 4: REAL-TIME ALERTS - 5-Second UX Protocol */}
      <LandingAlertSection />

      {/* 7. Section 5: HUMAN IN THE LOOP - AI Detects. Humans Decide. */}
      <LandingHumanReviewSection />

      {/* 8. Section 6: DASHBOARD SHOWCASE - Interactive SOC Workspace */}
      <LandingDashboardShowcase />

      {/* 9. Section 7: VISITOR INTELLIGENCE - Pass System */}
      <LandingVisitorSection />

      {/* 10. Section 8: ANALYTICS - Metrics & Timings */}
      <LandingAnalyticsSection />

      {/* 11. Section 9: SYSTEM & ARCHITECTURE - Windows Native Engine */}
      <LandingSystemSection />

      {/* 12. Section 10: TECH STACK - Verified Technologies */}
      <LandingTechSection />

      {/* 13. Final Call to Action */}
      <LandingCTASection />

      {/* 14. Professional Footer */}
      <LandingFooter />
    </div>
  );
}
