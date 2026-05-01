export default function ClusterPhotosStrip({ photos, cluster }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Photos from this cluster</h3>
      <div className="grid grid-cols-6 gap-2">
        {photos.slice(0, 12).map(photo => (
          <img
            key={photo.id}
            src={photo.image_url}
            alt={photo.caption}
            className="w-full aspect-square object-cover rounded-lg border border-border hover:shadow-md transition-shadow cursor-pointer"
          />
        ))}
      </div>
      {photos.length > 12 && (
        <div className="text-xs text-muted-foreground">+{photos.length - 12} more photos</div>
      )}
    </div>
  );
}