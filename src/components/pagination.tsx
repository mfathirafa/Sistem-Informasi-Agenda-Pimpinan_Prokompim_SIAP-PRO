'use client';

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  const windowStart = Math.max(1, page - 2);
  const windowEnd = Math.min(totalPages, page + 2);

  if (windowStart > 1) pages.push(1);
  if (windowStart > 2) pages.push('...');
  for (let i = windowStart; i <= windowEnd; i++) pages.push(i);
  if (windowEnd < totalPages - 1) pages.push('...');
  if (windowEnd < totalPages) pages.push(totalPages);

  return (
    <nav aria-label="Paginasi" className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Halaman sebelumnya"
        className="px-2.5 py-1 text-sm rounded border disabled:opacity-30 hover:bg-gray-100"
      >
        &laquo; Prev
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} className="px-1 text-gray-400">...</span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-label={`Halaman ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={`px-2.5 py-1 text-sm rounded ${p === page ? 'bg-blue-600 text-white' : 'border hover:bg-gray-100'}`}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Halaman berikutnya"
        className="px-2.5 py-1 text-sm rounded border disabled:opacity-30 hover:bg-gray-100"
      >
        Next &raquo;
      </button>
    </nav>
  );
}
