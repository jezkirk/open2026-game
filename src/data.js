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
      "Matt Fitzpatrick",
      "Jon Rahm",
      "Xander Schauffele",
      "Tyrrell Hatton",
    ],
  },
  {
    id: 2,
    name: "Group 2 — Contenders",
    golfers: [
      "Cameron Young",
      "Ludvig Åberg",
      "Aaron Rai",
      "Justin Rose",
      "Chris Gotterup",
      "Robert MacIntyre",
      "Collin Morikawa",
    ],
  },
  {
    id: 3,
    name: "Group 3 — Each Way",
    golfers: [
      "Sam Burns",
      "Viktor Hovland",
      "Wyndham Clark",
      "Bryson DeChambeau",
      "Jordan Spieth",
      "Shane Lowry",
      "Patrick Cantlay",
    ],
  },
  {
    id: 4,
    name: "Group 4 — Outsiders",
    golfers: [
      "Brooks Koepka",
      "Tom Kim",
      "Joaquin Niemann",
      "Russell Henley",
      "Brian Harman",
      "Sepp Straka",
      "Alex Fitzpatrick",
    ],
  },
  {
    id: 5,
    name: "Group 5 — Longshots",
    golfers: [
      "Rasmus Hojgaard",
      "Justin Thomas",
      "Keegan Bradley",
      "Cameron Smith",
      "Si Woo Kim",
      "Tony Finau",
      "Danny Willett",
    ],
  },
]

export const ALL_GOLFERS = GROUPS.flatMap(g => g.golfers)

export function isPicsLocked() {
  const lockTime = new Date("2026-07-16T05:00:00Z")
  return new Date() >= lockTime
}
