import { Routes, Route, Navigate} from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Landing from "./pages/Landing";
import BasicInfo from "./pages/BasicInfo";
import Preferences from "./pages/Preferences";
import Questionnaire from "./pages/Questionaire";
import Waiting from "./pages/Waiting";
import Chat from "./pages/Chat";

export default function App() {
  const { user, profile, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // ⭐ Not logged in
  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Landing />} />
      </Routes>
    );
  }

  // ⭐ Decide onboarding redirect
  const getOnboardingRoute = () => {
    if (!profile || profile.onboarding_step === "basic") return "/basic";
    if (profile.onboarding_step === "preferences") return "/preferences";
    if (profile.onboarding_step === "qna") return "/qna";
    return "/done";
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to={getOnboardingRoute()} />} />

      <Route path="/basic" element={<BasicInfo />} />
      <Route path="/preferences" element={<Preferences />} />
      <Route path="/qna" element={<Questionnaire />} />

      <Route path="/waiting" element={<Waiting/>} />
      <Route path="/test-chat" element={<Chat/>} />

      {/* fallback */}
      <Route path="*" element={<Navigate to={getOnboardingRoute()} />} />
    </Routes>
  );
}
