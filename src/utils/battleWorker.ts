import { calcBattleRanking } from "./calWinRate";
import type { SlimPokemon } from "@/types/pokemon";

self.onmessage = (e: MessageEvent<{ selected: SlimPokemon; allPokemons: SlimPokemon[] }>) => {
  const { selected, allPokemons } = e.data;
  try {
    const result = calcBattleRanking(selected, allPokemons);
    self.postMessage({ result });
  } catch {
    self.postMessage({ result: null });
  }
};
