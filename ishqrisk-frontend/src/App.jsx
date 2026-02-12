import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";

import Landing from "./pages/Landing";
import BasicInfo from "./pages/BasicInfo";
import Preferences from "./pages/Preferences";
import Questionnaire from "./pages/Questionaire";
import Waiting from "./pages/Waiting";
import Chat from "./pages/Chat";
/* ... other imports ... */
import Match from "./pages/Match";

const ProtectedStep = ({ step, profile, children }) => {
  // ⭐ Allow new users to access basic onboarding
  if (!profile && step === "basic") {
    return children;
  }

  const correctRoute = getOnboardingRoute(profile);

  if (profile?.onboarding_step !== step) {
    return <Navigate to={correctRoute} replace />;
  }

  return children;
};


/* ⭐ Pure path resolver */
const getOnboardingRoute = (profile) => {
  if (!profile) return "/basic";

  switch (profile.onboarding_step) {
    case "basic": return "/basic";
    case "preferences": return "/preferences";
    case "qna": return "/qna";
    case "waiting": return "/waiting";
    case "matched": return "/match"; // Changed from /chat to /match
    default: return "/basic";
  }
};

export default function App() {
  const { user, profile, authLoading, profileLoading } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  /* 🔁 Redirect logic */
  useEffect(() => {
    if (!user) return;

    const route = getOnboardingRoute(profile);

    if (location.pathname !== route) {
      navigate(route, { replace: true });
    }
  }, [user, profile?.onboarding_step]);

  /* 🌌 ONLY block while hydrating */
  if (authLoading || profileLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0c111f] text-[#ed9e6f]">
        ✦ Restoring connection...
      </div>
    );
  }

  /* 🚪 Not logged in */
  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Chat />} />
      </Routes>
    );
  }

  /* 🚀 Logged-in routes */
  return (
    <Routes>
      <Route path="/" element={<Navigate to={getOnboardingRoute(profile)} replace />} />

      <Route
        path="/basic"
        element={
          <ProtectedStep step="basic" profile={profile}>
            <BasicInfo />
          </ProtectedStep>
        }
      />

      <Route
        path="/preferences"
        element={
          <ProtectedStep step="preferences" profile={profile}>
            <Preferences />
          </ProtectedStep>
        }
      />

      <Route
        path="/qna"
        element={
          <ProtectedStep step="qna" profile={profile}>
            <Questionnaire />
          </ProtectedStep>
        }
      />

      <Route
        path="/waiting"
        element={
          <ProtectedStep step="waiting" profile={profile}>
            <Waiting />
          </ProtectedStep>
        }
      />

     

      {/* ... other routes ... */}
      
      <Route
        path="/match"
        element={
          <ProtectedStep step="matched" profile={profile}>
            <Match />
          </ProtectedStep>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedStep step="matched" profile={profile}>
            <Chat />
          </ProtectedStep>
        }
      />

      <Route path="*" element={<Navigate to={getOnboardingRoute(profile)} replace />} />
    </Routes>

  );
}
