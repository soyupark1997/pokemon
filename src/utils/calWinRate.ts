import type { SlimPokemon } from "@/types/pokemon";
import { typeChart } from "./typeChart";

const MOVE_POWER = 80;
const SIMULATIONS = 30;

function getStat(pokemon: SlimPokemon, name: string): number {
  return pokemon.stats.find((s) => s.stat.name === name)?.base_stat ?? 1;
}

function actualHP(base: number): number {
  return Math.floor(base) + 60;
}

function actualStat(base: number): number {
  return Math.floor(base) + 5;
}

function chooseBestAttack(
  attackTypes: string[],
  defenseTypes: string[],
): { type1: number; type2: number } {
  let best = { type1: 1, type2: 1, total: -Infinity };
  for (const atkType of attackTypes) {
    const t1 = typeChart[atkType]?.[defenseTypes[0]] ?? 1;
    const t2 = defenseTypes[1] ? (typeChart[atkType]?.[defenseTypes[1]] ?? 1) : 1;
    if (t1 * t2 > best.total) best = { type1: t1, type2: t2, total: t1 * t2 };
  }
  return { type1: best.type1, type2: best.type2 };
}

function calcDamage(attacker: SlimPokemon, defender: SlimPokemon): number {
  const level = 50;
  const atk = actualStat(getStat(attacker, "attack"));
  const spAtk = actualStat(getStat(attacker, "special-attack"));
  const def = actualStat(getStat(defender, "defense"));
  const spDef = actualStat(getStat(defender, "special-defense"));

  const [A, D] = atk / def >= spAtk / spDef ? [atk, def] : [spAtk, spDef];

  const { type1, type2 } = chooseBestAttack(
    attacker.types.map((t) => t.type.name),
    defender.types.map((t) => t.type.name),
  );

  const stab = 1.5;
  const isCrit = Math.random() < 0.0417;
  const crit = isCrit ? 2.0 : 1.0;
  const random = Math.floor(Math.random() * 16 + 85);

  return Math.floor(
    Math.floor(
      Math.floor(
        Math.floor(Math.floor((level * 2) / 5 + 2) * MOVE_POWER * A / 50) / D,
      ) + 2,
    ) * crit * random / 100
    * stab * type1 * type2,
  );
}

export function simulateOnce(p1: SlimPokemon, p2: SlimPokemon): boolean {
  let p1HP = actualHP(getStat(p1, "hp"));
  let p2HP = actualHP(getStat(p2, "hp"));

  const p1Speed = getStat(p1, "speed");
  const p2Speed = getStat(p2, "speed");
  const p1GoesFirst =
    p1Speed > p2Speed || (p1Speed === p2Speed && Math.random() < 0.5);

  let turns = 0;
  while (p1HP > 0 && p2HP > 0) {
    if (++turns > 100) return p1HP >= p2HP;

    if (p1GoesFirst) {
      p2HP -= calcDamage(p1, p2);
      if (p2HP <= 0) return true;
      p1HP -= calcDamage(p2, p1);
    } else {
      p1HP -= calcDamage(p2, p1);
      if (p1HP <= 0) return false;
      p2HP -= calcDamage(p1, p2);
    }
  }

  return p1HP > 0;
}

function calcWinRate(attacker: SlimPokemon, defender: SlimPokemon): number {
  let wins = 0;
  for (let i = 0; i < SIMULATIONS; i++) {
    if (simulateOnce(attacker, defender)) wins++;
  }
  return Math.round((wins / SIMULATIONS) * 100);
}


export function calcBattleRanking(
  selected: SlimPokemon,
  allPokemons: SlimPokemon[],
): { winRate: number } {
  const others = allPokemons.filter((p) => p.id !== selected.id);
  if (others.length === 0) return { winRate: 0 };
  const rates = others.map((p) => ({ rate: calcWinRate(selected, p) }));
  const wins = rates.filter((r) => r.rate > 50).length;
  const winRate = Math.round((wins / others.length) * 100);
  return { winRate };
}
