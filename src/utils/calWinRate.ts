import type { Pokemon } from "../types/pokemon";
import { typeChart } from "./typeChart";

const LEVEL = 50;
const MOVE_POWER = 80;
const SIMULATIONS = 200;

function getStat(pokemon: Pokemon, name: string): number {
  return pokemon.stats.find((s) => s.stat.name === name)?.base_stat ?? 1;
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
  const atk = getStat(attacker, "attack");
  const spAtk = getStat(attacker, "special-attack");
  const def = getStat(defender, "defense");
  const spDef = getStat(defender, "special-defense");

  // 공격/특공 중 유리한 쪽 선택
  const [atkStat, defStat] =
    atk / def >= spAtk / spDef ? [atk, def] : [spAtk, spDef];

  const base =
    (((2 * LEVEL) / 5 + 2) * MOVE_POWER * (atkStat / defStat)) / 50 + 2;

  return base * typeMultiplier * randomFactor;
}

function simulateOnce(p1: Pokemon, p2: Pokemon): boolean {
  const p1Types = p1.types.map((t) => t.type.name);
  const p2Types = p2.types.map((t) => t.type.name);

  const p1TypeMult = calcTypeMultiplier(p1Types, p2Types);
  const p2TypeMult = calcTypeMultiplier(p2Types, p1Types);

  let p1HP = getStat(p1, "hp");
  let p2HP = getStat(p2, "hp");

  const p1Speed = getStat(p1, "speed");
  const p2Speed = getStat(p2, "speed");

  // 속도가 같으면 랜덤 선공
  const p1GoesFirst =
    p1Speed > p2Speed || (p1Speed === p2Speed && Math.random() < 0.5);

  while (p1HP > 0 && p2HP > 0) {
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

export function calcWinRate(attacker: Pokemon, defender: Pokemon): number {
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
  best: { pokemon: Pokemon; rate: number }[];
  worst: { pokemon: Pokemon; rate: number }[];
} {
  const rates = allPokemons
    .filter((p) => p.id !== selected.id)
    .map((p) => ({
      pokemon: p,
      rate: calcWinRate(selected, p),
    }))
    .sort((a, b) => b.rate - a.rate);

  return {
    best: rates.slice(0, 3),
    worst: rates.slice(-3),
  };
}
