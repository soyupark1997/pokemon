import type { PokemonCardData } from "@/types/pokemon";
import { simulateOnce } from "@/utils/calWinRate";

export const TYPE_MOVES: Record<string, string> = {
  fire: "불꽃방사",
  water: "파도타기",
  grass: "솔라빔",
  electric: "10만볼트",
  psychic: "사이코키네시스",
  dragon: "용의파동",
  normal: "몸통박치기",
  poison: "독침봉",
  ground: "지진",
  rock: "스톤샤워",
  ice: "냉동빔",
  fighting: "격투기",
  bug: "벌레먹음",
  ghost: "섀도볼",
  dark: "악의파동",
  steel: "아이언테일",
  fairy: "문포스",
  flying: "회오리바람",
};

export function josa(name: string, con: string, vow: string): string {
  const code = name.charCodeAt(name.length - 1);
  if (code < 0xac00 || code > 0xd7a3) return con;
  return (code - 0xac00) % 28 !== 0 ? con : vow;
}

export function getMove(p: PokemonCardData): string {
  for (const t of p.pokemon.types) {
    if (TYPE_MOVES[t.type.name]) return TYPE_MOVES[t.type.name];
  }
  return "몸통박치기";
}

export function decidewinner(p1: PokemonCardData, p2: PokemonCardData): boolean {
  let p1Wins = 0;
  for (let i = 0; i < 11; i++) {
    if (simulateOnce(p1.pokemon, p2.pokemon)) p1Wins++;
  }
  return p1Wins >= 6;
}
