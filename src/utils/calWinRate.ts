import type { Pokemon } from "../types/pokemon";
import { typeChart } from "./typeChart";

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

function calcTotalStat(pokemon: Pokemon): number {
  return pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);
}

export function calcWinRate(attacker: Pokemon, defender: Pokemon): number {
  const attackTypes = attacker.types.map((t) => t.type.name);
  const defenseTypes = defender.types.map((t) => t.type.name);

  const typeMultiplier = calcTypeMultiplier(attackTypes, defenseTypes);

  const attackerStat = calcTotalStat(attacker);
  const defenderStat = calcTotalStat(defender);
  const statRatio = attackerStat / (attackerStat + defenderStat);

  const typeScore = Math.min(typeMultiplier / 2, 1) * 40;
  const statScore = statRatio * 60;

  return Math.round(typeScore + statScore);
}

export function calcBattleRanking(
  selected: Pokemon,
  allPokemons: Pokemon[],
): {
  best: { pokemon: Pokemon; rate: number }[];
  worst: { pokemon: Pokemon; rate: number }[];
} {
  const rates = allPokemons
    .filter((p) => p.id !== selected.id) // 자기 자신 제외
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
