// The Open Championship 2026 — Royal Birkdale
// July 16-19, 2026

export const TOURNAMENT = {
  name: "The Open Championship 2026",
  venue: "Royal Birkdale",
  dates: "July 16–19, 2026",
  lockDate: "2026-07-16", // picks lock on day 1
}

export const GROUPS = [
  {
    id: 1,
    name: "Group 1 — Favourites",
    golfers: [
      "Scottie Scheffler",
      "Rory McIlroy",
      "Jon Rahm",
      "Bryson DeChambeau",
      "Xander Schauffele",
      "Matt Fitzpatrick",
      "Tommy Fleetwood",
    ],
  },
  {
    id: 2,
    name: "Group 2 — Contenders",
    golfers: [
      "Collin Morikawa",
      "Ludvig Åberg",
      "Shane Lowry",
      "Viktor Hovland",
      "Patrick Cantlay",
      "Jordan Spieth",
      "Robert MacIntyre",
    ],
  },
  {
    id: 3,
    name: "Group 3 — Each Way",
    golfers: [
      "Tyrrell Hatton",
      "Justin Thomas",
      "Tony Finau",
      "Min Woo Lee",
      "Sepp Straka",
      "Corey Conners",
      "Adam Scott",
    ],
  },
  {
    id: 4,
    name: "Group 4 — Outsiders",
    golfers: [
      "Joaquin Niemann",
      "Russell Henley",
      "Harris English",
      "Tom Kim",
      "Alex Noren",
      "Billy Horschel",
      "Justin Rose",
    ],
  },
  {
    id: 5,
    name: "Group 5 — Longshots",
    golfers: [
      "Cameron Smith",
      "Nicolai Hojgaard",
      "Rasmus Hojgaard",
      "Ryan Fox",
      "Danny Willett",
      "Matt Wallace",
      "Aaron Rai",
    ],
  },
]

// All golfers flat list for score tracking
export const ALL_GOLFERS = GROUPS.flatMap(g => g.golfers)

export function isPicsLocked() {
  // Locks at 6am BST (5am UTC) on July 16 — before first tee time
  const lockTime = new Date("2026-07-16T05:00:00Z")
  return new Date() >= lockTime
}
