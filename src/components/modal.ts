import type { PokemonCardData } from "../types/pokemon";
import { calcBattleRanking } from "../utils/calWinRate";

function getStatColor(value: number): string {
  if (value >= 150) return "bg-red-400";
  if (value >= 100) return "bg-orange-400";
  if (value >= 70) return "bg-yellow-400";
  if (value >= 50) return "bg-green-400";
  return "bg-gray-300";
}

export function openModal(
  selected: PokemonCardData,
  allPokemons: PokemonCardData[],
) {
  document.getElementById("pokemon-modal")?.remove();

  const allPokemonOnly = allPokemons.map((p) => p.pokemon);
  const { best, worst } = calcBattleRanking(selected.pokemon, allPokemonOnly);
  const statNameMap: Record<string, string> = {
    hp: "HP",
    attack: "공격",
    defense: "방어",
    "special-attack": "특수공격",
    "special-defense": "특수방어",
    speed: "스피드",
  };

  const statMaxMap: Record<string, number> = {
    hp: 255,
    attack: 190,
    defense: 230,
    "special-attack": 194,
    "special-defense": 230,
    speed: 200,
  };

  const modal = document.createElement("div");
  modal.id = "pokemon-modal";
  modal.className =
    "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4";

  modal.innerHTML = `
    <div class="bg-amber-50 rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
      
      <!-- 닫기 버튼 -->
      <button id="modal-close" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">✕</button>

      <!-- 포켓몬 기본 정보 -->
      <div class="text-center mb-4">
        <img 
          src="${selected.pokemon.sprites.other["official-artwork"].front_default}" 
          class="w-32 h-32 mx-auto"
        />
        <h2 class="text-2xl font-bold text-gray-700">${selected.koName}</h2>
        <p class="text-gray-400">#${String(selected.pokemon.id).padStart(3, "0")}</p>
        <div class="flex gap-1 justify-center mt-1">
          ${selected.pokemon.types
            .map(
              (t) => `
            <span class="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-600">${t.type.name}</span>
          `,
            )
            .join("")}
        </div>
      </div>

      <!-- 스탯 -->
      <div class="mb-4">
        <h3 class="font-bold text-gray-600 mb-2">📊 스탯</h3>
      ${selected.pokemon.stats
        .map(
          (s) => `
  <div class="flex items-center gap-2 mb-1">
    <span class="text-xs text-gray-400 w-24">${statNameMap[s.stat.name] ?? s.stat.name}</span>
    <div class="flex-1 bg-amber-100 rounded-full h-2">
      <div class="${getStatColor(s.base_stat)} h-2 rounded-full transition-all" 
        style="width: ${Math.min((s.base_stat / (statMaxMap[s.stat.name] ?? 255)) * 100, 100)}%">
      </div>
    </div>
    <span class="text-xs font-bold w-8 ${getStatColor(s.base_stat).replace("bg-", "text-")}">${s.base_stat}</span>
  </div>
`,
        )
        .join("")}
      </div>

      <!-- 배틀 랭킹 -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <h3 class="font-bold text-green-500 mb-2">🏆 이기기 쉬운 TOP3</h3>
          ${best
            .map(({ pokemon, rate }) => {
              const koName =
                allPokemons.find((p) => p.pokemon.id === pokemon.id)?.koName ??
                pokemon.name;
              return `
    <div class="flex items-center gap-2 mb-1">
      <img src="${pokemon.sprites.front_default}" class="w-8 h-8" />
      <span class="text-xs text-gray-600">${koName}</span>
      <span class="text-xs font-bold text-green-500 ml-auto">${rate}%</span>
    </div>
  `;
            })
            .join("")}
        </div>
        <div>
          <h3 class="font-bold text-red-400 mb-2">💀 이기기 어려운 TOP3</h3>
          ${worst
            .map(({ pokemon, rate }) => {
              const koName =
                allPokemons.find((p) => p.pokemon.id === pokemon.id)?.koName ??
                pokemon.name;
              return `
    <div class="flex items-center gap-2 mb-1">
      <img src="${pokemon.sprites.front_default}" class="w-8 h-8" />
      <span class="text-xs text-gray-600">${koName}</span>
      <span class="text-xs font-bold text-red-400 ml-auto">${rate}%</span>
    </div>
  `;
            })
            .join("")}
        </div>
      </div>

    </div>
  `;

  modal.querySelector("#modal-close")?.addEventListener("click", () => {
    modal.remove();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });

  document.body.appendChild(modal);
}
