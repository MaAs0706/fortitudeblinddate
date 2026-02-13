// Question weights for scoring (total = 100)
const QUESTION_WEIGHTS = {
  0: 7, // Warning Label for personality
  1: 11, // You fall for someone
  2: 7, // Food slice...
  3: 13, // When you're emotionaly drained
  4: 8, // Your idea of flirting
  5: 12, // What scares you more....
  6: 8, // Life Philosophy..
  7: 12, // You feel closerst when...
  8: 15, // Your biggest red flag...
  9: 7 //Dating Experience...
};


const STRUCTURAL_RULES = {
  3: {
    complement: [
      ["A", "C"],
      ["D", "B"],
    ],
    friction: [
      ["A", "D"],
    ],
  },
  5: {
    friction: [
      ["B", "E"],
      ["D", "E"],
    ],
  },
  7: {
    complement: [
      ["A", "E"],
    ],
  },
  8: {
    friction: [
      ["B", "D"],
      ["E", "D"],
    ],
  },
};

const checkAgePreference = (pref, myAge, otherAge) => {
  if (!pref || pref === "any") return true;

  if (pref === "same or older") {
    return otherAge >= myAge;
  }

  if (pref === "same or younger") {
    return otherAge <= myAge;
  }

  if (pref === "older") {
    return otherAge > myAge;
  }

  if (pref === "younger") {
    return otherAge < myAge;
  }

  return true;
};

const checkIntentMatch = (user1, user2) => {
  // If either is "open", it's a match
  if (user1.opento === "open" || user2.opento === "open") return true;

  // Otherwise, they must want the same thing (e.g., both "dating")
  return user1.opento === user2.opento;
};

// Add this into your main checkPreferenceMatch function:


const yearMatch = (pref, year) => {
  if (!pref || pref.length === 0) return true;
  if (pref.includes("any year")) return true;
  return pref.includes(year);
};
// Check if two users match basic preferences
const checkPreferenceMatch = (user1, user2) => {
  console.log("---- Checking ----");
  console.log(user1.nickname, "vs", user2.nickname);

 const u1AcceptsU2 = 
    user1.gender_preference === "open to all" || 
    user1.gender_preference === user2.gender;

  const u2AcceptsU1 = 
    user2.gender_preference === "open to all" || 
    user2.gender_preference === user1.gender;

  if (!(u1AcceptsU2 && u2AcceptsU1)) {
    console.log("Gender preference mismatch");
    return false;
  }


  if (!user1.age || !user2.age) {
    console.log("Age missing");
    return false;
  }

  if (!checkAgePreference(user1.age_preference, user1.age, user2.age)) {
    console.log("User1 age pref failed");
    return false;
  }

  if (!checkAgePreference(user2.age_preference, user2.age, user1.age)) {
    console.log("User2 age pref failed");
    return false;
  }

  if (!yearMatch(user1.year_preference, user2.year)) {
    console.log("User1 year pref failed");
    return false;
  }

  if (!yearMatch(user2.year_preference, user1.year)) {
    console.log("User2 year pref failed");
    return false;
  }

  if (!checkIntentMatch(user1, user2)) {
    console.log("Intent mismatch (opento)");
    return false;
  }

  console.log("✅ Preference matched");
  return true;
};



const calculateQuestionScore = (index, a1, a2) => {
  if (!a1 || !a2) return 0;

  // Structural handling
  if (STRUCTURAL_RULES[index]) {
    const rules = STRUCTURAL_RULES[index];

    if (a1 === a2) return 1.0;

    if (rules.complement) {
      for (const [x, y] of rules.complement) {
        if ((a1 === x && a2 === y) || (a1 === y && a2 === x)) {
          return 0.85;
        }
      }
    }

    if (rules.friction) {
      for (const [x, y] of rules.friction) {
        if ((a1 === x && a2 === y) || (a1 === y && a2 === x)) {
          return 0.25;
        }
      }
    }

    return 0.6;
  }

  // Default logic
  return a1 === a2 ? 1.0 : 0.5;
};


// Calculate overall compatibility score between two users
const calculateCompatibilityScore = (user1, user2) => {
  let totalScore = 0;
  let totalWeight = 0;

  user1.interests.forEach((answer1, index) => {
    const answer2 = user2.interests[index];
    const weight = QUESTION_WEIGHTS[index];
    if (!weight) return;

    const score = calculateQuestionScore(index, answer1, answer2);

    totalScore += weight * score;
    totalWeight += weight;
  });

  return totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;

};

