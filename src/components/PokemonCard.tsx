"use client";

import { memo } from "react";
import type { PokemonCardData } from "@/types/pokemon";
import { typeNameKo } from "@/constants/typeNameKo";
import { typeColor } from "@/utils/typeColor";

interface Props {
  data: PokemonCardData;
  onClick: (data: PokemonCardData) => void;
  isSelected?: boolean;
}

const PokemonCard = memo(function PokemonCard({ data, onClick, isSelected }: Props) {
  const { pokemon, koName, isLegendary, isMythical } = data;
  const img =
    pokemon.sprites.other["official-artwork"].front_default ??
    pokemon.sprites.front_default;

  const borderClass = isMythical
    ? "border-purple-300"
    : isLegendary
      ? "border-yellow-300"
      : "border-amber-100";

  return (
    <div
      onClick={() => onClick(data)}
      className={`bg-white rounded-2xl p-3 sm:p-4 text-center shadow-md border-2 ${borderClass} sm:hover:scale-105 active:scale-95 transition-transform cursor-pointer ${isSelected ? "ring-2 ring-red-400 ring-offset-2" : ""}`}
    >
      <img
        src={img ?? ""}
        alt={koName}
        loading="lazy"
        className="w-16 h-16 sm:w-24 sm:h-24 mx-auto"
      />
      <p className="font-bold text-gray-700 mt-2">{koName}</p>
      <p className="text-gray-400 text-sm">#{String(pokemon.id).padStart(3, "0")}</p>
      <div className="flex gap-1 justify-center mt-2 flex-wrap">
        {isMythical && (
          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-600">
            ✨ 환상
          </span>
        )}
        {!isMythical && isLegendary && (
          <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-600">
            ⭐ 전설
          </span>
        )}
        {pokemon.types.map((t) => (
          <span
            key={t.type.name}
            className={`text-xs px-2 py-1 rounded-full ${typeColor[t.type.name] ?? "bg-amber-100 text-amber-600"}`}
          >
            {typeNameKo[t.type.name] ?? t.type.name}
          </span>
        ))}
      </div>
    </div>
  );
});

export default PokemonCard;
