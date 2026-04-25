import type { Pokemon } from "../types/pokemon";

export function createCard(
  pokemon: Pokemon,
  koName: string,
  isLegendary: boolean,
  isMythical: boolean,
): HTMLElement {
  const card = document.createElement("div");

  const borderClass = isMythical
    ? "border-purple-300"
    : isLegendary
      ? "border-yellow-300"
      : "border-amber-100";

  card.className = `bg-white rounded-2xl p-3 sm:p-4 text-center shadow-md border-2 ${borderClass} sm:hover:scale-105 active:scale-95 transition-transform cursor-pointer`;

  const legendBadge = isMythical
    ? `<span class="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-600">✨ 환상</span>`
    : isLegendary
      ? `<span class="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-600">⭐ 전설</span>`
      : "";

  card.innerHTML = `
    <img
      src="${pokemon.sprites.other["official-artwork"].front_default}"
      alt="${pokemon.name}"
      loading="lazy"
      class="w-16 h-16 sm:w-24 sm:h-24 mx-auto"
    />
    <p class="font-bold text-gray-700 mt-2">${koName}</p>
    <p class="text-gray-400 text-sm">#${String(pokemon.id).padStart(3, "0")}</p>
    <div class="flex gap-1 justify-center mt-2 flex-wrap">
      ${legendBadge}
      ${pokemon.types
        .map(
          (t) => `
        <span class="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-600">
          ${t.type.name}
        </span>
      `,
        )
        .join("")}
    </div>
  `;
  return card;
}

export function createSkeletonCard(): HTMLElement {
  const card = document.createElement("div");
  card.className =
    "bg-white rounded-2xl p-4 text-center shadow-md border border-amber-100 animate-pulse";
  card.innerHTML = `
    <div class="w-24 h-24 mx-auto bg-amber-100 rounded-full mb-2"></div>
    <div class="h-4 bg-amber-100 rounded w-2/3 mx-auto mb-2"></div>
    <div class="h-3 bg-amber-50 rounded w-1/3 mx-auto"></div>
  `;
  return card;
}
