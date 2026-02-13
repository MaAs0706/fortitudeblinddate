import { getSupabase } from "../lib/supabaseClient.js";
import logger from "../utils/logger.js";
import findMatches from "../services/matchmaking/mapper.js";
import { v4 as uuidv4 } from "uuid";

const supabase = getSupabase();

/* ===========================
   SAFE INTERESTS NORMALIZER
=========================== */
const normalizeInterests = (data) => {
  while (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      data = {};
      break;
    }
  }

  if (!data || typeof data !== "object") return [];

  return Object.keys(data)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => data[key]);
};

/* ===========================
   CLEAN USER PREPARATION
=========================== */
const prepareUser = (profile) => {
  return {
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    nickname: profile.nickname ?? null,

    age: profile.age ?? null,

    gender: profile.gender?.trim().toLowerCase() ?? null,
    gender_preference:
      profile.gender_preference?.trim().toLowerCase() ?? null,

    year: profile.year?.trim().toLowerCase() ?? null,
    year_preference: Array.isArray(profile.year_preference)
      ? profile.year_preference.map((y) => y.trim().toLowerCase())
      : [],

    age_preference:
      profile.age_preference?.trim().toLowerCase() ?? "any",
    opento: profile.opento?.trim().toLowerCase() ?? "open",

    approved: Boolean(profile.approved),
    ismatched: Boolean(profile.ismatched),

    interests: normalizeInterests(profile.interests),
  };
};

/* ===========================
   MATCH USERS CONTROLLER
=========================== */
export const matchUsers = async (req, res) => {
  try {
    logger.info("Matchmaking started");

    /* 1️⃣ Fetch profiles */
    const { data: profiles, error } = await supabase
      .from("test")
      .select("*");

    if (error) {
      logger.error("Failed to fetch profiles", { error: error.message });
      return res.status(500).json({ error: "Profiles fetch failed" });
    }

    /* 2️⃣ Normalize + Filter eligible users */
    const users = profiles
      .map(prepareUser)
      .filter(
        (u) =>
          u.approved &&
          !u.ismatched &&
          u.gender &&
          u.gender_preference &&
          u.age &&
          u.year &&
          u.interests.length > 0
      );
    // Just log a list of nicknames so you know who is in the pool
    logger.info(`Eligible users: ${users.map(u => { return u.nickname || u.firstName }).join(", ")}`);

    logger.info(`Prepared ${users.length} users for matching`);
    if (users.length < 2) {
      return res.json({ success: true, matchedPairs: 0 });
    }

    /* 3️⃣ Run Matching Algorithm */
    const result = findMatches(users);
    const matchedPairs = result.matchedPairs;

    logger.info("Matchmaking algorithm completed", {
      pairs: matchedPairs.length,
    });

    if (matchedPairs.length === 0) {
      return res.json({ success: true, matchedPairs: 0 });
    }

    /* 4️⃣ Create fast lookup map (NO extra DB calls) */
    const userMap = new Map(users.map((u) => [u.id, u]));



    /* 5️⃣ Batch Insert Sessions & Update Users */
    const sessionInserts = [];
    const matchedUserIds = [];

    for (const match of matchedPairs) {
      const user1 = userMap.get(match.user1_id);
      const user2 = userMap.get(match.user2_id);

      if (!user1 || !user2) continue;

      matchedUserIds.push(user1.id, user2.id);

      sessionInserts.push({
        id: uuidv4(),
        user_a: user1.id,
        user_b: user2.id,
        nickname_a: user1.nickname,
        nickname_b: user2.nickname,
        message_count: 0,
        status: "active",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Perform DB operations in parallel for speed
    await Promise.all([
      supabase.from("sessions_test").insert(sessionInserts),
      supabase
        .from("test") // Using "test" as per your controller's current code
        .update({ onboarding_step: "matched", ismatched: true })
        .in("id", matchedUserIds)
    ]);



    /* 5️⃣ Insert Sessions + Update Users */
    // for (const match of matchedPairs) {
    //   const user1 = userMap.get(match.user1_id);
    //   const user2 = userMap.get(match.user2_id);

    //   if (!user1 || !user2) {
    //     logger.warn("User missing in lookup map");
    //     continue;
    //   }

    //   await supabase.from("sessions").insert({
    //     id: uuidv4(),
    //     user_a: user1.id,
    //     user_b: user2.id,
    //     nickname_a: user1.nickname,
    //     nickname_b: user2.nickname,
    //     message_count: 0,
    //     status: "active",
    //     start_time: new Date().toISOString(),
    //     end_time: new Date(
    //       Date.now() + 5 * 60 * 60 * 1000
    //     ).toISOString(),
    //   });

    //   await supabase
    //     .from("users")
    //     .update({
    //       onboarding_step: "matched",
    //       ismatched: true,
    //     })
    //     .in("id", [user1.id, user2.id]);

    //   logger.info(
    //     `Session created for ${user1.nickname} & ${user2.nickname}`
    //   );
    // }

    /* 6️⃣ Final Response */
    logger.info("Matchmaking finished successfully");

    return res.json({
      success: true,
      matchedPairs: matchedPairs.length,
    });
  } catch (err) {
    logger.error("Matchmaking crashed", { error: err.message });
    return res.status(500).json({ error: "Internal server error" });
  }
};
