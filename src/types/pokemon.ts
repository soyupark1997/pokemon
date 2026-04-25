// 목록 API 응답 타입
export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonSummary[];
}

export interface PokemonSummary {
  name: string;
  url: string;
}

export interface Pokemon {
  id: number;
  name: string;
  sprites: Sprites;
  types: PokemonType[];
  stats: PokemonStat[];
}

export interface Sprites {
  front_default: string | null;
  other: {
    "official-artwork": {
      front_default: string | null;
    };
  };
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonSpecies {
  name: string;
  names: {
    name: string;
    language: {
      name: string;
    };
  }[];
  is_legendary: boolean;
  is_mythical: boolean;
}

export interface PokemonCardData {
  pokemon: Pokemon;
  koName: string;
  isLegendary: boolean;
  isMythical: boolean;
}
