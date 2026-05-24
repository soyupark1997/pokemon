"use client";

import { useState } from "react";
import type { PokemonCardData } from "@/types/pokemon";
import { LEGEND_FILTERS, TYPE_FILTERS } from "@/constants/filters";
import { usePokemonList } from "@/hooks/usePokemonList";
import { useBattleMode } from "@/hooks/useBattleMode";
import { useFilteredPokemons } from "@/hooks/useFilteredPokemons";
import PokemonCard from "./PokemonCard";
import SkeletonCard from "./SkeletonCard";
import Pagination from "./Pagination";
import PokemonModal from "./PokemonModal";
import BattleModal from "./BattleModal";

interface Props {
  pokemonNames: string[];
}

export default function PokemonGrid({ pokemonNames }: Props) {
  const { allPokemons, isLoading } = usePokemonList(pokemonNames);
  const {
    legendFilter, setLegendFilter,
    typeFilter, setTypeFilter,
    searchQuery, setSearchQuery,
    currentPage, totalPages,
    pageItems, handlePageChange,
  } = useFilteredPokemons(allPokemons);
  const {
    battleMode, battleSelected, battlePair,
    battleBannerText, toggleBattleMode, selectForBattle, closeBattle,
  } = useBattleMode();

  const [selectedPokemon, setSelectedPokemon] = useState<PokemonCardData | null>(null);

  const hasActiveFilters = legendFilter !== "all" || typeFilter !== "all" || searchQuery !== "";
  const skeletonCount =
    isLoading && currentPage === 1 && !hasActiveFilters
      ? Math.max(0, Math.min(pokemonNames.length, 20) - pageItems.length)
      : 0;

  function handleCardClick(cardData: PokemonCardData) {
    if (battleMode) selectForBattle(cardData);
    else setSelectedPokemon(cardData);
  }

  const loadedPokemons = allPokemons.filter((p): p is PokemonCardData => p !== null);

  return (
    <>
      <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
        {/* 배틀 모드 */}
        <div className="flex flex-col items-center gap-2 mb-4 sm:mb-6">
          <button
            onClick={toggleBattleMode}
            className={
              battleMode
                ? "px-5 py-2 rounded-full bg-red-400 text-white font-bold text-sm transition-colors hover:bg-red-500"
                : "px-5 py-2 rounded-full border-2 border-red-300 text-red-400 font-bold text-sm transition-colors hover:bg-red-50"
            }
          >
            ⚔️ {battleMode ? "배틀 모드 종료" : "배틀 모드"}
          </button>
          {battleMode && (
            <div className="px-5 py-2 rounded-full bg-red-400 text-white text-sm font-bold text-center animate-pulse">
              {battleBannerText}
            </div>
          )}
        </div>

        {/* 검색 */}
        <div className="bg-white/60 rounded-2xl px-4 py-4 mb-4">
          <p className="text-sm text-amber-500 font-bold text-center mb-3 tracking-wide">검색</p>
          <div className="flex justify-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.trim())}
              placeholder="포켓몬 이름으로 검색..."
              className="w-full max-w-xs px-4 py-2 rounded-full border-2 border-amber-200 focus:border-amber-400 focus:outline-none text-amber-700 placeholder-amber-300 bg-white"
            />
          </div>
        </div>

        {/* 희귀도 */}
        <div className="bg-white/60 rounded-2xl px-4 py-4 mb-4">
          <p className="text-sm text-amber-500 font-bold text-center mb-3 tracking-wide">희귀도</p>
          <div className="flex gap-x-2 gap-y-2 justify-center flex-wrap">
            {LEGEND_FILTERS.map(({ value, label, active, base }) => (
              <button
                key={value}
                onClick={() => setLegendFilter(value)}
                className={`px-4 py-2 rounded-full border-2 transition-colors ${legendFilter === value ? active : base}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 타입 */}
        <div className="bg-white/60 rounded-2xl px-4 py-4">
          <p className="text-sm text-amber-500 font-bold text-center mb-3 tracking-wide">타입</p>
          <div className="flex gap-x-2 gap-y-3 justify-center flex-wrap">
            {TYPE_FILTERS.map(({ value, label, active, base }) => (
              <button
                key={value}
                onClick={() => setTypeFilter(value)}
                className={`px-4 py-2 rounded-full border-2 transition-colors ${typeFilter === value ? active : base}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 그리드 */}
      <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {pageItems.map((cardData) => (
          <PokemonCard
            key={cardData.pokemon.id}
            data={cardData}
            onClick={() => handleCardClick(cardData)}
            isSelected={battleSelected.some((p) => p.pokemon.id === cardData.pokemon.id)}
          />
        ))}
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <SkeletonCard key={`sk-${i}`} />
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* 상세 모달 */}
      {selectedPokemon && (
        <PokemonModal
          selected={selectedPokemon}
          allPokemons={loadedPokemons}
          onClose={() => setSelectedPokemon(null)}
        />
      )}

      {/* 배틀 모달 */}
      {battlePair && (
        <BattleModal
          p1={battlePair[0]}
          p2={battlePair[1]}
          onClose={closeBattle}
        />
      )}
    </>
  );
}
