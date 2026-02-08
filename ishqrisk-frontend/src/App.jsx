import { useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import BasicInfo from "./pages/BasicInfo";
import Preferences from "./pages/Preferences";
import Questionnaire from "./pages/Questionaire";

export default function App() {
  const { user, profile, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Landing />;

  // profile may not exist yet (first login)
  if (!profile || profile.onboarding_step === "basic") {
    return <BasicInfo />;
  }

  if (profile.onboarding_step === "preferences") {
    return <Preferences />;
  }

  if (profile.onboarding_step === "qna") {
    return <Questionnaire />
  }

  return <div>Done</div>;
}
