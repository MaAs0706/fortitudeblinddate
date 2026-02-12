import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const SessionContext = createContext();

export const useSession = () => useContext(SessionContext);

export default function SessionProvider({ children }) {
  const { user, profile } = useAuth();
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(false);

  useEffect(() => {
    // If no user or not at the matched step, reset and exit
    if (!user?.id || profile?.onboarding_step !== "matched") {
      setSession(null);
      setLoadingSession(false);
      return;
    }

    let mounted = true;

    // 1. Function to fetch the existing session
    const fetchSession = async () => {
      setLoadingSession(true);
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .filter('status', 'eq', 'active') // Optional: only get active matches
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error("Session fetch error:", error);
      } else {
        setSession(data);
      }
      setLoadingSession(false);
    };

    fetchSession();

    // 2. Realtime Subscription: Listen for a new session record
    // This triggers the "Match" UI as soon as the database is updated
    const sessionChannel = supabase
      .channel("realtime-sessions")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sessions",
        },
        (payload) => {
          // Check if the newly created session belongs to the current user
          if (payload.new.user_a === user.id || payload.new.user_b === user.id) {
            setSession(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(sessionChannel);
    };
  }, [user?.id, profile?.onboarding_step]);

  return (
    <SessionContext.Provider value={{ session, loadingSession, setSession }}>
      {children}
    </SessionContext.Provider>
  );
}