import type { PokemonCardData } from "../types/pokemon";
import { simulateOnce } from "../utils/calWinRate";

const TYPE_MOVES: Record<string, string> = {
  fire: "불꽃방사",
  water: "파도타기",
  grass: "솔라빔",
  electric: "10만볼트",
  psychic: "사이코키네시스",
  dragon: "용의파동",
  normal: "몸통박치기",
  poison: "독침봉",
  ground: "지진",
  rock: "스톤샤워",
  ice: "냉동빔",
  fighting: "격투기",
  bug: "벌레먹음",
  ghost: "섀도볼",
  dark: "악의파동",
  steel: "아이언테일",
  fairy: "문포스",
  flying: "회오리바람",
};

function josa(name: string, con: string, vow: string): string {
  const code = name.charCodeAt(name.length - 1);
  if (code < 0xac00 || code > 0xd7a3) return con;
  return (code - 0xac00) % 28 !== 0 ? con : vow;
}

function getMove(p: PokemonCardData): string {
  for (const t of p.pokemon.types) {
    if (TYPE_MOVES[t.type.name]) return TYPE_MOVES[t.type.name];
  }
  return "몸통박치기";
}

// 타입 상성 포함 시뮬레이션 10회 다수결로 승패 결정
function decidewinner(p1: PokemonCardData, p2: PokemonCardData): boolean {
  let p1Wins = 0;
  for (let i = 0; i < 10; i++) {
    if (simulateOnce(p1.pokemon, p2.pokemon)) p1Wins++;
  }
  return p1Wins >= 5;
}

function makeAudience(): string {
  return Array.from({ length: 14 }, () => {
    const w = 12 + Math.floor(Math.random() * 10);
    const h = 18 + Math.floor(Math.random() * 22);
    const op = (4 + Math.floor(Math.random() * 5)) * 10;
    const mb = Math.floor(Math.random() * 8);
    return `<div style="width:${w}px;height:${h}px;background:rgba(255,255,255,0.${op});border-radius:8px 8px 0 0;margin-bottom:${mb}px;flex-shrink:0;"></div>`;
  }).join("");
}

