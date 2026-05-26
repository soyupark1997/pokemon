import { getPokemonList } from "@/api/fetcher";
import PokemonGrid from "@/components/PokemonGrid";

export default async function Home() {
  const list = await getPokemonList(721);
  const names = list.results.map((r) => r.name);

  return (
    <main className="p-4 sm:p-8">
      <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
        <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
          <h1 className="text-2xl sm:text-4xl font-bold text-amber-400">
            포켓몬 도감
          </h1>
        </div>
      </div>
      <PokemonGrid pokemonNames={names} />
    </main>
  );
}
