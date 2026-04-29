import CurriculumCard from "./CurriculumCard";

export default function CurriculumColumn({ kid, books, onRefresh }) {
  const kidColors = {
    Tigerlily: { pill: "bg-[#EAF3DE] text-[#3B6D11]", label: "Tigerlily" },
    Rowen: { pill: "bg-[#E6F1FB] text-[#0C447C]", label: "Rowen" },
    Both: { pill: "bg-[#FAEEDA] text-[#854F0B]", label: "Both" },
  };
  const style = kidColors[kid] || kidColors.Both;

  return (
    <div>
      {kid !== "Both" && (
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${style.pill}`}>{style.label}</span>
          <span className="text-xs text-muted-foreground">{books.length} curriculum{books.length !== 1 ? "s" : ""}</span>
        </div>
      )}
      <div className="space-y-4">
        {books.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">No curriculum added yet.</p>
        )}
        {books.map(book => (
          <CurriculumCard key={book.id} book={book} onRefresh={onRefresh} />
        ))}
      </div>
    </div>
  );
}