import { calcBattleRanking } from "./calWinRate";
import type { Pokemon } from "../types/pokemon";

self.onmessage = (e: MessageEvent<{ selected: Pokemon; allPokemons: Pokemon[] }>) => {
  const result = calcBattleRanking(e.data.selected, e.data.allPokemons);
  self.postMessage(result);
};
