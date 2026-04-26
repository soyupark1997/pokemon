import { getPokemon, getPokemonList, getPokemonLegend } from "./api/fetcher";
import { createCard, createSkeletonCard } from "./components/card";
import { openModal } from "./components/modal";
import { openBattleModal } from "./components/battleModal";
import type { PokemonCardData } from "./types/pokemon";
import "./style.css";

const PAGE_SIZE = 20;
const BATCH_SIZE = 10;

const pokemonGrid = document.getElementById("pokemon-grid")!;
const paginationEl = document.getElementById("pagination")!;

const allPokemons: PokemonCardData[] = [];

let currentLegendFilter = "all";
let currentTypeFilter = "all";
let currentSearchQuery = "";
let currentPage = 1;

// ── Battle mode state ───────────────────────────────────────────
let battleMode = false;
const battleSelected: PokemonCardData[] = [];

function updateBattleBanner() {
  const banner = document.getElementById("battle-banner")!;
  const count = battleSelected.length;
  if (count === 0) {
    banner.textContent = "배틀할 포켓몬 2마리를 선택하세요";
  } else if (count === 1) {
    banner.textContent = `${battleSelected[0].koName} 선택됨 — 상대 포켓몬을 선택하세요`;
  } else {
    banner.textContent = "배틀 준비 중...";
  }
}

function clearBattleSelection() {
  battleSelected.length = 0;
  document.querySelectorAll(".battle-selected").forEach((el) =>
    el.classList.remove("battle-selected"),
  );
  updateBattleBanner();
}

function toggleBattleMode() {
  battleMode = !battleMode;
  const btn = document.getElementById("battle-mode-btn")!;
  const banner = document.getElementById("battle-banner")!;

  if (battleMode) {
    btn.textContent = "⚔️ 배틀 모드 종료";
    btn.className =
      "px-5 py-2 rounded-full bg-red-400 text-white font-bold text-sm transition-colors hover:bg-red-500";
    banner.classList.remove("hidden");
  } else {
    btn.textContent = "⚔️ 배틀 모드";
    btn.className =
      "px-5 py-2 rounded-full border-2 border-red-300 text-red-400 font-bold text-sm transition-colors hover:bg-red-50";
    banner.classList.add("hidden");
    clearBattleSelection();
  }
}

function handleBattleSelect(cardData: PokemonCardData, card: HTMLElement) {
  const idx = battleSelected.findIndex((p) => p.pokemon.id === cardData.pokemon.id);

  if (idx !== -1) {
    battleSelected.splice(idx, 1);
    card.classList.remove("battle-selected");
    updateBattleBanner();
    return;
  }

  if (battleSelected.length >= 2) return;

  battleSelected.push(cardData);
  card.classList.add("battle-selected");
  updateBattleBanner();

  if (battleSelected.length === 2) {
    setTimeout(() => {
      openBattleModal(battleSelected[0], battleSelected[1]);
      clearBattleSelection();
    }, 300);
  }
}

// ── Card factory (centralises click handling) ───────────────────
function createCardWithHandler(cardData: PokemonCardData): HTMLElement {
  const { pokemon, koName, isLegendary, isMythical } = cardData;
  const card = createCard(pokemon, koName, isLegendary, isMythical);
  card.addEventListener("click", () => {
    if (battleMode) {
      handleBattleSelect(cardData, card);
    } else {
      openModal(cardData, allPokemons);
    }
  });
  return card;
}

// ── Filtering ───────────────────────────────────────────────────
function getFiltered() {
  return allPokemons
    .filter(Boolean)
    .filter(({ pokemon, koName, isLegendary, isMythical }) => {
      const legendMatch =
        currentLegendFilter === "all" ||
        (currentLegendFilter === "legendary" && isLegendary) ||
        (currentLegendFilter === "mythical" && isMythical);
      const typeMatch =
        currentTypeFilter === "all" ||
        pokemon.types.some((t) => t.type.name === currentTypeFilter);
      const searchMatch =
        currentSearchQuery === "" || koName.includes(currentSearchQuery);
      return legendMatch && typeMatch && searchMatch;
    })
    .sort((a, b) => a.pokemon.id - b.pokemon.id);
}

