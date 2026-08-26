export default function Loading() {
    return (
        <div className="space-y-4" role="status" aria-busy="true">
            <div className="h-7 w-48 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-72 max-w-full bg-slate-200 rounded animate-pulse" />
            <div className="bg-white rounded-2xl border border-app overflow-hidden">
                <div className="p-4 flex flex-col sm:flex-row gap-2 animate-pulse">
                    <div className="h-9 w-full sm:w-64 bg-slate-200 rounded-lg" />
                    <div className="h-9 w-36 bg-slate-200 rounded-lg" />
                    <div className="h-9 w-28 bg-slate-200 rounded-lg" />
                </div>
                <div className="h-10 bg-slate-100 animate-pulse" />
                {Array.from({ length:5 }).map((_, i) => (
                    <div key={i} className="h-12 border-t border-app flex items-center gap-4 px-4 animate-pulse">
                        <div className="h-3.5 w-1/3 bg-slate-200 rounded" />
                        <div className="h-3.5 w-1/4 bg-slate-200 rounded" />
                        <div className="h-3.5 w-1/6 bg-slate-200 rounded" />
                    </div>
                ))}
            </div>
            <span className="sr-only">Memuat data...</span>
        </div>
    );
}