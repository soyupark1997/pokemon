"use client";

import { useMemo } from "react";
import type { PokemonCardData } from "@/types/pokemon";
import { decidewinner, getMove, josa } from "@/utils/battleLogic";
import { useBattleAnimation } from "@/components/BattleModalAnimation";

interface Props {
  p1: PokemonCardData;
  p2: PokemonCardData;
  onClose: () => void;
}

export default function BattleModal({ p1, p2, onClose }: Props) {
  const p1Wins = useMemo(() => decidewinner(p1, p2), [p1, p2]);
  const containerRef = useBattleAnimation(p1, p2, p1Wins);

  const winner = p1Wins ? p1 : p2;
  const loser = p1Wins ? p2 : p1;
  const winnerMove = getMove(winner);

  const p1Img =
    p1.pokemon.sprites.other["official-artwork"].front_default ??
    p1.pokemon.sprites.front_default;
  const p2Img =
    p2.pokemon.sprites.other["official-artwork"].front_default ??
    p2.pokemon.sprites.front_default;
  const wImg =
    winner.pokemon.sprites.other["official-artwork"].front_default ??
    winner.pokemon.sprites.front_default;

  const audience = useMemo(
    () =>
      Array.from({ length: 14 }, () => ({
        w: 12 + Math.floor(Math.random() * 10),
        h: 18 + Math.floor(Math.random() * 22),
        op: (4 + Math.floor(Math.random() * 5)) * 10,
        mb: Math.floor(Math.random() * 8),
      })),
    [],
  );

  const lights = useMemo(
    () => Array.from({ length: 6 }, (_, i) => 28 + (i % 3) * 10),
    [],
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      ref={containerRef}
    >
      <div
        id="battle-arena"
        className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
        style={{
          minHeight: 460,
          background:
            "linear-gradient(180deg,#080814 0%,#0d0d2a 30%,#18103a 34%,#8b6420 34%,#c49a30 42%,#a07820 52%,#7a5c10 70%,#5a4008 100%)",
        }}
      >
        {/* 천장 조명 */}
        <div
          className="absolute top-0 left-0 right-0 flex justify-around items-start pointer-events-none"
          style={{ height: "33%", paddingTop: 10 }}
        >
          {lights.map((h, i) => (
            <div
              key={i}
              style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
            >
              <div
                style={{
                  width: 6,
                  height: h,
                  background: "linear-gradient(180deg,rgba(255,232,120,0.85),transparent)",
                }}
              />
              <div
                style={{
                  width: 14,
                  height: 14,
                  background: "rgba(255,230,100,0.9)",
                  borderRadius: "50%",
                  boxShadow: "0 0 12px 6px rgba(255,220,80,0.4)",
                }}
              />
            </div>
          ))}
        </div>

        {/* 관중 실루엣 */}
        <div
          className="absolute left-0 right-0 flex justify-around items-end pointer-events-none"
          style={{ top: 0, height: "33%", paddingBottom: 2 }}
        >
          {audience.map((a, i) => (
            <div
              key={i}
              style={{
                width: a.w,
                height: a.h,
                background: `rgba(255,255,255,0.${a.op})`,
                borderRadius: "8px 8px 0 0",
                marginBottom: a.mb,
                flexShrink: 0,
              }}
            />
          ))}
        </div>

        {/* 바닥 라인 */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: "66%",
            background:
              "repeating-linear-gradient(90deg,transparent,transparent 50px,rgba(255,255,255,0.055) 50px,rgba(255,255,255,0.055) 52px)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: 0,
            top: "34%",
            left: "50%",
            width: 3,
            background: "rgba(255,255,255,0.13)",
            transform: "translateX(-50%)",
          }}
        />

        {/* 플래시 / 틴트 오버레이 */}
        <div
          id="bflash"
          className="absolute inset-0 bg-white opacity-0 pointer-events-none z-20"
          style={{ transition: "opacity 0.12s" }}
        />
        <div
          id="btint"
          className="absolute inset-0 opacity-0 pointer-events-none z-20"
          style={{ transition: "opacity 0.2s" }}
        />

        {/* 메인 콘텐츠 */}
        <div className="relative z-10 p-5 pt-4">
          <div className="text-center mb-2">
            <span
              id="battle-title"
              className="text-white font-black text-xl tracking-widest drop-shadow-lg"
            >
              ⚔️ 배틀!
            </span>
          </div>

          {/* 파이터 */}
          <div className="flex items-end justify-between px-2" style={{ minHeight: 210 }}>
            {/* P1 */}
            <div
              id="p1fighter"
              className="flex flex-col items-center gap-2"
              style={{ flex: 1, transformOrigin: "bottom center" }}
            >
              <div className="w-full max-w-[104px]">
                <div className="text-xs text-white/80 font-bold mb-1 truncate">
                  {p1.koName}
                </div>
                <div className="bg-white/20 rounded-full h-2.5 overflow-hidden">
                  <div
                    id="p1hp"
                    className="h-full rounded-full bg-green-400"
                    style={{ width: "100%", transition: "width 0.5s ease,background-color 0.3s" }}
                  />
                </div>
              </div>
              <div className="relative">
                <img
                  src={p1Img ?? ""}
                  className="w-28 h-28 object-contain drop-shadow-2xl"
                  alt={p1.koName}
                />
                <div
                  id="p1hit"
                  className="absolute inset-0 flex items-center justify-center text-4xl opacity-0 pointer-events-none select-none"
                />
              </div>
            </div>

            <div
              id="vsel"
              className="text-white/50 font-black text-3xl self-center mx-1 shrink-0 select-none"
            >
              VS
            </div>

            {/* P2 */}
            <div
              id="p2fighter"
              className="flex flex-col items-center gap-2"
              style={{ flex: 1, transformOrigin: "bottom center" }}
            >
              <div className="w-full max-w-[104px] flex flex-col items-end">
                <div className="text-xs text-white/80 font-bold mb-1 truncate">
                  {p2.koName}
                </div>
                <div className="bg-white/20 rounded-full h-2.5 overflow-hidden w-full">
                  <div
                    id="p2hp"
                    className="h-full rounded-full bg-green-400"
                    style={{ width: "100%", transition: "width 0.5s ease,background-color 0.3s" }}
                  />
                </div>
              </div>
              <div className="relative">
                <img
                  src={p2Img ?? ""}
                  className="w-28 h-28 object-contain drop-shadow-2xl"
                  style={{ transform: "scaleX(-1)" }}
                  alt={p2.koName}
                />
                <div
                  id="p2hit"
                  className="absolute inset-0 flex items-center justify-center text-4xl opacity-0 pointer-events-none select-none"
                />
              </div>
            </div>
          </div>

          <div className="relative h-9 flex items-center justify-center overflow-visible">
            <span
              id="sparktext"
              className="font-black text-2xl opacity-0 drop-shadow-lg select-none"
            />
          </div>

          <div
            id="blog"
            className="text-center text-white/90 text-sm font-bold min-h-[22px] bg-black/40 rounded-xl py-2 px-3 backdrop-blur-sm"
          />
        </div>

        {/* 결과 오버레이 */}
        <div
          id="bresult"
          className="absolute inset-0 z-30 flex-col items-center justify-center rounded-3xl px-6"
          style={{ display: "none", background: "rgba(0,0,0,0.87)" }}
        >
          <div className="text-5xl mb-1 animate-bounce">🏆</div>
          <img
            src={wImg ?? ""}
            className="w-36 h-36 object-contain drop-shadow-2xl"
            style={{ animation: "victoryBounce 0.55s ease-in-out infinite alternate" }}
            alt={winner.koName}
          />
          <div className="text-white font-black text-2xl mt-3 text-center">
            🏆 {winner.koName}
            {josa(winner.koName, "이", "가")} 승리했다!
          </div>
          <div className="text-white/70 text-sm mt-2 text-center">
            {loser.koName}
            {josa(loser.koName, "은", "는")}{" "}
            <span className="text-yellow-300 font-black">{winnerMove}</span>{" "}
            때문에 패배했다
          </div>
          <button
            onClick={onClose}
            className="mt-6 px-8 py-3 bg-amber-400 hover:bg-amber-500 text-white rounded-full font-black text-lg shadow-lg transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
