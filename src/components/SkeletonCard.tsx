export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-4 text-center shadow-md border border-amber-100 animate-pulse">
      <div className="w-24 h-24 mx-auto bg-amber-100 rounded-full mb-2" />
      <div className="h-4 bg-amber-100 rounded w-2/3 mx-auto mb-2" />
      <div className="h-3 bg-amber-50 rounded w-1/3 mx-auto" />
    </div>
  );
}
