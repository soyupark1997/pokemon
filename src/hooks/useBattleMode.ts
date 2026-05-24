import { useState } from "react";
import type { PokemonCardData } from "@/types/pokemon";

export function useBattleMode() {
  const [battleMode, setBattleMode]         = useState(false);
  const [battleSelected, setBattleSelected] = useState<PokemonCardData[]>([]);
  const [battlePair, setBattlePair]         = useState<[PokemonCardData, PokemonCardData] | null>(null);

  function toggleBattleMode() {
    setBattleMode((v) => !v);
    setBattleSelected([]);
  }

  function selectForBattle(cardData: PokemonCardData) {
    setBattleSelected((prev) => {
      const idx = prev.findIndex((p) => p.pokemon.id === cardData.pokemon.id);
      if (idx !== -1) return prev.filter((_, i) => i !== idx);
      if (prev.length >= 2) return prev;
      const next = [...prev, cardData];
      if (next.length === 2) {
        setTimeout(() => {
          setBattlePair([next[0], next[1]]);
          setBattleSelected([]);
        }, 300);
      }
      return next;
    });
  }

  function closeBattle() {
    setBattlePair(null);
  }

  const battleBannerText =
    battleSelected.length === 0
      ? "배틀할 포켓몬 2마리를 선택하세요"
      : battleSelected.length === 1
        ? `${battleSelected[0].koName} 선택됨 — 상대 포켓몬을 선택하세요`
        : "배틀 준비 중...";

  return {
    battleMode,
    battleSelected,
    battlePair,
    battleBannerText,
    toggleBattleMode,
    selectForBattle,
    closeBattle,
  };
}
