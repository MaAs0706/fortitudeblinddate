import { getSupabase } from "../lib/supabaseClient.js";

const supabase = getSupabase()
// Test: Force session to expire in 10 seconds
const triggerExpiryTest = async (sessionId) => {
  // Set end_time to 10 seconds from now
  const testEndTime = new Date(Date.now() + 20*1000).toISOString();

  const { data, error } = await supabase
    .from("sessions")
    .update({ end_time: testEndTime , start_time:new Date(Date.now()).toISOString(), reveal_a:null,reveal_b:null,phone_reveal_a:false,phone_reveal_b:false})
    .eq("id", sessionId);

  if (error) console.error("Test setup failed:", error);
  else console.log("Test started! Watch your Chat UI. Exiring in 10s...");
};

await triggerExpiryTest("b3e26f00-bcd1-41f9-a562-6edb4fc161ee")