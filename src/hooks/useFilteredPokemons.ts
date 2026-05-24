import { useState, useEffect, useMemo } from "react";
import type { PokemonCardData } from "@/types/pokemon";

const PAGE_SIZE = 20;

export function useFilteredPokemons(allPokemons: (PokemonCardData | null)[]) {
  const [legendFilter, setLegendFilter] = useState("all");
  const [typeFilter, setTypeFilter]     = useState("all");
  const [searchQuery, setSearchQuery]   = useState("");
  const [currentPage, setCurrentPage]   = useState(1);

  useEffect(() => { setCurrentPage(1); }, [legendFilter, typeFilter, searchQuery]);

  const filtered = useMemo(() => {
    return allPokemons
      .filter((p): p is PokemonCardData => p !== null)
      .filter(({ pokemon, koName, isLegendary, isMythical }) => {
        const legendMatch =
          legendFilter === "all" ||
          (legendFilter === "legendary" && isLegendary) ||
          (legendFilter === "mythical" && isMythical);
        const typeMatch =
          typeFilter === "all" ||
          pokemon.types.some((t) => t.type.name === typeFilter);
        const searchMatch = searchQuery === "" || koName.includes(searchQuery);
        return legendMatch && typeMatch && searchMatch;
      })
      .sort((a, b) => a.pokemon.id - b.pokemon.id);
  }, [allPokemons, legendFilter, typeFilter, searchQuery]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handlePageChange(page: number) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return {
    legendFilter, setLegendFilter,
    typeFilter, setTypeFilter,
    searchQuery, setSearchQuery,
    currentPage, totalPages,
    pageItems,
    handlePageChange,
  };
}
