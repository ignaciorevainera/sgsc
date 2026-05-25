import { balanceTeams } from "../../../src/lib/utils/teamBalancer";
import type { Player } from "../../../src/lib/utils/teamBalancer";

describe("balanceTeams", () => {
  it("distributes players into two teams", () => {
    const pool: Player[] = [
      { id: "1", name: "A", rating: 80, isGuest: false },
      { id: "2", name: "B", rating: 60, isGuest: false },
      { id: "3", name: "C", rating: 70, isGuest: false },
      { id: "4", name: "D", rating: 50, isGuest: false },
    ];

    const [teamA, teamB] = balanceTeams(pool);

    expect(teamA.players.length + teamB.players.length).toBe(4);
    expect(teamA.type).toBe("light");
    expect(teamB.type).toBe("dark");
  });

  it("produces balanced sums with equal ratings", () => {
    const pool: Player[] = [
      { id: "1", name: "A", rating: 50, isGuest: false },
      { id: "2", name: "B", rating: 50, isGuest: false },
      { id: "3", name: "C", rating: 50, isGuest: false },
      { id: "4", name: "D", rating: 50, isGuest: false },
    ];

    const [teamA, teamB] = balanceTeams(pool);

    expect(teamA.sum).toBe(teamB.sum);
  });

  it("minimizes difference with varied ratings", () => {
    const pool: Player[] = [
      { id: "1", name: "A", rating: 90, isGuest: false },
      { id: "2", name: "B", rating: 80, isGuest: false },
      { id: "3", name: "C", rating: 70, isGuest: false },
      { id: "4", name: "D", rating: 60, isGuest: false },
      { id: "5", name: "E", rating: 50, isGuest: false },
      { id: "6", name: "F", rating: 40, isGuest: false },
    ];

    const [teamA, teamB] = balanceTeams(pool);

    const diff = Math.abs(teamA.sum - teamB.sum);
    expect(diff).toBeLessThanOrEqual(20);
  });

  it("handles odd number of players", () => {
    const pool: Player[] = [
      { id: "1", name: "A", rating: 80, isGuest: false },
      { id: "2", name: "B", rating: 60, isGuest: false },
      { id: "3", name: "C", rating: 70, isGuest: false },
    ];

    const [teamA, teamB] = balanceTeams(pool);

    expect(teamA.players.length + teamB.players.length).toBe(3);
    const sizeDiff = Math.abs(teamA.players.length - teamB.players.length);
    expect(sizeDiff).toBeLessThanOrEqual(1);
  });

  it("returns empty teams for empty pool", () => {
    const [teamA, teamB] = balanceTeams([]);

    expect(teamA.players).toHaveLength(0);
    expect(teamB.players).toHaveLength(0);
    expect(teamA.sum).toBe(0);
    expect(teamB.sum).toBe(0);
  });

  it("handles single player pool", () => {
    const pool: Player[] = [
      { id: "1", name: "Solo", rating: 75, isGuest: false },
    ];

    const [teamA, teamB] = balanceTeams(pool);

    expect(teamA.players).toHaveLength(1);
    expect(teamB.players).toHaveLength(0);
    expect(teamA.sum).toBe(75);
  });

  it("includes guest and anonymous players correctly", () => {
    const pool: Player[] = [
      { id: "1", name: "Regular", rating: 80, isGuest: false },
      { id: "guest-1", name: "Invitado 1", rating: 50, isGuest: true, isAnonymous: true },
    ];

    const [teamA, teamB] = balanceTeams(pool);

    const allPlayers = [...teamA.players, ...teamB.players];
    expect(allPlayers).toHaveLength(2);
    expect(allPlayers.find((p) => p.isAnonymous)).toBeDefined();
  });
});
