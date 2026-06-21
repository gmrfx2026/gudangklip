export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#2a2a50] border-t-[#6c63ff]" />
        <p className="text-sm text-[#a0a0c0]">Memuat...</p>
      </div>
    </div>
  );
}
