import { getPokemon, getPokemonList, getPokemonLegend } from "./api/fetcher";
import { createCard, createSkeletonCard } from "./components/card";
import { openModal } from "./components/modal";
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
        currentSearchQuery === "" ||
        koName.includes(currentSearchQuery);
      return legendMatch && typeMatch && searchMatch;
    })
    .sort((a, b) => a.pokemon.id - b.pokemon.id);
}

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
    const { pokemon, koName, isLegendary, isMythical } = cardData;
    const card = createCard(pokemon, koName, isLegendary, isMythical);
    card.addEventListener("click", () => openModal(cardData, allPokemons));
    pokemonGrid.appendChild(card);
  });

  renderPagination(filtered.length);
  pokemonGrid.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderFiltered() {
  currentPage = 1;
  pokemonGrid.innerHTML = "";

  const filtered = getFiltered();
  filtered.slice(0, PAGE_SIZE).forEach((cardData) => {
    const { pokemon, koName, isLegendary, isMythical } = cardData;
    const card = createCard(pokemon, koName, isLegendary, isMythical);
    card.addEventListener("click", () => openModal(cardData, allPokemons));
    pokemonGrid.appendChild(card);
  });

  renderPagination(filtered.length);
}

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
        // 폼 이름(deoxys-normal 등) 대신 species 이름으로 요청
        const legend = await getPokemonLegend(pokemon.species.name);

        const cardData: PokemonCardData = {
          pokemon,
          koName: legend.koName,
          isLegendary: legend.isLegendary,
          isMythical: legend.isMythical,
        };

        allPokemons[index] = cardData;

        if (index < PAGE_SIZE) {
          const card = createCard(
            pokemon,
            legend.koName,
            legend.isLegendary,
            legend.isMythical,
          );
          card.addEventListener("click", () => openModal(cardData, allPokemons));
          document.getElementById(`skeleton-${index}`)?.replaceWith(card);
        }
      } catch {
        // 한 포켓몬 로드 실패해도 나머지 계속 진행
        document.getElementById(`skeleton-${index}`)?.remove();
      }
    }),
  );

  // 배치 완료 후: 필터가 활성화돼 있으면 현재 페이지 갱신 (새로 로드된 매칭 항목 반영)
  if (currentLegendFilter !== "all" || currentTypeFilter !== "all") {
    const filtered = getFiltered();
    const start = (currentPage - 1) * PAGE_SIZE;
    pokemonGrid.innerHTML = "";
    filtered.slice(start, start + PAGE_SIZE).forEach((cardData) => {
      const { pokemon, koName, isLegendary, isMythical } = cardData;
      const card = createCard(pokemon, koName, isLegendary, isMythical);
      card.addEventListener("click", () => openModal(cardData, allPokemons));
      pokemonGrid.appendChild(card);
    });
    renderPagination(filtered.length);
  } else {
    renderPagination(getFiltered().length);
  }
}
