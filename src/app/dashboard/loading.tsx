export default function DashboardLoading() {
  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto pt-24">
      {/* Header skeleton */}
      <div className="mb-6 sm:mb-12">
        <div className="h-8 w-64 bg-white/5 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-96 bg-white/5 rounded-lg animate-pulse" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {[0, 1, 2].map((col) => (
          <div key={col} className="space-y-3 sm:space-y-6">
            <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
            {[0, 1, 2].map((row) => (
              <div key={row} className="h-32 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
