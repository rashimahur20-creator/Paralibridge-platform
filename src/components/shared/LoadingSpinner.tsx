export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf7]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-3 border-[#e8e5de] border-t-[#1a5c2e] rounded-full animate-spin" style={{ borderWidth: 3 }} />
        <p className="text-[#6b7280] text-sm font-body">Loading...</p>
      </div>
    </div>
  );
}
