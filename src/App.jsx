import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { UserProvider } from '@/lib/userContext';
import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import CurriculumPlanner from '@/pages/CurriculumPlanner';
import Planner from '@/pages/Planner';
import Books from '@/pages/Books';
import Portfolio from '@/pages/Portfolio';
import Calendar from '@/pages/Calendar';
import LessonPreview from '@/pages/LessonPreview';
import Subjects from '@/pages/Subjects';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <UserProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/curriculum" element={<CurriculumPlanner />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/books" element={<Books />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/lesson-preview" element={<LessonPreview />} />
          <Route path="/subjects" element={<Subjects />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </UserProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App