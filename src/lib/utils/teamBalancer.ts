export interface Player {
  id: string;
  name: string;
  rating: number;
  isGuest: boolean;
  isAnonymous?: boolean;
}

export interface Team {
  name: string;
  type: "light" | "dark";
  players: Player[];
  sum: number;
}

export const balanceTeams = (pool: Player[]): [Team, Team] => {
  const sorted = [...pool].sort((a, b) => b.rating - a.rating);

  const teamA: Team = {
    name: "Equipo Claro",
    type: "light",
    players: [],
    sum: 0,
  };
  const teamB: Team = {
    name: "Equipo Oscuro",
    type: "dark",
    players: [],
    sum: 0,
  };

  sorted.forEach((p) => {
    if (teamA.sum <= teamB.sum) {
      teamA.players.push(p);
      teamA.sum += p.rating;
    } else {
      teamB.players.push(p);
      teamB.sum += p.rating;
    }
  });

  return [teamA, teamB];
};
