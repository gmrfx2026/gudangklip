export default function DashboardLoading() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col gap-6 p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[#1a1a3e]" />
        <div className="h-10 w-32 animate-pulse rounded-xl bg-[#1a1a3e]" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#2a2a50] bg-[#0d0d28]/50 p-5"
          >
            <div className="mb-3 h-4 w-20 animate-pulse rounded bg-[#1a1a3e]" />
            <div className="h-8 w-32 animate-pulse rounded bg-[#1a1a3e]" />
            <div className="mt-2 h-3 w-16 animate-pulse rounded bg-[#1a1a3e]" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="rounded-2xl border border-[#2a2a50] bg-[#0d0d28]/50 p-6">
        <div className="mb-4 h-6 w-40 animate-pulse rounded bg-[#1a1a3e]" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 w-full animate-pulse rounded-lg bg-[#1a1a3e]"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
