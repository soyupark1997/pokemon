import { getPokemon, getPokemonList, getPokemonLegend } from "./api/fetcher";
import { createCard, createSkeletonCard } from "./components/card";
import { openModal } from "./components/modal";
import type { PokemonCardData } from "./types/pokemon";
import "./style.css";

const pokemonGrid = document.getElementById("pokemon-grid")!;

const allPokemons: PokemonCardData[] = [];

let currentLegendFilter = "all";
let currentTypeFilter = "all";

function renderFiltered() {
  pokemonGrid.innerHTML = "";

  const filtered = allPokemons.filter(
    ({ pokemon, isLegendary, isMythical }) => {
      const legendMatch =
        currentLegendFilter === "all" ||
        (currentLegendFilter === "legendary" && isLegendary) ||
        (currentLegendFilter === "mythical" && isMythical);

      const typeMatch =
        currentTypeFilter === "all" ||
        pokemon.types.some((t) => t.type.name === currentTypeFilter);

      return legendMatch && typeMatch;
    },
  );

  filtered.forEach(({ pokemon, koName, isLegendary, isMythical }) => {
    const card = createCard(pokemon, koName, isLegendary, isMythical);
    card.addEventListener("click", () =>
      openModal({ pokemon, koName, isLegendary, isMythical }, allPokemons),
    );
    pokemonGrid.appendChild(card);
  });
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

const list = await getPokemonList(721);

list.results.forEach((_, index) => {
  const skeleton = createSkeletonCard();
  skeleton.id = `skeleton-${index}`;
  pokemonGrid.appendChild(skeleton);
});

list.results.forEach(async (item, index) => {
  const pokemon = await getPokemon(item.name);
  const legend = await getPokemonLegend(item.name);

  const cardData: PokemonCardData = {
    pokemon,
    koName: legend.koName,
    isLegendary: legend.isLegendary,
    isMythical: legend.isMythical,
  };

  allPokemons.push(cardData);

  const card = createCard(
    pokemon,
    legend.koName,
    legend.isLegendary,
    legend.isMythical,
  );
  card.addEventListener("click", () => openModal(cardData, allPokemons)); // ⭐

  const skeleton = document.getElementById(`skeleton-${index}`);
  skeleton?.replaceWith(card);
});
