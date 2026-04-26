# 포켓몬 도감

TypeScript로 만든 포켓몬 도감 웹 앱. 1~4세대(721마리) 포켓몬 조회 및 배틀 승률 계산 기능을 제공합니다.

## 데모

> [pokemon-three-kappa-54.vercel.app](https://pokemon-three-kappa-54.vercel.app)

## 기술 스택

| 분류   | 사용 기술                      |
| ------ | ------------------------------ |
| 언어   | TypeScript                     |
| 번들러 | Vite                           |
| 스타일 | Tailwind CSS v4                |
| 데이터 | [PokéAPI](https://pokeapi.co/) |

## 주요 기능

- **포켓몬 도감** — 721마리 조회, 한국어 이름 표시
- **필터링** — 희귀도(전설/환상), 타입별 필터
- **페이지네이션** — 20개씩 번호 페이지 이동
- **배틀 승률** — 선택한 포켓몬의 전체 대상 승률 및 간신히 이기는/지는 TOP3

## 구현 포인트

### 배치 Fetching

721마리를 한꺼번에 요청하면 모바일에서 네트워크가 마비됩니다. 10개씩 순차 배치로 처리해 부하를 분산했습니다.

```typescript
for (let i = 0; i < list.results.length; i += BATCH_SIZE) {
  await Promise.all(batch.map(async (item) => { ... }));
}
```

### Web Worker

배틀 승률 계산(720명 × 30회 시뮬레이션)은 메인 스레드를 블로킹해 모바일에서 UI가 멈추는 원인이었습니다. Web Worker로 분리해 모달을 즉시 표시하고 계산은 백그라운드에서 처리합니다.

```typescript
const battleWorker = new Worker(
  new URL("../utils/battleWorker.ts", import.meta.url),
  { type: "module" },
);
```

### 폼 포켓몬 처리

PokéAPI 목록에 `deoxys-normal`, `keldeo-ordinary` 같은 폼 이름으로 등록된 포켓몬은 `/pokemon-species/{폼이름}` 요청 시 404가 발생합니다. 포켓몬 데이터의 `species.name`(베이스 종 이름)으로 요청해 해결했습니다.

```typescript
const pokemon = await getPokemon(item.name);
const legend = await getPokemonLegend(pokemon.species.name);
```

## 프로젝트 구조

```
src/
├── api/
│   └── fetcher.ts        # PokéAPI 호출
├── components/
│   ├── card.ts           # 포켓몬 카드
│   └── modal.ts          # 상세 모달 (Web Worker 연동)
├── utils/
│   ├── battleWorker.ts   # 배틀 계산 Worker
│   ├── calWinRate.ts     # 승률 시뮬레이션 로직
│   ├── typeChart.ts      # 타입 상성표
│   └── typeColor.ts      # 타입별 색상
├── types/
│   └── pokemon.ts        # 타입 정의
└── main.ts               # 진입점 (페이지네이션, 필터)
```

## 실행

```bash
npm install
npm run dev
```
