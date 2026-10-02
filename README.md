# 포켓몬 도감

1~4세대(721마리) 포켓몬을 조회하고, 포켓몬끼리 배틀 승률을 계산해 보는 웹 앱입니다.
모바일에서도 끊기지 않도록 **데이터 로딩 방식**과 **무거운 계산의 위치**에 신경 썼습니다.

## 데모

> [pokemon-three-kappa-54.vercel.app](https://pokemon-three-kappa-54.vercel.app)

## 기술 스택

| 분류 | 사용 기술 |
| --- | --- |
| 프레임워크 | Next.js 16 (App Router) |
| UI | React 19, React Compiler |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS v4 |
| 데이터 | [PokéAPI](https://pokeapi.co/) |

## 주요 기능

- **포켓몬 도감** — 721마리 조회, 한국어 이름 표시
- **필터링** — 희귀도(전설/환상), 타입별 필터
- **페이지네이션** — 번호 페이지 이동
- **상세 모달** — 선택한 포켓몬의 전체 대상 배틀 승률, 간신히 이기는/지는 TOP3
- **1:1 배틀 모드** — 포켓몬 2마리를 골라 애니메이션으로 배틀 결과 확인

## 구현 포인트

### 점진적 로딩 (배치 Fetching)

721마리를 한꺼번에 요청하면 모바일 네트워크가 마비됩니다. 50개씩 배치로 나눠 요청하고,
**도착한 카드부터 화면에 채웁니다**(로딩 중에는 스켈레톤 카드). 컴포넌트가 사라지면 취소 플래그로 남은 요청을 중단합니다.

```typescript
for (let i = 0; i < pokemonNames.length; i += BATCH_SIZE) {
  if (cancelled) break;
  const batch = pokemonNames.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(async (name, batchIndex) => { /* ... */ }));
}
```

### 요청 줄이기와 폼 포켓몬 처리

한 마리당 `pokemon`과 `pokemon-species` 두 번을 호출해야 하는데, 순서대로 부르면 대기 시간이 두 배가 됩니다.
종 이름이 포켓몬 이름과 같은 경우가 대부분이라, **두 요청을 동시에 시작**합니다.

`deoxys-normal`, `keldeo-ordinary` 같은 폼 이름은 `/pokemon-species/{폼이름}`이 404입니다.
이때만 포켓몬 데이터의 `species.name`(베이스 종 이름)으로 다시 요청합니다.

```typescript
const [pokemon, speculativeLegend] = await Promise.all([
  getPokemon(name),
  getPokemonLegend(name).catch(() => null),
]);
// 추측이 실패한 경우(폼 포켓몬 등)에만 올바른 species name으로 재시도
const legend = speculativeLegend ?? (await getPokemonLegend(pokemon.species.name));
```

### Web Worker로 배틀 계산 분리

승률 계산(720마리 × 30회 시뮬레이션)을 메인 스레드에서 돌리면 모바일에서 화면이 멈춥니다.
Web Worker로 분리해 모달은 즉시 보여주고, 계산은 백그라운드에서 처리합니다.

```typescript
// utils/battleWorker.ts
self.onmessage = (e) => {
  const { selected, allPokemons } = e.data;
  try {
    self.postMessage({ result: calcBattleRanking(selected, allPokemons) });
  } catch {
    self.postMessage({ result: null }); // 실패해도 UI가 멈추지 않도록
  }
};
```

### 배틀 시뮬레이션

레벨 50 기준 공식을 사용합니다. 공격·특수공격 중 유리한 쪽을 고르고, 자속 보정(STAB 1.5배),
타입 상성(`typeChart.ts`), 급소(약 4.17%), 난수(85~100%)를 반영합니다.
양쪽 타입에 대해 가장 효과가 큰 공격 타입을 자동으로 선택합니다.

### 렌더링 최적화

- React Compiler 활성화
- 카드는 `memo`, 목록 계산은 `useMemo`/`useCallback`으로 불필요한 재렌더링 방지
- 이미지 `loading="lazy"`
- 배틀 애니메이션은 훅(`useBattleAnimation`)으로 분리하고, 언마운트 시 타이머를 모두 정리

## 프로젝트 구조

```
src/
├── app/                      # 라우트, 전역 스타일
├── api/
│   └── fetcher.ts            # PokéAPI 호출
├── components/
│   ├── PokemonGrid.tsx       # 목록, 필터, 배틀 모드 조립
│   ├── PokemonCard.tsx       # 카드 (memo)
│   ├── SkeletonCard.tsx      # 로딩 자리표시자
│   ├── Pagination.tsx
│   ├── PokemonModal.tsx      # 상세 모달 (Worker 연동)
│   ├── BattleModal.tsx       # 1:1 배틀 결과
│   └── BattleModalAnimation.ts   # 배틀 애니메이션 훅
├── hooks/
│   ├── usePokemonList.ts     # 배치 로딩
│   ├── useFilteredPokemons.ts
│   └── useBattleMode.ts      # 2마리 선택 흐름
├── utils/
│   ├── battleWorker.ts       # 배틀 계산 Worker
│   ├── calWinRate.ts         # 승률 시뮬레이션
│   ├── battleLogic.ts        # 승자 판정
│   ├── typeChart.ts          # 타입 상성표
│   └── typeColor.ts          # 타입별 색상
├── constants/                # 필터 옵션, 타입 한글명
└── types/                    # 타입 정의
```

## 실행

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm start
```
