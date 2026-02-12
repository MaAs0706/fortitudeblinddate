import { supabase } from "./supabase";


const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/basic`
      }
    });
  };


  export default signIn