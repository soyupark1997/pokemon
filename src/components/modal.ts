import type { PokemonCardData } from "../types/pokemon";
import type { Pokemon } from "../types/pokemon";

// 앱 시작 시 딱 한 번만 생성, 재사용
const battleWorker = new Worker(
  new URL("../utils/battleWorker.ts", import.meta.url),
  { type: "module" },
);
let requestId = 0;

function getStatColor(value: number): string {
  if (value >= 150) return "bg-red-400";
  if (value >= 100) return "bg-orange-400";
  if (value >= 70) return "bg-yellow-400";
  if (value >= 50) return "bg-green-400";
  return "bg-gray-300";
}

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

function renderBattleSection(
  winRate: number,
  best: { pokemon: Pokemon; rate: number }[],
  worst: { pokemon: Pokemon; rate: number }[],
  allPokemons: PokemonCardData[],
): string {
  const rankingRows = (items: { pokemon: Pokemon; rate: number }[], color: string) =>
    items
      .map(({ pokemon, rate }) => {
        const koName =
          allPokemons.find((p) => p?.pokemon.id === pokemon.id)?.koName ?? pokemon.name;
        return `
          <div class="flex items-center gap-2 mb-1">
            <img src="${pokemon.sprites.front_default}" class="w-8 h-8" />
            <span class="text-xs text-gray-600">${koName}</span>
            <span class="text-xs font-bold ${color} ml-auto">${rate}%</span>
          </div>`;
      })
      .join("");

  return `
    <div class="mb-4 text-center bg-white/60 rounded-2xl py-3">
      <p class="text-xs text-gray-400 mb-1">전체 포켓몬 대상 승률</p>
      <p class="text-3xl font-bold ${winRate >= 50 ? "text-green-500" : "text-red-400"}">${winRate}%</p>
    </div>
    <div class="grid grid-cols-2 gap-3">
      <div>
        <h3 class="font-bold text-green-500 mb-2">😅 간신히 이기는 TOP3</h3>
        ${rankingRows(best, "text-green-500")}
      </div>
      <div>
        <h3 class="font-bold text-red-400 mb-2">😬 비등하지만 질 TOP3</h3>
        ${worst.length > 0
          ? rankingRows(worst, "text-red-400")
          : `<p class="text-xs text-gray-400 mt-2">비등한 패배 없음<br/>(완패하거나 전승)</p>`}
      </div>
    </div>`;
}

export function openModal(
  selected: PokemonCardData,
  allPokemons: PokemonCardData[],
) {
  document.getElementById("pokemon-modal")?.remove();

  const modal = document.createElement("div");
  modal.id = "pokemon-modal";
  modal.className =
    "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4";

  modal.innerHTML = `
    <div class="bg-amber-50 rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">

      <button id="modal-close" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">✕</button>

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
              (t) =>
                `<span class="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-600">${t.type.name}</span>`,
            )
            .join("")}
        </div>
      </div>

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
          </div>`,
          )
          .join("")}
      </div>

      <div id="battle-section">
        <div class="flex items-center justify-center py-6 text-amber-400 gap-2">
          <svg class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <span class="text-sm">배틀 계산 중…</span>
        </div>
      </div>

    </div>
  `;

  modal.querySelector("#modal-close")?.addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });

  document.body.appendChild(modal);

  // 싱글턴 Worker에 요청, 오래된 응답은 id로 무시
  const allPokemonOnly = allPokemons.filter(Boolean).map((p) => p.pokemon);
  const currentId = ++requestId;

  battleWorker.postMessage({ id: currentId, selected: selected.pokemon, allPokemons: allPokemonOnly });

  const timer = setTimeout(() => {
    const battleSection = modal.querySelector("#battle-section");
    if (battleSection?.querySelector(".animate-spin")) {
      battleSection.innerHTML = `<p class="text-center text-gray-400 text-sm py-4">배틀 데이터를 불러올 수 없어요</p>`;
    }
  }, 8000);

  battleWorker.onmessage = (e) => {
    if (e.data.id !== currentId) return;
    clearTimeout(timer);
    const battleSection = modal.querySelector("#battle-section");
    if (!battleSection) return;
    if (!e.data.result) {
      battleSection.innerHTML = `<p class="text-center text-gray-400 text-sm py-4">배틀 데이터를 불러올 수 없어요</p>`;
      return;
    }
    battleSection.innerHTML = renderBattleSection(
      e.data.result.winRate,
      e.data.result.best,
      e.data.result.worst,
      allPokemons,
    );
  };
}