export function openBattleModal(p1: PokemonCardData, p2: PokemonCardData) {
  document.getElementById("battle-modal")?.remove();

  const p1Wins = decidewinner(p1, p2);

  const winner = p1Wins ? p1 : p2;
  const loser = p1Wins ? p2 : p1;
  const winnerMove = getMove(winner);

  const winText = `🏆 ${winner.koName}${josa(winner.koName, "이", "가")} 승리했다!`;
  const loseText = `${loser.koName}${josa(loser.koName, "은", "는")} <span class="text-yellow-300 font-black">${winnerMove}</span> 때문에 패배했다`;

  const p1Img = p1.pokemon.sprites.other["official-artwork"].front_default ?? p1.pokemon.sprites.front_default;
  const p2Img = p2.pokemon.sprites.other["official-artwork"].front_default ?? p2.pokemon.sprites.front_default;
  const wImg = winner.pokemon.sprites.other["official-artwork"].front_default ?? winner.pokemon.sprites.front_default;

  const modal = document.createElement("div");
  modal.id = "battle-modal";
  modal.className = "fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3";

  modal.innerHTML = `
    <div id="battle-arena" class="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
      style="min-height:460px;
             background: linear-gradient(180deg,
               #080814 0%, #0d0d2a 30%, #18103a 34%,
               #8b6420 34%, #c49a30 42%, #a07820 52%,
               #7a5c10 70%, #5a4008 100%);">

      <!-- Ceiling lights -->
      <div class="absolute top-0 left-0 right-0 flex justify-around items-start pointer-events-none"
           style="height:33%;padding-top:10px;">
        ${Array.from({length:6},(_,i)=>`
          <div style="display:flex;flex-direction:column;align-items:center;gap:0;">
            <div style="width:6px;height:${28+i%3*10}px;background:linear-gradient(180deg,rgba(255,232,120,0.85),transparent);"></div>
            <div style="width:14px;height:14px;background:rgba(255,230,100,0.9);border-radius:50%;box-shadow:0 0 12px 6px rgba(255,220,80,0.4);"></div>
          </div>`).join("")}
      </div>

      <!-- Audience silhouettes -->
      <div class="absolute left-0 right-0 flex justify-around items-end pointer-events-none"
           style="top:0;height:33%;padding-bottom:2px;">
        ${makeAudience()}
      </div>

      <!-- Floor lines -->
      <div class="absolute bottom-0 left-0 right-0 pointer-events-none"
           style="height:66%;
                  background: repeating-linear-gradient(90deg,
                    transparent,transparent 50px,
                    rgba(255,255,255,0.055) 50px,rgba(255,255,255,0.055) 52px);"></div>

      <!-- Center court line -->
      <div class="absolute pointer-events-none"
           style="bottom:0;top:34%;left:50%;width:3px;
                  background:rgba(255,255,255,0.13);transform:translateX(-50%);"></div>

      <!-- White flash overlay -->
      <div id="bflash" class="absolute inset-0 bg-white opacity-0 pointer-events-none z-20"
           style="transition:opacity 0.12s;"></div>

      <!-- Color tint overlay -->
      <div id="btint" class="absolute inset-0 opacity-0 pointer-events-none z-20"
           style="transition:opacity 0.2s;"></div>

      <!-- Main content -->
      <div id="battle-content" class="relative z-10 p-5 pt-4">

        <!-- Header -->
        <div class="text-center mb-2">
          <span id="battle-title" class="text-white font-black text-xl tracking-widest drop-shadow-lg">⚔️ 배틀!</span>
        </div>

        <!-- Fighters row -->
        <div class="flex items-end justify-between px-2" style="min-height:210px;">

          <!-- P1 (left) -->
          <div id="p1fighter" class="flex flex-col items-center gap-2" style="flex:1;transform-origin:bottom center;">
            <div class="w-full max-w-[104px]">
              <div class="text-xs text-white/80 font-bold mb-1 truncate">${p1.koName}</div>
              <div class="bg-white/20 rounded-full h-2.5 overflow-hidden">
                <div id="p1hp" class="h-full rounded-full bg-green-400"
                     style="width:100%;transition:width 0.5s ease,background-color 0.3s;"></div>
              </div>
            </div>
            <div class="relative">
              <img id="p1img" src="${p1Img}" class="w-28 h-28 object-contain drop-shadow-2xl" />
              <div id="p1hit" class="absolute inset-0 flex items-center justify-center text-4xl opacity-0 pointer-events-none select-none"></div>
            </div>
          </div>

          <!-- VS -->
          <div id="vsel" class="text-white/50 font-black text-3xl self-center mx-1 shrink-0 select-none">VS</div>

          <!-- P2 (right) -->
          <div id="p2fighter" class="flex flex-col items-center gap-2" style="flex:1;transform-origin:bottom center;">
            <div class="w-full max-w-[104px] flex flex-col items-end">
              <div class="text-xs text-white/80 font-bold mb-1 truncate">${p2.koName}</div>
              <div class="bg-white/20 rounded-full h-2.5 overflow-hidden w-full">
                <div id="p2hp" class="h-full rounded-full bg-green-400"
                     style="width:100%;transition:width 0.5s ease,background-color 0.3s;"></div>
              </div>
            </div>
            <div class="relative">
              <img id="p2img" src="${p2Img}" class="w-28 h-28 object-contain drop-shadow-2xl"
                   style="transform:scaleX(-1);" />
              <div id="p2hit" class="absolute inset-0 flex items-center justify-center text-4xl opacity-0 pointer-events-none select-none"></div>
            </div>
          </div>
        </div>

        <!-- Spark display -->
        <div class="relative h-9 flex items-center justify-center overflow-visible">
          <span id="sparktext" class="font-black text-2xl opacity-0 drop-shadow-lg select-none"></span>
        </div>

        <!-- Battle log -->
        <div id="blog" class="text-center text-white/90 text-sm font-bold min-h-[22px]
             bg-black/40 rounded-xl py-2 px-3 backdrop-blur-sm"></div>
      </div>

      <!-- Result overlay (hidden until battle ends) -->
      <div id="bresult" class="absolute inset-0 z-30 flex-col items-center justify-center rounded-3xl px-6"
           style="display:none;background:rgba(0,0,0,0.87);">
        <div class="text-5xl mb-1 animate-bounce">🏆</div>
        <img src="${wImg}" class="w-36 h-36 object-contain drop-shadow-2xl"
             style="animation:victoryBounce 0.55s ease-in-out infinite alternate;" />
        <div class="text-white font-black text-2xl mt-3 text-center">${winText}</div>
        <div class="text-white/70 text-sm mt-2 text-center">${loseText}</div>
        <button id="bclose"
          class="mt-6 px-8 py-3 bg-amber-400 hover:bg-amber-500 text-white rounded-full font-black text-lg shadow-lg transition-colors">
          닫기
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.querySelector("#bclose")?.addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });

  runAnimation(modal, p1, p2, p1Wins);
}

function runAnimation(
  modal: HTMLElement,
  p1: PokemonCardData,
  p2: PokemonCardData,
  p1Wins: boolean,
) {
  const arena   = modal.querySelector("#battle-arena")   as HTMLElement;
  const flash   = modal.querySelector("#bflash")         as HTMLElement;
  const tint    = modal.querySelector("#btint")          as HTMLElement;
  const p1El    = modal.querySelector("#p1fighter")      as HTMLElement;
  const p2El    = modal.querySelector("#p2fighter")      as HTMLElement;
  const p1Hp    = modal.querySelector("#p1hp")           as HTMLElement;
  const p2Hp    = modal.querySelector("#p2hp")           as HTMLElement;
  const p1Hit   = modal.querySelector("#p1hit")          as HTMLElement;
  const p2Hit   = modal.querySelector("#p2hit")          as HTMLElement;
  const spark   = modal.querySelector("#sparktext")      as HTMLElement;
  const blog    = modal.querySelector("#blog")           as HTMLElement;
  const vsEl    = modal.querySelector("#vsel")           as HTMLElement;
  const result  = modal.querySelector("#bresult")        as HTMLElement;

  const loserEl  = p1Wins ? p2El  : p1El;
  const loserHit = p1Wins ? p2Hit : p1Hit;

  let hp1 = 100, hp2 = 100;

  // ─── helpers ────────────────────────────────────────────────
  function setHp(el: HTMLElement, pct: number) {
    const v = Math.max(0, pct);
    el.style.width = v + "%";
    if (v < 50) el.style.backgroundColor = "#facc15";
    if (v < 20) el.style.backgroundColor = "#ef4444";
  }

  function doFlash(opacity = 0.75) {
    flash.style.opacity = String(opacity);
    setTimeout(() => { flash.style.opacity = "0"; }, 140);
  }

  function doTint(color: string, opacity = 0.35) {
    tint.style.background = color;
    tint.style.opacity = String(opacity);
    setTimeout(() => { tint.style.opacity = "0"; }, 260);
  }

  function shake(el: HTMLElement, ms = 320) {
    el.style.animation = "none";
    requestAnimationFrame(() => {
      el.style.animation = `battleShake ${ms}ms ease-in-out`;
      setTimeout(() => { el.style.animation = ""; }, ms);
    });
  }

  function shakeArena(ms = 450) {
    arena.style.animation = "none";
    requestAnimationFrame(() => {
      arena.style.animation = `screenShake ${ms}ms ease-in-out`;
      setTimeout(() => { arena.style.animation = ""; }, ms);
    });
  }

  function showHit(el: HTMLElement, emoji: string) {
    el.textContent = emoji;
    el.style.animation = "none";
    el.style.opacity = "1";
    requestAnimationFrame(() => {
      el.style.animation = "hitFade 0.65s ease-out forwards";
      setTimeout(() => { el.style.opacity = "0"; el.style.animation = ""; }, 650);
    });
  }

  function showSpark(text: string, color = "#facc15") {
    spark.textContent = text;
    spark.style.color = color;
    spark.style.animation = "none";
    spark.style.opacity = "1";
    requestAnimationFrame(() => {
      spark.style.animation = "sparkPop 0.55s ease-out forwards";
      setTimeout(() => { spark.style.opacity = "0"; spark.style.animation = ""; }, 550);
    });
  }

  function spawnParticles(emojis: string[], count = 5) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const el = document.createElement("div");
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        el.textContent = emoji;
        el.style.cssText = `
          position:absolute;
          font-size:${14 + Math.floor(Math.random() * 14)}px;
          left:${15 + Math.floor(Math.random() * 70)}%;
          top:${35 + Math.floor(Math.random() * 35)}%;
          pointer-events:none;
          z-index:25;
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
      setTimeout(() => { p1El.style.animation = ""; }, 350);
    });
  }

  function chargeP2() {
    p2El.style.animation = "none";
    requestAnimationFrame(() => {
      p2El.style.animation = "chargeLeft 0.35s ease-in-out";
      setTimeout(() => { p2El.style.animation = ""; }, 350);
    });
  }

  function log(text: string) { blog.textContent = text; }

  // ─── sequence ───────────────────────────────────────────────
  // 0ms  — start
  log("배틀 시작!");
  shake(p1El, 250); shake(p2El, 250);
  showSpark("GO!", "#86efac");

  // 600ms — P1 attack
  setTimeout(() => {
    log(`${p1.koName}의 공격!`);
    chargeP1();
    showSpark("⚡", "#facc15");
    spawnParticles(["⚡","✨"], 4);
  }, 600);
  setTimeout(() => {
    doFlash(0.55); shake(p2El);
    showHit(p2Hit, "💥");
    hp2 -= 22; setHp(p2Hp, hp2);
  }, 760);

  // 1200ms — P2 counterattack
  setTimeout(() => {
    log(`${p2.koName}의 반격!`);
    chargeP2();
    showSpark("✨", "#c084fc");
    spawnParticles(["✨","💫"], 4);
  }, 1200);
  setTimeout(() => {
    doFlash(0.55); shake(p1El);
    showHit(p1Hit, "💥");
    hp1 -= 18; setHp(p1Hp, hp1);
  }, 1360);

  // 1750ms — screen shake clash
  setTimeout(() => {
    log("격렬한 싸움!");
    shakeArena(550);
    doFlash(0.4);
    doTint("rgba(255,100,50,0.5)", 0.3);
    showSpark("💥💫💥", "#fb923c");
    spawnParticles(["💥","⭐","✨","🌟"], 7);
    vsEl.style.animation = "vsPulse 0.3s ease-in-out 3";
    setTimeout(() => { vsEl.style.animation = ""; }, 900);
  }, 1750);

  // 2200ms — P1 heavy strike
  setTimeout(() => {
    log(`${p1.koName}의 연속 공격!`);
    chargeP1();
    showSpark("🔥", "#f97316");
    spawnParticles(["🔥","💥"], 5);
  }, 2200);
  setTimeout(() => {
    doFlash(0.65); shakeArena(300);
    showHit(p2Hit, "💥");
    shake(p2El, 400);
    const dmg = p1Wins ? 20 : 10;
    hp2 -= dmg; setHp(p2Hp, hp2);
  }, 2360);

  // 2700ms — P2 heavy strike
  setTimeout(() => {
    log(`${p2.koName}도 지지 않는다!`);
    chargeP2();
    showSpark("⭐", "#fbbf24");
    spawnParticles(["⭐","💫"], 5);
  }, 2700);
  setTimeout(() => {
    doFlash(0.65); shakeArena(300);
    showHit(p1Hit, "💥");
    shake(p1El, 400);
    const dmg = p1Wins ? 10 : 20;
    hp1 -= dmg; setHp(p1Hp, hp1);
  }, 2860);

  // 3150ms — big clash
  setTimeout(() => {
    log("결전의 순간!");
    shakeArena(650);
    doFlash(0.8);
    doTint("rgba(255,50,50,0.5)", 0.4);
    spawnParticles(["💥","⚡","🔥","✨","💫","⭐"], 10);
    showSpark("⚡💥⚡", "#facc15");
  }, 3150);

  // 3600ms — winner's decisive move
  setTimeout(() => {
    log(`${p1Wins ? p1.koName : p2.koName}의 결정타!`);
    if (p1Wins) chargeP1(); else chargeP2();
    showSpark("💥💥", "#ef4444");
    spawnParticles(["💥","⭐","🌟"], 6);
  }, 3600);
  setTimeout(() => {
    doFlash(0.95); shakeArena(700);
    showHit(loserHit, "💥");
    shake(loserEl, 500);
    if (p1Wins) { hp2 = Math.min(hp2, 14); setHp(p2Hp, hp2); }
    else        { hp1 = Math.min(hp1, 14); setHp(p1Hp, hp1); }
  }, 3760);

  // 4100ms — loser HP → 0
  setTimeout(() => {
    log(`${p1Wins ? p2.koName : p1.koName}은(는) 쓰러졌다!`);
    doFlash(0.7);
    spawnParticles(["⭐","💫","✨"], 8);
    if (p1Wins) { hp2 = 0; setHp(p2Hp, 0); }
    else        { hp1 = 0; setHp(p1Hp, 0); }
    loserEl.style.transition = "transform 0.7s ease-in, opacity 0.7s ease-in";
    loserEl.style.transform = "rotate(80deg) translateY(24px)";
    loserEl.style.opacity = "0.2";
  }, 4100);

  // 5000ms — show result
  setTimeout(() => {
    result.style.display = "flex";
    result.style.animation = "fadeInResult 0.5s ease-out";
  }, 5000);
}