// Main matching function
const findMatches = (users) => {
  if (!Array.isArray(users)) {
    throw new TypeError(
      `findMatches expected an array of users, got ${typeof users}`
    );
  }

  const eligibleUsers = users.filter(
    (user) => user.approved && !user.ismatched
  );
  const userMap = new Map(eligibleUsers.map(u => [u.id, u]));

  const matchedUsers = new Set();
  const finalMatches = [];

  // Early return if no eligible users
  if (eligibleUsers.length === 0) {
    return { matchedPairs: [], userIds: matchedUsers };
  }

  const compatibilityMatrix = {};

  // Initialize matrix for each user
  eligibleUsers.forEach((user) => {
    compatibilityMatrix[user.id] = {};
  });

  // Calculate scores for all possible pairs
  for (let i = 0; i < eligibleUsers.length; i++) {
    for (let j = 0; j < eligibleUsers.length; j++) {
      if (i !== j) {
        const user1 = eligibleUsers[i];
        const user2 = eligibleUsers[j];

        if (checkPreferenceMatch(user1, user2)) {
          const score = calculateCompatibilityScore(user1, user2);
          compatibilityMatrix[user1.id][user2.id] = score;
        } else {
          compatibilityMatrix[user1.id][user2.id] = -1; // Invalid match
        }
      }
    }
  }

  // Function to find best match for a user among unmatched users
  const findBestMatch = (userId) => {
    const userScores = compatibilityMatrix[userId];
    let bestScore = -1;
    let bestMatchId = null;

    Object.entries(userScores).forEach(([potentialMatchId, score]) => {
      // Only consider valid matches (score > 0)
      if (!matchedUsers.has(potentialMatchId) && score > bestScore && score > 0) {
        bestScore = score;
        bestMatchId = potentialMatchId;
      }
    });

    return { bestMatchId, bestScore };
  };

  // Find mutual best matches
  while (matchedUsers.size < eligibleUsers.length) {
    let bestMutualMatch = null;
    let highestMutualScore = -1;

    // Check each unmatched user
    for (const user1 of eligibleUsers) {
      if (!matchedUsers.has(user1.id)) {
        // Find user1's best match
        const { bestMatchId: user2Id, bestScore: score1 } = findBestMatch(
          user1.id
        );

        if (user2Id) {
          // Check if user1 is also the best match for user2
          const { bestMatchId: mutualCheckId } = findBestMatch(user2Id);

          if (mutualCheckId === user1.id && score1 > highestMutualScore) {
            bestMutualMatch = {
              pair: [user1, userMap.get(user2Id)
              ],
              score: score1,
              details: {
                user1: `${user1.firstName} ${user1.lastName}`,
                user2: `${userMap.get(user2Id)
                  .firstName
                  } ${userMap.get(user2Id)
                    .lastName}`,
                score: score1.toFixed(2),
              },
            };
            highestMutualScore = score1;
          }
        }
      }
    }

    // If we found a mutual best match, add it to final matches
    if (bestMutualMatch) {
      finalMatches.push({
        user1_id: bestMutualMatch.pair[0].id,
        user2_id: bestMutualMatch.pair[1].id,
      });
      matchedUsers.add(bestMutualMatch.pair[0].id);
      matchedUsers.add(bestMutualMatch.pair[1].id);
    } else {
      // If no mutual best match found, break to avoid infinite loop
      // This could happen with last unpaired user
      break;
    }
  }

  // Second pass: Match remaining users based only on basic preferences
  const remainingUsers = eligibleUsers.filter(user => !matchedUsers.has(user.id));

  for (let i = 0; i < remainingUsers.length; i++) {
    const user1 = remainingUsers[i];
    if (matchedUsers.has(user1.id)) continue;

    for (let j = i + 1; j < remainingUsers.length; j++) {
      const user2 = remainingUsers[j];
      if (matchedUsers.has(user2.id)) continue;

      if (checkPreferenceMatch(user1, user2)) {
        finalMatches.push({
          user1_id: user1.id,
          user2_id: user2.id,
        });
        matchedUsers.add(user1.id);
        matchedUsers.add(user2.id);
        break;
      }
    }
  }

  return { matchedPairs: finalMatches, userIds: matchedUsers };
};

export default findMatches;
