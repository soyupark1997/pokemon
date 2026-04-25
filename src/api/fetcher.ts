import type {
  Pokemon,
  PokemonListResponse,
  PokemonSpecies,
} from "../types/pokemon";

const BASE_URL = "https://pokeapi.co/api/v2";

export async function fetchData<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`포켓몬들이 잠시 휴식중입니다! status: ${res.status}`);
  }
  const data: T = await res.json();
  return data;
}

export async function getPokemonList(limit = 20, offset = 0) {
  return fetchData<PokemonListResponse>(
    `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`,
  );
}

export async function getPokemon(pokemonName: string | number) {
  return fetchData<Pokemon>(`${BASE_URL}/pokemon/${pokemonName}`);
}

export interface PokemonLegend {
  koName: string;
  isLegendary: boolean;
  isMythical: boolean;
}

export async function getPokemonLegend(
  nameOrId: string | number,
): Promise<PokemonLegend> {
  const data = await fetchData<PokemonSpecies>(
    `${BASE_URL}/pokemon-species/${nameOrId}`,
  );
  const koName = data.names.find((n) => n.language.name === "ko");
  return {
    koName: koName?.name ?? data.name,
    isLegendary: data.is_legendary,
    isMythical: data.is_mythical,
  };
}
