"use client";

import { useEffect, useRef } from "react";
import type { PokemonCardData } from "@/types/pokemon";

export function useBattleAnimation(
  p1: PokemonCardData,
  p2: PokemonCardData,
  p1Wins: boolean,
) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const arena = container.querySelector("#battle-arena") as HTMLElement;
    const flash = container.querySelector("#bflash") as HTMLElement;
    const tint = container.querySelector("#btint") as HTMLElement;
    const p1El = container.querySelector("#p1fighter") as HTMLElement;
    const p2El = container.querySelector("#p2fighter") as HTMLElement;
    const p1Hp = container.querySelector("#p1hp") as HTMLElement;
    const p2Hp = container.querySelector("#p2hp") as HTMLElement;
    const p1Hit = container.querySelector("#p1hit") as HTMLElement;
    const p2Hit = container.querySelector("#p2hit") as HTMLElement;
    const spark = container.querySelector("#sparktext") as HTMLElement;
    const blog = container.querySelector("#blog") as HTMLElement;
    const vsEl = container.querySelector("#vsel") as HTMLElement;
    const result = container.querySelector("#bresult") as HTMLElement;

    const loserEl = p1Wins ? p2El : p1El;
    const loserHit = p1Wins ? p2Hit : p1Hit;

    let hp1 = 100,
      hp2 = 100;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const t = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };

    function setHp(el: HTMLElement, pct: number) {
      const v = Math.max(0, pct);
      el.style.width = v + "%";
      if (v < 50) el.style.backgroundColor = "#facc15";
      if (v < 20) el.style.backgroundColor = "#ef4444";
    }

    function doFlash(opacity = 0.75) {
      flash.style.opacity = String(opacity);
      setTimeout(() => (flash.style.opacity = "0"), 140);
    }

    function doTint(color: string, opacity = 0.35) {
      tint.style.background = color;
      tint.style.opacity = String(opacity);
      setTimeout(() => (tint.style.opacity = "0"), 260);
    }

    function shake(el: HTMLElement, ms = 320) {
      el.style.animation = "none";
      requestAnimationFrame(() => {
        el.style.animation = `battleShake ${ms}ms ease-in-out`;
        setTimeout(() => (el.style.animation = ""), ms);
      });
    }

    function shakeArena(ms = 450) {
      arena.style.animation = "none";
      requestAnimationFrame(() => {
        arena.style.animation = `screenShake ${ms}ms ease-in-out`;
        setTimeout(() => (arena.style.animation = ""), ms);
      });
    }

    function showHit(el: HTMLElement, emoji: string) {
      el.textContent = emoji;
      el.style.animation = "none";
      el.style.opacity = "1";
      requestAnimationFrame(() => {
        el.style.animation = "hitFade 0.65s ease-out forwards";
        setTimeout(() => {
          el.style.opacity = "0";
          el.style.animation = "";
        }, 650);
      });
    }

    function showSpark(text: string, color = "#facc15") {
      spark.textContent = text;
      spark.style.color = color;
      spark.style.animation = "none";
      spark.style.opacity = "1";
      requestAnimationFrame(() => {
        spark.style.animation = "sparkPop 0.55s ease-out forwards";
        setTimeout(() => {
          spark.style.opacity = "0";
          spark.style.animation = "";
        }, 550);
      });
    }

    function spawnParticles(emojis: string[], count = 5) {
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          const el = document.createElement("div");
          el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
          el.style.cssText = `
            position:absolute;font-size:${14 + Math.floor(Math.random() * 14)}px;
            left:${15 + Math.floor(Math.random() * 70)}%;
            top:${35 + Math.floor(Math.random() * 35)}%;
            pointer-events:none;z-index:25;
            animation:particleFly 0.85s ease-out forwards;
          `;
          arena.appendChild(el);
          setTimeout(() => el.remove(), 850);
        }, i * 80);
      }
    }

    function chargeP1() {
      p1El.style.animation = "none";
      requestAnimationFrame(() => {
        p1El.style.animation = "chargeRight 0.35s ease-in-out";
        setTimeout(() => (p1El.style.animation = ""), 350);
      });
    }

    function chargeP2() {
      p2El.style.animation = "none";
      requestAnimationFrame(() => {
        p2El.style.animation = "chargeLeft 0.35s ease-in-out";
        setTimeout(() => (p2El.style.animation = ""), 350);
      });
    }

    function log(text: string) {
      blog.textContent = text;
    }

    log("배틀 시작!");
    shake(p1El, 250);
    shake(p2El, 250);
    showSpark("GO!", "#86efac");

    t(() => {
      log(`${p1.koName}의 공격!`);
      chargeP1();
      showSpark("⚡", "#facc15");
      spawnParticles(["⚡", "✨"], 4);
    }, 600);
    t(() => {
      doFlash(0.55);
      shake(p2El);
      showHit(p2Hit, "💥");
      hp2 -= 22;
      setHp(p2Hp, hp2);
    }, 760);

    t(() => {
      log(`${p2.koName}의 반격!`);
      chargeP2();
      showSpark("✨", "#c084fc");
      spawnParticles(["✨", "💫"], 4);
    }, 1200);
    t(() => {
      doFlash(0.55);
      shake(p1El);
      showHit(p1Hit, "💥");
      hp1 -= 18;
      setHp(p1Hp, hp1);
    }, 1360);

    t(() => {
      log("격렬한 싸움!");
      shakeArena(550);
      doFlash(0.4);
      doTint("rgba(255,100,50,0.5)", 0.3);
      showSpark("💥💫💥", "#fb923c");
      spawnParticles(["💥", "⭐", "✨", "🌟"], 7);
      vsEl.style.animation = "vsPulse 0.3s ease-in-out 3";
      setTimeout(() => (vsEl.style.animation = ""), 900);
    }, 1750);

    t(() => {
      log(`${p1.koName}의 연속 공격!`);
      chargeP1();
      showSpark("🔥", "#f97316");
      spawnParticles(["🔥", "💥"], 5);
    }, 2200);
    t(() => {
      doFlash(0.65);
      shakeArena(300);
      showHit(p2Hit, "💥");
      shake(p2El, 400);
      hp2 -= p1Wins ? 20 : 10;
      setHp(p2Hp, hp2);
    }, 2360);

    t(() => {
      log(`${p2.koName}도 지지 않는다!`);
      chargeP2();
      showSpark("⭐", "#fbbf24");
      spawnParticles(["⭐", "💫"], 5);
    }, 2700);
    t(() => {
      doFlash(0.65);
      shakeArena(300);
      showHit(p1Hit, "💥");
      shake(p1El, 400);
      hp1 -= p1Wins ? 10 : 20;
      setHp(p1Hp, hp1);
    }, 2860);

    t(() => {
      log("결전의 순간!");
      shakeArena(650);
      doFlash(0.8);
      doTint("rgba(255,50,50,0.5)", 0.4);
      spawnParticles(["💥", "⚡", "🔥", "✨", "💫", "⭐"], 10);
      showSpark("⚡💥⚡", "#facc15");
    }, 3150);

    t(() => {
      log(`${p1Wins ? p1.koName : p2.koName}의 결정타!`);
      if (p1Wins) chargeP1();
      else chargeP2();
      showSpark("💥💥", "#ef4444");
      spawnParticles(["💥", "⭐", "🌟"], 6);
    }, 3600);
    t(() => {
      doFlash(0.95);
      shakeArena(700);
      showHit(loserHit, "💥");
      shake(loserEl, 500);
      if (p1Wins) {
        hp2 = Math.min(hp2, 14);
        setHp(p2Hp, hp2);
      } else {
        hp1 = Math.min(hp1, 14);
        setHp(p1Hp, hp1);
      }
    }, 3760);

    t(() => {
      log(`${p1Wins ? p2.koName : p1.koName}은(는) 쓰러졌다!`);
      doFlash(0.7);
      spawnParticles(["⭐", "💫", "✨"], 8);
      if (p1Wins) {
        hp2 = 0;
        setHp(p2Hp, 0);
      } else {
        hp1 = 0;
        setHp(p1Hp, 0);
      }
      loserEl.style.transition = "transform 0.7s ease-in, opacity 0.7s ease-in";
      loserEl.style.transform = "rotate(80deg) translateY(24px)";
      loserEl.style.opacity = "0.2";
    }, 4100);

    t(() => {
      result.style.display = "flex";
      result.style.animation = "fadeInResult 0.5s ease-out";
    }, 5000);

    return () => timers.forEach(clearTimeout);
  }, [p1, p2, p1Wins]);

  return containerRef;
}
