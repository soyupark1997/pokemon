import { calcBattleRanking } from "./calWinRate";
import type { Pokemon } from "@/types/pokemon";

self.onmessage = (e: MessageEvent<{ selected: Pokemon; allPokemons: Pokemon[] }>) => {
  const { selected, allPokemons } = e.data;
  try {
    const result = calcBattleRanking(selected, allPokemons);
    self.postMessage({ result });
  } catch {
    self.postMessage({ result: null });
  }
};
