import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);


  /* ===== AUTH SESSION ===== */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthLoading(false); // ⭐ IMPORTANT
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setAuthLoading(false); // ⭐ IMPORTANT
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);


  /* ===== FETCH PROFILE + REALTIME ===== */
  /* ===== FETCH PROFILE + REALTIME ===== */
  useEffect(() => {
    let mounted = true;
    let channel;

    // 🚫 No user → no profile
    if (!user?.id) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    // ⭐ VERY IMPORTANT: start loading when user changes
    setProfileLoading(true);

    const REGISTRATION_OPEN = false; // 🔒 toggle here

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      // 🚫 No profile found
      if (!data) {
        if (!REGISTRATION_OPEN) {
          console.log("Registration closed. Signing out.");
          await supabase.auth.signOut();
          setProfile(null);
          setProfileLoading(false);
          return;
        }

        // If registration open, you could auto-create here
      }

      setProfile(data ?? null);
      setProfileLoading(false);

      if (error) {
        console.error("Profile fetch error:", error);
      }
    };


    fetchProfile();

    // ⭐ realtime subscription
    channel = supabase
      .channel(`users-change-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log("PROFILE UPDATE 🔄", payload.new);
          setProfile(payload.new);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Realtime ready 🔥");
        }
      });

    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [user?.id]);


  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        authLoading,
        profileLoading,
      }}
    >

      {children}
    </AuthContext.Provider>
  );
}
