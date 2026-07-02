const defaultFighters = [
  {
    id: "f1",
    name: "Marcus 'The Viper' Silva",
    weightClass: "Lightweight (155 lbs)",
    weight: 155,
    age: 28,
    height: "5'8\"",
    style: "Brazilian Jiu-Jitsu",
    record: { wins: 18, losses: 3, draws: 0 },
    stats: { striking: 74, grappling: 96, submission: 98, stamina: 88 },
    gym: "Alliance BJJ",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    color: "#ff2a5f"
  },
  {
    id: "f2",
    name: "Liam 'The Predator' O'Connor",
    weightClass: "Lightweight (155 lbs)",
    weight: 154,
    age: 26,
    height: "5'11\"",
    style: "Muay Thai / Kickboxing",
    record: { wins: 22, losses: 4, draws: 1 },
    stats: { striking: 98, grappling: 68, submission: 65, stamina: 92 },
    gym: "Tiger Muay Thai",
    avatar: "https://images.unsplash.com/photo-1620122303020-43ec4b6cf7f8?auto=format&fit=crop&w=200&q=80",
    color: "#00f0ff"
  },
  {
    id: "f3",
    name: "Viktor 'The Iron' Volkov",
    weightClass: "Lightweight (155 lbs)",
    weight: 155,
    age: 31,
    height: "5'10\"",
    style: "Sambo / Combat Sambo",
    record: { wins: 25, losses: 1, draws: 0 },
    stats: { striking: 85, grappling: 94, submission: 90, stamina: 95 },
    gym: "Red Star MMA",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    color: "#ff9f43"
  },
  {
    id: "f4",
    name: "Sarah 'Apex' Jenkins",
    weightClass: "Lightweight (155 lbs)",
    weight: 153,
    age: 27,
    height: "5'7\"",
    style: "Wrestling / Ground & Pound",
    record: { wins: 15, losses: 2, draws: 0 },
    stats: { striking: 80, grappling: 97, submission: 75, stamina: 94 },
    gym: "American Kickboxing Academy",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    color: "#a55eea"
  },
  {
    id: "f5",
    name: "Carlos 'El Toro' Mendez",
    weightClass: "Lightweight (155 lbs)",
    weight: 155,
    age: 29,
    height: "5'9\"",
    style: "Boxing / Freestyle Wrestling",
    record: { wins: 19, losses: 5, draws: 2 },
    stats: { striking: 92, grappling: 86, submission: 72, stamina: 85 },
    gym: "Kings MMA",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80",
    color: "#20bf6b"
  },
  {
    id: "f6",
    name: "Akihiro 'The Ghost' Sato",
    weightClass: "Lightweight (155 lbs)",
    weight: 154,
    age: 30,
    height: "5'10\"",
    style: "Kyokushin Karate / Judo",
    record: { wins: 20, losses: 6, draws: 0 },
    stats: { striking: 94, grappling: 82, submission: 80, stamina: 89 },
    gym: "Kodokan Tokyo",
    avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=200&q=80",
    color: "#eb3b5a"
  },
  {
    id: "f7",
    name: "Darnell 'Smooth' Jackson",
    weightClass: "Lightweight (155 lbs)",
    weight: 155,
    age: 28,
    height: "6'0\"",
    style: "Capoeira / Kickboxing",
    record: { wins: 16, losses: 4, draws: 0 },
    stats: { striking: 91, grappling: 70, submission: 78, stamina: 91 },
    gym: "Black House MMA",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80",
    color: "#f7b731"
  },
  {
    id: "f8",
    name: "Elena 'The Shield' Petrova",
    weightClass: "Lightweight (155 lbs)",
    weight: 152,
    age: 25,
    height: "5'6\"",
    style: "Judo / Combat Sambo",
    record: { wins: 17, losses: 3, draws: 0 },
    stats: { striking: 78, grappling: 95, submission: 92, stamina: 90 },
    gym: "Sambo 70",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    color: "#2bcbba"
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = defaultFighters;
}
