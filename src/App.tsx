import React, { useState } from 'react';
import { useOrchestrator } from './hooks/useOrchestrator.js';
import { Navbar } from './components/Navbar.js';
import { OverviewPage } from './components/OverviewPage.js';
import { ControlCenterPage } from './components/ControlCenterPage.js';
import { ResourceContentionArena } from './components/ResourceContentionArena.js';
import { ServiceGraphView } from './components/ServiceGraphView.js';
import { AgentDashboard } from './components/AgentDashboard.js';
import { ProfilePage } from './components/citizen/ProfilePage.js';
import { SchemeSearchPage } from './components/citizen/SchemeSearchPage.js';
import { EligibilityPage } from './components/citizen/EligibilityPage.js';
import { DocumentsPage } from './components/citizen/DocumentsPage.js';
import { ApplicationDraftPage } from './components/citizen/ApplicationDraftPage.js';
import { LanguageExplanationPage } from './components/citizen/LanguageExplanationPage.js';
import { AnalyticsPage } from './components/AnalyticsPage.js';
import { AutomatedTestsModal } from './components/AutomatedTestsModal.js';
import { JudgeShowcaseModal } from './components/JudgeShowcaseModal.js';
import { AuditConsole } from './components/AuditConsole.js';
import { Scheme, UserProfile } from './types/orchestrator.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isJudgeModalOpen, setIsJudgeModalOpen] = useState(false);

  // User-friendly accessibility modes requested by user:
  // 1. Light Mode (high contrast, warm, friendly for elderly & rural users)
  // 2. Elderly Large Text option
  const [isLightMode, setIsLightMode] = useState<boolean>(true);
  const [isElderlyFont, setIsElderlyFont] = useState<boolean>(false);

  // Default active citizen profile
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Rajesh Kumar',
    age: 38,
    gender: 'Male',
    state: 'Karnataka',
    district: 'Mandya',
    occupation: 'Farmer',
    annual_income: 180000,
    category: 'OBC',
    user_type: 'Farmer',
    preferred_language: 'Kannada',
    user_query: 'Looking for agricultural crop loan, irrigation subsidy and PM-KISAN'
  });

  const { status, isConnected } = useOrchestrator();

  const handleSelectScheme = (scheme: Scheme) => {
    setSelectedScheme(scheme);
    setActiveTab('eligibility');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isLightMode ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    } ${isElderlyFont ? 'text-[17px]' : 'text-sm'}`}>
      {/* Top Header & Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isConnected={isConnected}
        onOpenTests={() => setIsTestModalOpen(true)}
        onOpenJudgeDeck={() => setIsJudgeModalOpen(true)}
        activeWorkflowsCount={status?.active_workflows?.length || 0}
        isLightMode={isLightMode}
        setIsLightMode={setIsLightMode}
        isElderlyFont={isElderlyFont}
        setIsElderlyFont={setIsElderlyFont}
        currentCitizenName={userProfile.name}
        currentAgentName={userProfile.assigned_agent}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28">
        {activeTab === 'overview' && (
          <OverviewPage
            setActiveTab={setActiveTab}
            onOpenTests={() => setIsTestModalOpen(true)}
            onOpenJudgeDeck={() => setIsJudgeModalOpen(true)}
            isLightMode={isLightMode}
          />
        )}

        {activeTab === 'control-center' && (
          <ControlCenterPage status={status} isLightMode={isLightMode} />
        )}

        {activeTab === 'resource-contention' && (
          <ResourceContentionArena status={status} isLightMode={isLightMode} />
        )}

        {activeTab === 'service-graph' && (
          <ServiceGraphView status={status} />
        )}

        {activeTab === 'agents' && (
          <AgentDashboard status={status} />
        )}

        {activeTab === 'schemes' && (
          <SchemeSearchPage
            status={status}
            onSelectScheme={handleSelectScheme}
            userProfile={userProfile}
            isLightMode={isLightMode}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage
            status={status}
            onProfileSubmitted={(p) => setUserProfile(p)}
            onNavigateToSchemes={() => setActiveTab('schemes')}
            isLightMode={isLightMode}
          />
        )}

        {activeTab === 'eligibility' && (
          <EligibilityPage
            scheme={selectedScheme}
            profile={userProfile}
            status={status}
            onProceedToDocuments={() => setActiveTab('documents')}
            isLightMode={isLightMode}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentsPage
            scheme={selectedScheme}
            status={status}
            onProceedToApplication={() => setActiveTab('application')}
            isLightMode={isLightMode}
          />
        )}

        {activeTab === 'application' && (
          <ApplicationDraftPage
            scheme={selectedScheme}
            profile={userProfile}
            status={status}
            onProceedToVernacular={() => setActiveTab('vernacular')}
            isLightMode={isLightMode}
          />
        )}

        {activeTab === 'vernacular' && (
          <LanguageExplanationPage
            scheme={selectedScheme}
            status={status}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsPage status={status} />
        )}
      </main>

      {/* Persistent Visual Audit Console for Hackathon Demonstrations */}
      <AuditConsole isLightMode={isLightMode} />

      {/* 12 Invariant Automated Tests Modal */}
      <AutomatedTestsModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />

      {/* Hackathon Judge Pitch & Benchmark Deck Modal */}
      <JudgeShowcaseModal
        isOpen={isJudgeModalOpen}
        onClose={() => setIsJudgeModalOpen(false)}
        onNavigateToControlCenter={() => setActiveTab('control-center')}
      />
    </div>
  );
}
