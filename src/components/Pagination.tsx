interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  const pages: (number | "...")[] = [];
  const start = Math.max(1, currentPage - 2);
  const end   = Math.min(totalPages, currentPage + 2);

  if (start > 1) { pages.push(1); if (start > 2) pages.push("..."); }
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages) { if (end < totalPages - 1) pages.push("..."); pages.push(totalPages); }

  return (
    <div className="flex justify-center flex-wrap gap-2 mt-8 mb-12">
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-2 rounded-full border-2 border-amber-200 text-amber-500 hover:bg-amber-100 min-w-[36px]"
        >‹</button>
      )}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e-${i}`} className="px-1 py-2 text-amber-400">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={
              p === currentPage
                ? "px-3 py-2 rounded-full bg-amber-400 text-white font-bold min-w-[36px]"
                : "px-3 py-2 rounded-full border-2 border-amber-200 text-amber-500 hover:bg-amber-100 min-w-[36px]"
            }
          >{p}</button>
        ),
      )}
      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-2 rounded-full border-2 border-amber-200 text-amber-500 hover:bg-amber-100 min-w-[36px]"
        >›</button>
      )}
    </div>
  );
}
