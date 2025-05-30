export const sampleData = {
  child: {
    name: "Emma",
    totalPoints: 285,
    currentStreak: 4,
    totalPunches: 1250,
    totalKicks: 980,
    totalSessions: 23,
    favoriteKata: "Heian Shodan",
    avatar: "ninja-girl"
  },
  rewards: [
    { id: 1, name: "Ice Cream", points: 50, earned: true, approved: false, icon: "ice-cream" },
    { id: 2, name: "Pizza Night", points: 150, earned: true, approved: true, icon: "pizza" },
    { id: 3, name: "Movie Night", points: 200, earned: false, progress: 0.85, icon: "film" },
    { id: 4, name: "New Toy", points: 100, earned: false, progress: 0.60, icon: "toy" },
    { id: 5, name: "Special Activity", points: 120, earned: false, progress: 0.25, icon: "activity" }
  ],
  recentSessions: [
    { id: 1, date: "2025-05-29", punches: 45, kicks: 32, duration: 25, katas: ["Heian Shodan x3", "Kata 1 x2"], pointsEarned: 30 },
    { id: 2, date: "2025-05-28", punches: 60, kicks: 45, duration: 30, katas: ["Heian Nidan x4"], pointsEarned: 35 },
    { id: 3, date: "2025-05-26", punches: 50, kicks: 38, duration: 20, katas: ["Heian Shodan x2", "Heian Nidan x1"], pointsEarned: 25 },
    { id: 4, date: "2025-05-25", punches: 40, kicks: 30, duration: 15, katas: ["Kata 1 x3"], pointsEarned: 20 }
  ],
  kataList: [
    "Heian Shodan",
    "Heian Nidan",
    "Kata 1",
    "Kata 2",
    "Kata 3"
  ],
  motivationalMessages: [
    "Amazing job! Your karate skills are growing!",
    "Wow! Look at those punches and kicks!",
    "You're becoming a karate master!",
    "Your sensei would be proud!",
    "Keep it up, karate star!",
    "You're on fire today!",
    "Those were some awesome moves!",
    "Your practice is paying off!"
  ]
};

export default sampleData;