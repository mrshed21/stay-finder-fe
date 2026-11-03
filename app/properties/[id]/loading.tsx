export default function LoadingProperty() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
      <div className="glass flex items-center gap-3 p-6">
        <span aria-hidden="true" className="size-3 rounded-full bg-accent motion-safe:animate-pulse" />
        <p role="status" className="text-muted">Loading stay…</p>
      </div>
    </main>
  );
}
