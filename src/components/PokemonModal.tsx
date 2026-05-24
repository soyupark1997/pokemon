"use client";

import { useState, useEffect, useRef } from "react";
import type { PokemonCardData, PokemonSpecies } from "@/types/pokemon";
import { typeChart } from "@/utils/typeChart";
import { typeColor } from "@/utils/typeColor";

const typeNameKo: Record<string, string> = {
  fire: "불",
  water: "물",
  grass: "풀",
  electric: "전기",
  psychic: "에스퍼",
  dragon: "드래곤",
  normal: "노말",
  fighting: "격투",
  flying: "비행",
  poison: "독",
  ground: "땅",
  rock: "바위",
  bug: "벌레",
  ghost: "고스트",
  ice: "얼음",
  dark: "악",
  steel: "강철",
  fairy: "페어리",
};

function getWeaknesses(
  types: string[],
): { type: string; multiplier: number }[] {
  const result: { type: string; multiplier: number }[] = [];
  for (const atkType of Object.keys(typeChart)) {
    let mult = 1;
    for (const defType of types) {
      mult *= typeChart[atkType][defType] ?? 1;
    }
    if (mult >= 2) result.push({ type: atkType, multiplier: mult });
  }
  return result.sort((a, b) => b.multiplier - a.multiplier);
}

const BASE_URL = "https://pokeapi.co/api/v2";

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

function getStatColor(value: number): string {
  if (value >= 150) return "bg-red-400";
  if (value >= 100) return "bg-orange-400";
  if (value >= 70) return "bg-yellow-400";
  if (value >= 50) return "bg-green-400";
  return "bg-gray-300";
}

interface BattleResult {
  winRate: number;
}

interface Props {
  selected: PokemonCardData;
  allPokemons: PokemonCardData[];
  onClose: () => void;
}

export default function PokemonModal({
  selected,
  allPokemons,
  onClose,
}: Props) {
  const workerRef = useRef<Worker | null>(null);
  const allPokemonsRef = useRef(allPokemons);
  allPokemonsRef.current = allPokemons;
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [battleLoading, setBattleLoading] = useState(true);
  const [flavorText, setFlavorText] = useState<string | null>(null);

  useEffect(() => {
    setBattleLoading(true);
    setBattleResult(null);

    workerRef.current = new Worker(
      new URL("../utils/battleWorker.ts", import.meta.url),
      { type: "module" },
    );

    const allPokemonOnly = allPokemonsRef.current.filter(Boolean).map((p) => p.pokemon);
    const timer = setTimeout(() => setBattleLoading(false), 8000);

    workerRef.current.postMessage({
      selected: selected.pokemon,
      allPokemons: allPokemonOnly,
    });

    workerRef.current.onmessage = (e) => {
      clearTimeout(timer);
      setBattleLoading(false);
      setBattleResult(e.data.result ?? null);
    };

    return () => {
      clearTimeout(timer);
      workerRef.current?.terminate();
    };
  }, [selected]);

  useEffect(() => {
    setFlavorText(null);
    fetch(`${BASE_URL}/pokemon-species/${selected.pokemon.id}`)
      .then((r) => r.json())
      .then((data: PokemonSpecies) => {
        const koEntry = data.flavor_text_entries.find(
          (e) => e.language.name === "ko",
        );
        const entry = koEntry ?? data.flavor_text_entries[0];
        setFlavorText(entry ? entry.flavor_text.replace(/\f|\n/g, " ") : null);
      })
      .catch(() => setFlavorText(null));
  }, [selected.pokemon.id]);

  const img =
    selected.pokemon.sprites.other["official-artwork"].front_default ??
    selected.pokemon.sprites.front_default;

  const cryUrl =
    selected.pokemon.cries?.latest ?? selected.pokemon.cries?.legacy ?? null;

  function playCry() {
    if (!cryUrl) return;
    new Audio(cryUrl).play().catch(() => {});
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-amber-50 rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ✕
        </button>

        {/* 헤더 */}
        <div className="text-center mb-4">
          <img
            src={img ?? ""}
            alt={selected.koName}
            className="w-32 h-32 mx-auto"
          />
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl font-bold text-gray-700">
              {selected.koName}
            </h2>
            {cryUrl && (
              <button
                onClick={playCry}
                className="text-amber-400 hover:text-amber-500 transition-colors"
                title="울음소리 재생"
              >
                🎙️
              </button>
            )}
          </div>
          <p className="text-gray-400">
            #{String(selected.pokemon.id).padStart(3, "0")}
          </p>
          <div className="flex gap-1 justify-center mt-1">
            {selected.pokemon.types.map((t) => (
              <span
                key={t.type.name}
                className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-600"
              >
                {t.type.name}
              </span>
            ))}
          </div>
        </div>

        {/* 스탯 */}
        <div className="mb-4">
          <h3 className="font-bold text-gray-600 mb-2">📊 스탯</h3>
          {selected.pokemon.stats.map((s) => (
            <div key={s.stat.name} className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-400 w-24">
                {statNameMap[s.stat.name] ?? s.stat.name}
              </span>
              <div className="flex-1 bg-amber-100 rounded-full h-2">
                <div
                  className={`${getStatColor(s.base_stat)} h-2 rounded-full transition-all`}
                  style={{
                    width: `${Math.min(
                      (s.base_stat / (statMaxMap[s.stat.name] ?? 255)) * 100,
                      100,
                    )}%`,
                  }}
                />
              </div>
              <span
                className={`text-xs font-bold w-8 ${getStatColor(s.base_stat).replace("bg-", "text-")}`}
              >
                {s.base_stat}
              </span>
            </div>
          ))}
        </div>

        {/* 배틀 섹션 */}
        <div>
          {battleLoading ? (
            <div className="flex items-center justify-center py-6 text-amber-400 gap-2">
              <svg
                className="animate-spin w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              <span className="text-sm">배틀 계산 중…</span>
            </div>
          ) : battleResult ? (
            <>
              <div className="mb-4 text-center bg-white/60 rounded-2xl py-3">
                <p className="text-xs text-gray-400 mb-1">
                  전체 포켓몬 대상 승률
                </p>
                <p
                  className={`text-3xl font-bold ${
                    battleResult.winRate >= 50
                      ? "text-green-500"
                      : "text-red-400"
                  }`}
                >
                  {battleResult.winRate}%
                </p>
              </div>
              <div className="mt-3 space-y-3">
                <div>
                  <h3 className="font-bold text-red-400 mb-2">⚠️ 약점 타입</h3>
                  <div className="flex flex-wrap gap-1">
                    {getWeaknesses(
                      selected.pokemon.types.map((t) => t.type.name),
                    ).map(({ type, multiplier }) => (
                      <span
                        key={type}
                        className={`text-xs px-2 py-1 rounded-full font-bold ${typeColor[type] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {typeNameKo[type] ?? type}
                        {multiplier === 4 && " ×4"}
                      </span>
                    ))}
                  </div>
                </div>
                {flavorText && (
                  <div className="bg-white/60 rounded-2xl p-3">
                    <h3 className="font-bold text-gray-500 mb-1 text-xs">
                      📖 도감 설명
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {flavorText}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-400 text-sm py-4">
              배틀 데이터를 불러올 수 없어요
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