// ── Pagination ──────────────────────────────────────────────────
function renderPagination(totalItems: number) {
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  paginationEl.innerHTML = "";

  if (totalPages <= 1) return;

  const addBtn = (label: string, page: number, active = false) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.className = active
      ? "px-3 py-2 rounded-full bg-amber-400 text-white font-bold min-w-[36px]"
      : "px-3 py-2 rounded-full border-2 border-amber-200 text-amber-500 hover:bg-amber-100 min-w-[36px]";
    btn.addEventListener("click", () => goToPage(page));
    paginationEl.appendChild(btn);
  };

  const addEllipsis = () => {
    const span = document.createElement("span");
    span.textContent = "…";
    span.className = "px-1 py-2 text-amber-400";
    paginationEl.appendChild(span);
  };

  if (currentPage > 1) addBtn("‹", currentPage - 1);

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  if (start > 1) addBtn("1", 1);
  if (start > 2) addEllipsis();
  for (let p = start; p <= end; p++) addBtn(String(p), p, p === currentPage);
  if (end < totalPages - 1) addEllipsis();
  if (end < totalPages) addBtn(String(totalPages), totalPages);

  if (currentPage < totalPages) addBtn("›", currentPage + 1);
}

function goToPage(page: number) {
  currentPage = page;
  pokemonGrid.innerHTML = "";

  const filtered = getFiltered();
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  pageItems.forEach((cardData) => {
    pokemonGrid.appendChild(createCardWithHandler(cardData));
  });

  renderPagination(filtered.length);
  pokemonGrid.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderFiltered() {
  currentPage = 1;
  pokemonGrid.innerHTML = "";

  const filtered = getFiltered();
  filtered.slice(0, PAGE_SIZE).forEach((cardData) => {
    pokemonGrid.appendChild(createCardWithHandler(cardData));
  });

  renderPagination(filtered.length);
}

// ── Filter listeners ────────────────────────────────────────────
const searchInput = document.getElementById("search-input") as HTMLInputElement;
searchInput.addEventListener("input", (e) => {
  currentSearchQuery = (e.target as HTMLInputElement).value.trim();
  renderFiltered();
});

document.querySelectorAll('input[name="legend-filter"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    currentLegendFilter = (e.target as HTMLInputElement).value;
    renderFiltered();
  });
});

document.querySelectorAll('input[name="type-filter"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    currentTypeFilter = (e.target as HTMLInputElement).value;
    renderFiltered();
  });
});

document.getElementById("battle-mode-btn")!.addEventListener("click", toggleBattleMode);

// ── Initial load ────────────────────────────────────────────────
const list = await getPokemonList(721);

const skeletonCount = Math.min(list.results.length, PAGE_SIZE);
for (let i = 0; i < skeletonCount; i++) {
  const skeleton = createSkeletonCard();
  skeleton.id = `skeleton-${i}`;
  pokemonGrid.appendChild(skeleton);
}

for (let i = 0; i < list.results.length; i += BATCH_SIZE) {
  const batch = list.results.slice(i, i + BATCH_SIZE);
  await Promise.all(
    batch.map(async (item, batchIndex) => {
      const index = i + batchIndex;
      try {
        const pokemon = await getPokemon(item.name);
        const legend = await getPokemonLegend(pokemon.species.name);

        const cardData: PokemonCardData = {
          pokemon,
          koName: legend.koName,
          isLegendary: legend.isLegendary,
          isMythical: legend.isMythical,
        };

        allPokemons[index] = cardData;

        if (index < PAGE_SIZE) {
          const card = createCardWithHandler(cardData);
          document.getElementById(`skeleton-${index}`)?.replaceWith(card);
        }
      } catch {
        document.getElementById(`skeleton-${index}`)?.remove();
      }
    }),
  );

  if (currentLegendFilter !== "all" || currentTypeFilter !== "all" || currentSearchQuery !== "") {
    const filtered = getFiltered();
    const start = (currentPage - 1) * PAGE_SIZE;
    pokemonGrid.innerHTML = "";
    filtered.slice(start, start + PAGE_SIZE).forEach((cardData) => {
      pokemonGrid.appendChild(createCardWithHandler(cardData));
    });
    renderPagination(filtered.length);
  } else {
    renderPagination(getFiltered().length);
  }
}
