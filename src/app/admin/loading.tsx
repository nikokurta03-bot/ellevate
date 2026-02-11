export default function AdminLoading() {
  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto pt-24">
      {/* Header skeleton */}
      <div className="mb-6 sm:mb-8">
        <div className="h-8 w-72 bg-white/5 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-64 bg-white/5 rounded-lg animate-pulse" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass-card">
            <div className="h-4 w-32 bg-white/5 rounded animate-pulse mb-2" />
            <div className="h-10 w-16 bg-white/5 rounded animate-pulse mb-4" />
            <div className="h-3 w-40 bg-white/5 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Schedule skeleton */}
      <div className="h-6 w-48 bg-white/5 rounded animate-pulse mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass-card h-40 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
