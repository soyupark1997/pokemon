import { useState, useEffect } from "react";
import type { PokemonCardData } from "@/types/pokemon";
import { getPokemon, getPokemonLegend } from "@/api/fetcher";

const BATCH_SIZE = 50;

export function usePokemonList(pokemonNames: string[]) {
  const [allPokemons, setAllPokemons] = useState<(PokemonCardData | null)[]>(
    () => new Array(pokemonNames.length).fill(null),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      for (let i = 0; i < pokemonNames.length; i += BATCH_SIZE) {
        if (cancelled) break;
        const batch = pokemonNames.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(async (name, batchIndex) => {
            const index = i + batchIndex;
            try {
              // pokemon 호출과 species 호출을 동시에 시작 (species name = pokemon name인 경우가 대부분)
              const [pokemon, speculativeLegend] = await Promise.all([
                getPokemon(name),
                getPokemonLegend(name).catch(() => null),
              ]);
              // 추측이 실패한 경우(폼 포켓몬 등)에만 올바른 species name으로 재시도
              const legend = speculativeLegend ?? await getPokemonLegend(pokemon.species.name);
              if (cancelled) return;
              const cardData: PokemonCardData = {
                pokemon,
                koName:      legend.koName,
                isLegendary: legend.isLegendary,
                isMythical:  legend.isMythical,
              };
              setAllPokemons((prev) => {
                const next = [...prev];
                next[index] = cardData;
                return next;
              });
            } catch {
              // null 유지
            }
          }),
        );
      }
      if (!cancelled) setIsLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [pokemonNames]);

  return { allPokemons, isLoading };
}
