import { getPokemon, getPokemonList, getPokemonLegend } from "./api/fetcher";
import { createCard, createSkeletonCard } from "./components/card";
import { openModal } from "./components/modal";
import type { PokemonCardData } from "./types/pokemon";
import "./style.css";

const PAGE_SIZE = 40;
const BATCH_SIZE = 10;

const pokemonGrid = document.getElementById("pokemon-grid")!;
const loadMoreBtn = document.getElementById("load-more-btn")!;

const allPokemons: PokemonCardData[] = [];

let currentLegendFilter = "all";
let currentTypeFilter = "all";
let currentPage = 1;

function getFiltered() {
  return allPokemons
    .filter(Boolean)
    .filter(({ pokemon, isLegendary, isMythical }) => {
      const legendMatch =
        currentLegendFilter === "all" ||
        (currentLegendFilter === "legendary" && isLegendary) ||
        (currentLegendFilter === "mythical" && isMythical);
      const typeMatch =
        currentTypeFilter === "all" ||
        pokemon.types.some((t) => t.type.name === currentTypeFilter);
      return legendMatch && typeMatch;
    })
    .sort((a, b) => a.pokemon.id - b.pokemon.id);
}

function renderFiltered() {
  pokemonGrid.innerHTML = "";
  currentPage = 1;

  const filtered = getFiltered();
  const page = filtered.slice(0, PAGE_SIZE * currentPage);

  page.forEach((cardData) => {
    const { pokemon, koName, isLegendary, isMythical } = cardData;
    const card = createCard(pokemon, koName, isLegendary, isMythical);
    card.addEventListener("click", () => openModal(cardData, allPokemons));
    pokemonGrid.appendChild(card);
  });

  loadMoreBtn.style.display = filtered.length > PAGE_SIZE ? "block" : "none";
}

function loadMore() {
  currentPage++;
  const filtered = getFiltered();
  const start = PAGE_SIZE * (currentPage - 1);
  const page = filtered.slice(start, PAGE_SIZE * currentPage);

  page.forEach((cardData) => {
    const { pokemon, koName, isLegendary, isMythical } = cardData;
    const card = createCard(pokemon, koName, isLegendary, isMythical);
    card.addEventListener("click", () => openModal(cardData, allPokemons));
    pokemonGrid.appendChild(card);
  });

  if (PAGE_SIZE * currentPage >= filtered.length) {
    loadMoreBtn.style.display = "none";
  }
}

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

loadMoreBtn.addEventListener("click", loadMore);

const list = await getPokemonList(721);

// 스켈레톤은 처음 PAGE_SIZE개만 보여줌
const skeletonCount = Math.min(list.results.length, PAGE_SIZE);
for (let i = 0; i < skeletonCount; i++) {
  const skeleton = createSkeletonCard();
  skeleton.id = `skeleton-${i}`;
  pokemonGrid.appendChild(skeleton);
}

// 10개씩 배치로 fetch
for (let i = 0; i < list.results.length; i += BATCH_SIZE) {
  const batch = list.results.slice(i, i + BATCH_SIZE);
  await Promise.all(
    batch.map(async (item, batchIndex) => {
      const index = i + batchIndex;
      const [pokemon, legend] = await Promise.all([
        getPokemon(item.name),
        getPokemonLegend(item.name),
      ]);

      const cardData: PokemonCardData = {
        pokemon,
        koName: legend.koName,
        isLegendary: legend.isLegendary,
        isMythical: legend.isMythical,
      };

      allPokemons[index] = cardData;

      // 첫 PAGE_SIZE 안에 있으면 스켈레톤 교체, 아니면 그냥 저장만
      if (index < PAGE_SIZE) {
        const card = createCard(
          pokemon,
          legend.koName,
          legend.isLegendary,
          legend.isMythical,
        );
        card.addEventListener("click", () => openModal(cardData, allPokemons));
        const skeleton = document.getElementById(`skeleton-${index}`);
        skeleton?.replaceWith(card);
      }

      // 마지막 포켓몬 로드 완료 시 더 보기 버튼 표시
      if (allPokemons.filter(Boolean).length === list.results.length) {
        const filtered = getFiltered();
        if (filtered.length > PAGE_SIZE) loadMoreBtn.style.display = "block";
      }
    }),
  );
}
