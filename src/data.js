// The Open Championship 2026 — Royal Birkdale
// July 16-19, 2026

export const TOURNAMENT = {
  name: "The Open Championship 2026",
  venue: "Royal Birkdale",
  dates: "July 16–19, 2026",
  lockDate: "2026-07-16",
}

export const GROUPS = [
  {
    id: 1,
    name: "Group 1 — Favourites",
    golfers: [
      "Scottie Scheffler",
      "Rory McIlroy",
      "Tommy Fleetwood",
      "Jon Rahm",
      "Xander Schauffele",
      "Matt Fitzpatrick",
      "Tyrrell Hatton",
    ],
  },
  {
    id: 2,
    name: "Group 2 — Contenders",
    golfers: [
      "Collin Morikawa",
      "Ludvig Åberg",
      "Cameron Young",
      "Justin Rose",
      "Viktor Hovland",
      "Chris Gotterup",
      "Wyndham Clark",
    ],
  },
  {
    id: 3,
    name: "Group 3 — Each Way",
    golfers: [
      "Robert MacIntyre",
      "Sam Burns",
      "Hideki Matsuyama",
      "Shane Lowry",
      "Patrick Cantlay",
      "Bryson DeChambeau",
      "Joaquin Niemann",
    ],
  },
  {
    id: 4,
    name: "Group 4 — Outsiders",
    golfers: [
      "Russell Henley",
      "Jordan Spieth",
      "Brian Harman",
      "Brooks Koepka",
      "Aaron Rai",
      "Maverick McNealy",
      "Patrick Reed",
    ],
  },
  {
    id: 5,
    name: "Group 5 — Longshots",
    golfers: [
      "Sepp Straka",
      "Rasmus Hojgaard",
      "Justin Thomas",
      "Keegan Bradley",
      "Si Woo Kim",
      "Tony Finau",
      "Cameron Smith",
    ],
  },
]

export const ALL_GOLFERS = GROUPS.flatMap(g => g.golfers)

export function isPicsLocked() {
  const lockTime = new Date("2026-07-16T05:00:00Z")
  return new Date() >= lockTime
}
