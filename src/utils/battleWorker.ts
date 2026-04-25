import { calcBattleRanking } from "./calWinRate";
import type { Pokemon } from "../types/pokemon";

self.onmessage = (e: MessageEvent<{ id: number; selected: Pokemon; allPokemons: Pokemon[] }>) => {
  const { id, selected, allPokemons } = e.data;
  const result = calcBattleRanking(selected, allPokemons);
  self.postMessage({ id, result });
};
