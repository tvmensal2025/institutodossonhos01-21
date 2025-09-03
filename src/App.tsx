import { useState, useEffect, lazy, Suspense } from "react";
import './App.css';
import './styles/interactive-tutorial.css';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { InteractiveTutorial } from './components/onboarding';
import { useFirstAccessTutorial } from './hooks/useFirstAccessTutorial';
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { InstallPrompt } from "./components/InstallPrompt";
import SofiaFloatingButton from "./components/SofiaFloatingButton";
import { PerformanceProvider } from "./components/PerformanceProvider";
import RouterPerformanceProvider from "./components/RouterPerformanceProvider";

// Core pages - loaded immediately
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import TermsPage from "./pages/TermsPage";

// Lazy-loaded components for better performance
const Index = lazy(() => import("./pages/Index"));
const AutoLoginPage = lazy(() => import("./pages/AutoLoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const CompleteDashboardPage = lazy(() => import("./pages/CompleteDashboardPage"));
const EnhancedDashboardPage = lazy(() => import("./pages/EnhancedDashboardPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const CoursePlatform = lazy(() => import("./components/CoursePlatform"));
const MissionSystem = lazy(() => import("./components/MissionSystem"));
const ProgressPage = lazy(() => import("./pages/ProgressPage"));
const MyProgress = lazy(() => import("./components/MyProgress"));
const ColorTest = lazy(() => import("./components/ColorTest"));
const CSSDebug = lazy(() => import("./components/CSSDebug"));
const BodyChartsPage = lazy(() => import("./pages/BodyChartsPage"));
const ReportViewer = lazy(() => import("./pages/ReportViewer"));
const UserSessions = lazy(() => import("./components/UserSessions"));
const SaboteurTest = lazy(() => import("./components/SaboteurTest"));
const ScaleTestPage = lazy(() => import("./pages/ScaleTestPage"));
const GoogleFitOAuthPage = lazy(() => import("./pages/GoogleFitOAuthPage"));
const GoogleFitCallback = lazy(() => import("./pages/GoogleFitCallback").then(module => ({ default: module.GoogleFitCallback })));
const GoogleFitTestPage = lazy(() => import("./pages/GoogleFitTestPage"));
const GoalsPage = lazy(() => import("./pages/GoalsPage"));
const EvolutionPage = lazy(() => import("./pages/EvolutionPage"));
const HealthFeedPage = lazy(() => import("./pages/HealthFeedPage"));
const SessionDashboardPage = lazy(() => import("./pages/SessionDashboardPage"));
const GalileuReportPage = lazy(() => import("./pages/GalileuReportPage"));
const GalileuPrecisionPage = lazy(() => import("./pages/GalileuPrecisionPage"));
const GalileuRGraphPage = lazy(() => import("./pages/GalileuRGraphPage"));
const ProfessionalReportPage = lazy(() => import("./pages/ProfessionalReportPage"));
const AdvancedHealthDashboard = lazy(() => import("./pages/AdvancedHealthDashboard"));
const WeeklyAssessmentDashboard = lazy(() => import("./pages/WeeklyAssessmentDashboard"));
const ProfessionalEvaluationPage = lazy(() => import("./pages/ProfessionalEvaluationPageClean"));
const TestDesafioModal = lazy(() => import("./components/TestDesafioModal").then(module => ({ default: module.TestDesafioModal })));
const SofiaPage = lazy(() => import("./pages/SofiaPage"));
const SofiaVoicePage = lazy(() => import("./pages/SofiaVoicePage"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage"));
const PaymentManagementPage = lazy(() => import("./pages/PaymentManagementPage"));
const SofiaNutritionalPage = lazy(() => import("./pages/SofiaNutritionalPage").then(module => ({ default: module.SofiaNutritionalPage })));
const AIControlPage = lazy(() => import("./pages/AIControlPage"));
const RankingPage = lazy(() => import("./components/RankingPage"));
const DashboardWithDraggableWidgets = lazy(() => import("./components/DashboardWithDraggableWidgets"));
const LimitingBeliefsWheel = lazy(() => import("./components/LimitingBeliefsWheel"));
const HealthPyramidMapping = lazy(() => import("./components/HealthPyramidMapping"));
const EmotionalTraumaMapping = lazy(() => import("./components/EmotionalTraumaMapping"));
const AbundanceWheelPage = lazy(() => import("./pages/AbundanceWheelPage").then(module => ({ default: module.AbundanceWheelPage })));
const CompetencyWheelPage = lazy(() => import("./pages/CompetencyWheelPage").then(module => ({ default: module.CompetencyWheelPage })));
const GalileuChartsPage = lazy(() => import("./pages/GalileuChartsPage").then(module => ({ default: module.GalileuChartsPage })));
const ChallengeDetailPage = lazy(() => import("./pages/ChallengeDetailPage"));
const DrVitalPage = lazy(() => import("./pages/DrVitalPage"));
const UserDrVitalPage = lazy(() => import("./pages/UserDrVitalPage"));
const DrVitalEnhancedPage = lazy(() => import("./pages/DrVitalEnhancedPage"));
const UpdateChallengeProgressPage = lazy(() => import("./pages/UpdateChallengeProgressPage"));
const SofiaFlowDemo = lazy(() => import("./pages/SofiaFlowDemo"));
const VisionDemo = lazy(() => import("./pages/VisionDemo"));
const ApiTest = lazy(() => import("./pages/ApiTest"));
const AnamnesisPage = lazy(() => import("./pages/AnamnesisPage"));
const ApiKeyTestPage = lazy(() => import("./pages/ApiKeyTestPage"));
const GoogleFitPage = lazy(() => import("./pages/GoogleFitPage").then(module => ({ default: module.GoogleFitPage })));
const SofiaTest = lazy(() => import("./components/SofiaTest"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      <p className="text-muted-foreground text-sm">Carregando...</p>
    </div>
  </div>
);


// Optimized SessionRoute with lazy loading and memoization
const SessionRoute = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
          if (!session) navigate("/auth");
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
          navigate("/auth");
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
          if (!session) navigate("/auth");
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) return <PageLoader />;
  if (!user) return null;

  return (
    <Suspense fallback={<PageLoader />}>
      <UserSessions user={user} />
    </Suspense>
  );
};

// Optimized QueryClient with better caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (updated from cacheTime)
      refetchOnMount: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  const {
    showTutorial,
    openTutorial,
    closeTutorial,
    completeTutorial,
    resetTutorial,
    getTutorialStatus,
    hasCompletedTutorial,
    hasSeenTutorial
  } = useFirstAccessTutorial();

  const userData = {
    name: 'Querido Sonhador',
    experience: 'beginner' as const,
    goals: ['transformar minha vida', 'manifestar abundância', 'conectar com meu propósito']
  };

  return (
    <QueryClientProvider client={queryClient}>
      <PerformanceProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RouterPerformanceProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Redirect to auth page by default */}
              <Route path="/" element={<AuthPage />} />
              
              {/* Auth page - standalone without layout */}
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/termos" element={<TermsPage />} />
              <Route path="/privacidade" element={<TermsPage />} />
              <Route path="/auto-login" element={<Suspense fallback={<PageLoader />}><AutoLoginPage /></Suspense>} />
              
              {/* Dashboard - standalone without layout */}
              <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><CompleteDashboardPage /></Suspense>} />
              <Route path="/enhanced-dashboard" element={<Suspense fallback={<PageLoader />}><EnhancedDashboardPage /></Suspense>} />
              <Route path="/dashboard/progress" element={<Suspense fallback={<PageLoader />}><MyProgress /></Suspense>} />
              
              {/* Admin - standalone without layout */}
              <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminPage /></Suspense>} />
              <Route path="/health-feed" element={<Suspense fallback={<PageLoader />}><HealthFeedPage /></Suspense>} />
              <Route path="/ranking" element={<Suspense fallback={<PageLoader />}><RankingPage user={null} /></Suspense>} />
              
              {/* Challenge functionality moved to dashboard */}
              <Route path="/app/missions" element={<Suspense fallback={<PageLoader />}><MissionSystem /></Suspense>} />
              <Route path="/app/goals" element={<Suspense fallback={<PageLoader />}><GoalsPage /></Suspense>} />
              <Route path="/app/courses" element={<Suspense fallback={<PageLoader />}><CoursePlatform /></Suspense>} />
              <Route path="/app/sessions" element={<SessionRoute />} />
              <Route path="/app/saboteur-test" element={<Suspense fallback={<PageLoader />}><SaboteurTest /></Suspense>} />
              <Route path="/app/progress" element={<Suspense fallback={<PageLoader />}><ProgressPage /></Suspense>} />
              <Route path="/app/scale-test" element={<Suspense fallback={<PageLoader />}><ScaleTestPage /></Suspense>} />
              <Route path="/google-fit-oauth" element={<Suspense fallback={<PageLoader />}><GoogleFitOAuthPage /></Suspense>} />
              <Route path="/google-fit-callback" element={<Suspense fallback={<PageLoader />}><GoogleFitCallback /></Suspense>} />
              <Route path="/google-fit-test" element={<Suspense fallback={<PageLoader />}><GoogleFitTestPage /></Suspense>} />
              <Route path="/google-fit" element={<Suspense fallback={<PageLoader />}><GoogleFitPage /></Suspense>} />
              <Route path="/app/abundance-wheel" element={<Suspense fallback={<PageLoader />}><AbundanceWheelPage /></Suspense>} />
              <Route path="/app/competency-wheel" element={<Suspense fallback={<PageLoader />}><CompetencyWheelPage /></Suspense>} />
              <Route path="/challenge/:challengeId" element={<Suspense fallback={<PageLoader />}><ChallengeDetailPage /></Suspense>} />
              <Route path="/update-challenge/:challengeId" element={<Suspense fallback={<PageLoader />}><UpdateChallengeProgressPage user={null} /></Suspense>} />
              <Route path="/dr-vital" element={<Suspense fallback={<PageLoader />}><DrVitalPage /></Suspense>} />
              <Route path="/user-dr-vital" element={<Suspense fallback={<PageLoader />}><UserDrVitalPage /></Suspense>} />
              <Route path="/dr-vital-enhanced" element={<Suspense fallback={<PageLoader />}><DrVitalEnhancedPage /></Suspense>} />
              <Route path="/app/evolution" element={<Suspense fallback={<PageLoader />}><EvolutionPage /></Suspense>} />
              
              {/* Sofia - Dedicated nutrition AI page */}
              <Route path="/sofia" element={<Suspense fallback={<PageLoader />}><SofiaPage /></Suspense>} />
              <Route path="/sofia-voice" element={<Suspense fallback={<PageLoader />}><SofiaVoicePage /></Suspense>} />
              <Route path="/sofia-nutricional" element={<Suspense fallback={<PageLoader />}><SofiaNutritionalPage /></Suspense>} />
              <Route path="/ai-control" element={<Suspense fallback={<PageLoader />}><AIControlPage /></Suspense>} />
              <Route path="/sofia-test" element={<Suspense fallback={<PageLoader />}><SofiaTest /></Suspense>} />
              
              {/* Anamnesis - Sistema de Anamnese */}
              <Route path="/anamnesis" element={<Suspense fallback={<PageLoader />}><AnamnesisPage /></Suspense>} />
              
              {/* API Test - Componente para testar APIs */}
              <Route path="/api-test" element={<Suspense fallback={<PageLoader />}><ApiTest /></Suspense>} />
              <Route path="/api-key-test" element={<Suspense fallback={<PageLoader />}><ApiKeyTestPage /></Suspense>} />
              <Route path="/sofia-flow-demo" element={<Suspense fallback={<PageLoader />}><SofiaFlowDemo /></Suspense>} />
              <Route path="/vision-demo" element={<Suspense fallback={<PageLoader />}><VisionDemo /></Suspense>} />
              
              {/* Subscription page */}
              <Route path="/assinatura" element={<Suspense fallback={<PageLoader />}><SubscriptionPage /></Suspense>} />
              
              {/* Payment Management page */}
              <Route path="/pagamentos" element={<Suspense fallback={<PageLoader />}><PaymentManagementPage /></Suspense>} />
              
              {/* Reports Viewer */}
              <Route path="/reports/:reportId" element={<Suspense fallback={<PageLoader />}><ReportViewer /></Suspense>} />
              <Route path="/report/:reportId" element={<Suspense fallback={<PageLoader />}><ReportViewer /></Suspense>} />
              
              {/* Standalone pages */}
              <Route path="/index" element={<Suspense fallback={<PageLoader />}><Index /></Suspense>} />
              <Route path="/dashboard-page" element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
              <Route path="/progress-page" element={<Suspense fallback={<PageLoader />}><ProgressPage /></Suspense>} />
              <Route path="/color-test" element={<Suspense fallback={<PageLoader />}><ColorTest /></Suspense>} />
              <Route path="/css-debug" element={<Suspense fallback={<PageLoader />}><CSSDebug /></Suspense>} />
              <Route path="/test-desafio-modal" element={<Suspense fallback={<PageLoader />}><TestDesafioModal /></Suspense>} />

              <Route path="/body-charts" element={<Suspense fallback={<PageLoader />}><BodyChartsPage /></Suspense>} />
              <Route path="/galileu-charts" element={<Suspense fallback={<PageLoader />}><GalileuChartsPage /></Suspense>} />
              <Route path="/session-dashboard" element={<Suspense fallback={<PageLoader />}><SessionDashboardPage /></Suspense>} />
              <Route path="/galileu-report" element={<Suspense fallback={<PageLoader />}><GalileuReportPage /></Suspense>} />
              <Route path="/galileu-precision" element={<Suspense fallback={<PageLoader />}><GalileuPrecisionPage /></Suspense>} />
              <Route path="/galileu-rgraph" element={<Suspense fallback={<PageLoader />}><GalileuRGraphPage /></Suspense>} />
              <Route path="/professional-report" element={<Suspense fallback={<PageLoader />}><ProfessionalReportPage /></Suspense>} />
              <Route path="/advanced-health-dashboard" element={<Suspense fallback={<PageLoader />}><AdvancedHealthDashboard /></Suspense>} />
              <Route path="/weekly-assessment" element={<Suspense fallback={<PageLoader />}><WeeklyAssessmentDashboard /></Suspense>} />
              <Route path="/professional-evaluation" element={<Suspense fallback={<PageLoader />}><ProfessionalEvaluationPage /></Suspense>} />
              <Route path="/limiting-beliefs" element={<Suspense fallback={<PageLoader />}><LimitingBeliefsWheel /></Suspense>} />
              <Route path="/health-pyramid" element={<Suspense fallback={<PageLoader />}><HealthPyramidMapping /></Suspense>} />
              <Route path="/trauma-mapping" element={<Suspense fallback={<PageLoader />}><EmotionalTraumaMapping /></Suspense>} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          
          <PWAInstallPrompt />
          {/* Add to Home Screen helper for iOS and Android */}
          <InstallPrompt />
          
          {/* Sofia Floating Button - disponível em todas as páginas */}
          <SofiaFloatingButton />

            {/* Tutorial da Sofia - Modal Global */}
            <InteractiveTutorial />
            </RouterPerformanceProvider>
          </BrowserRouter>
        </TooltipProvider>
      </PerformanceProvider>
    </QueryClientProvider>
  );
};

export default App;
