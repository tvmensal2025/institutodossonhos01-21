import React, { useState } from 'react';
import DrVitalSessionEnd from './DrVitalSessionEnd';
import SessionResultsPage from './SessionResultsPage';
import SessionResultsChart from '../wheel/SessionResultsChart';

interface SessionData {
  responses: Record<string, any>;
  score: number;
  insights: string[];
}

interface ResultsData {
  score: number;
  systems: Array<{
    name: string;
    score: number;
    color: string;
    icon: string;
    insights: string[];
  }>;
  timeline: Array<{
    date: string;
    score: number;
  }>;
  userProfile?: {
    full_name?: string;
    email?: string;
    phone?: string;
  };
}

interface SessionManagerProps {
  sessionData: SessionData;
  userProfile?: any;
  onClose?: () => void;
}

const SessionManager: React.FC<SessionManagerProps> = ({
  sessionData,
  userProfile,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState<'summary' | 'results' | 'chart'>('summary');

  // Converter dados da sessão para formato de resultados
  const convertToResultsData = (): ResultsData => {
    return {
      score: sessionData.score,
      systems: [
        {
          name: "Sistema Cardiovascular",
          score: Math.max(6, sessionData.score + (Math.random() - 0.5) * 2),
          color: "#ef4444",
          icon: "❤️",
          insights: ["Pressão arterial estável", "Frequência cardíaca normal"]
        },
        {
          name: "Sistema Respiratório", 
          score: Math.max(5, sessionData.score + (Math.random() - 0.5) * 2),
          color: "#3b82f6",
          icon: "🫁",
          insights: ["Capacidade pulmonar adequada", "Oxigenação eficiente"]
        },
        {
          name: "Sistema Nervoso",
          score: Math.max(5, sessionData.score + (Math.random() - 0.5) * 2),
          color: "#8b5cf6",
          icon: "🧠",
          insights: ["Função cognitiva preservada", "Reflexos adequados"]
        },
        {
          name: "Sistema Digestivo",
          score: Math.max(6, sessionData.score + (Math.random() - 0.5) * 2),
          color: "#f59e0b",
          icon: "🫂",
          insights: ["Digestão funcionando bem", "Absorção de nutrientes eficaz"]
        },
        {
          name: "Sistema Imunológico",
          score: Math.max(7, sessionData.score + (Math.random() - 0.5) * 1.5),
          color: "#10b981",
          icon: "🛡️",
          insights: ["Resistência a infecções boa", "Resposta imune adequada"]
        }
      ],
      timeline: [
        { date: "Sessão Anterior", score: Math.max(4, sessionData.score - 1) },
        { date: "Sessão Atual", score: sessionData.score }
      ],
      userProfile: userProfile
    };
  };

  const handleContinueToResults = () => {
    setCurrentStep('chart');
  };

  const handleShowOldResults = () => {
    setCurrentStep('results');
  };

  const resultsData = convertToResultsData();

  if (currentStep === 'summary') {
    return (
      <DrVitalSessionEnd
        sessionData={sessionData}
        onContinue={handleContinueToResults}
      />
    );
  }

  if (currentStep === 'chart') {
    return (
      <SessionResultsChart
        userProfile={userProfile}
        sessionData={{
          score: sessionData.score,
          systems: resultsData.systems
        }}
        onBack={() => setCurrentStep('summary')}
      />
    );
  }

  return (
    <SessionResultsPage
      resultsData={resultsData}
      onBack={() => setCurrentStep('summary')}
    />
  );
};

export default SessionManager;