import type { Pokemon } from "../types/pokemon";
import { typeChart } from "./typeChart";

const MOVE_POWER = 80;
const SIMULATIONS = 30;

function getStat(pokemon: Pokemon, name: string): number {
  return pokemon.stats.find((s) => s.stat.name === name)?.base_stat ?? 1;
}

function actualHP(base: number): number {
  return Math.floor(base) + 60;
}

function actualStat(base: number): number {
  return Math.floor(base) + 5;
}

function calcTypeMultiplier(
  attackTypes: string[],
  defenseTypes: string[],
): number {
  let multiplier = 1;
  attackTypes.forEach((atk) => {
    defenseTypes.forEach((def) => {
      multiplier *= typeChart[atk]?.[def] ?? 1;
    });
  });
  return multiplier;
}

function calcDamage(
  attacker: Pokemon,
  defender: Pokemon,
  typeMultiplier: number,
  randomFactor: number,
): number {
  const atk = actualStat(getStat(attacker, "attack"));
  const spAtk = actualStat(getStat(attacker, "special-attack"));
  const def = actualStat(getStat(defender, "defense"));
  const spDef = actualStat(getStat(defender, "special-defense"));

  const [atkStat, defStat] =
    atk / def >= spAtk / spDef ? [atk, def] : [spAtk, spDef];

  const base =
    (((2 * 50) / 5 + 2) * MOVE_POWER * (atkStat / defStat)) / 50 + 2;

  return base * typeMultiplier * randomFactor;
}

function simulateOnce(p1: Pokemon, p2: Pokemon): boolean {
  const p1Types = p1.types.map((t) => t.type.name);
  const p2Types = p2.types.map((t) => t.type.name);

  const p1TypeMult = calcTypeMultiplier(p1Types, p2Types);
  const p2TypeMult = calcTypeMultiplier(p2Types, p1Types);

  let p1HP = actualHP(getStat(p1, "hp"));
  let p2HP = actualHP(getStat(p2, "hp"));

  const p1Speed = getStat(p1, "speed");
  const p2Speed = getStat(p2, "speed");
  const p1GoesFirst =
    p1Speed > p2Speed || (p1Speed === p2Speed && Math.random() < 0.5);

  let turns = 0;
  while (p1HP > 0 && p2HP > 0) {
    if (++turns > 100) return p1HP >= p2HP; // 무한루프 방지 (스틸 등 저저항)

    const rand1 = 0.85 + Math.random() * 0.15;
    const rand2 = 0.85 + Math.random() * 0.15;

    if (p1GoesFirst) {
      p2HP -= calcDamage(p1, p2, p1TypeMult, rand1);
      if (p2HP <= 0) return true;
      p1HP -= calcDamage(p2, p1, p2TypeMult, rand2);
    } else {
      p1HP -= calcDamage(p2, p1, p2TypeMult, rand1);
      if (p1HP <= 0) return false;
      p2HP -= calcDamage(p1, p2, p1TypeMult, rand2);
    }
  }

  return p1HP > 0;
}

function calcWinRate(attacker: Pokemon, defender: Pokemon): number {
  let wins = 0;
  for (let i = 0; i < SIMULATIONS; i++) {
    if (simulateOnce(attacker, defender)) wins++;
  }
  return Math.round((wins / SIMULATIONS) * 100);
}

export function calcBattleRanking(
  selected: Pokemon,
  allPokemons: Pokemon[],
): {
  winRate: number;
  best: { pokemon: Pokemon; rate: number }[];
  worst: { pokemon: Pokemon; rate: number }[];
} {
  const rates = allPokemons
    .filter((p) => p.id !== selected.id)
    .map((p) => ({ pokemon: p, rate: calcWinRate(selected, p) }))
    .sort((a, b) => b.rate - a.rate);

  const wins = rates.filter((r) => r.rate > 50).length;
  const winRate = Math.round((wins / rates.length) * 100);

  // 이긴 것 중 승률이 50%에 가장 가까운 TOP3 (간신히 이기는 상대)
  const best = rates
    .filter((r) => r.rate > 50)
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 3);

  // 진 것 중 승률이 50%에 가장 가까운 TOP3 (0%는 비등이 아니므로 제외)
  const worst = rates
    .filter((r) => r.rate > 0 && r.rate < 50)
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 3);

  return { winRate, best, worst };
}
