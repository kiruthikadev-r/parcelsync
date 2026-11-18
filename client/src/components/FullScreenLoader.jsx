export default function FullScreenLoader() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
    </div>
  );
}
