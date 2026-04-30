import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Archive, RotateCcw, ChevronLeft } from "lucide-react";
import { SUBJECT_COLORS } from "@/lib/constants";
import AddCurriculumModal from "@/components/curriculum/AddCurriculumModal";
import BookDetailPanel from "@/components/curriculum/BookDetailPanel";

export default function CurriculumPlanner() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [viewArchived, setViewArchived] = useState(false);

  useEffect(() => { loadBooks(); }, [viewArchived]);

  const loadBooks = async () => {
    setLoading(true);
    const bks = await base44.entities.CurriculumBook.filter({ is_archived: viewArchived }, "-created_date", 100);
    setBooks(bks);
    // refresh selected book if open
    if (selectedBook) {
      const updated = bks.find(b => b.id === selectedBook.id);
      setSelectedBook(updated || null);
    }
    setLoading(false);
  };

  const restoreBook = async (id) => {
    await base44.entities.CurriculumBook.update(id, { is_archived: false });
    loadBooks();
  };

  const tigerlily = books.filter(b => b.kid === "Tigerlily");
  const rowen = books.filter(b => b.kid === "Rowen");
  const shared = books.filter(b => b.kid === "Both");

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left sidebar: book list */}
      <div className="w-72 border-r border-border bg-[#FAFAF8] flex flex-col overflow-hidden shrink-0">
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-base font-semibold text-foreground">Curriculum Planner</h1>
          </div>
          <div className="flex gap-2">
            {!viewArchived && (
              <button
                onClick={() => setShowAdd(true)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-[#534AB7] text-white px-3 py-2 rounded-md hover:bg-[#4340a0]"
              >
                <Plus className="w-3 h-3" /> Add book
              </button>
            )}
            <button
              onClick={() => { setViewArchived(v => !v); setSelectedBook(null); }}
              className={`flex items-center gap-1 text-xs px-3 py-2 rounded-md border transition-colors ${viewArchived ? "bg-amber-100 text-amber-700 border-amber-200" : "border-border text-muted-foreground hover:bg-muted"}`}
            >
              <Archive className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {loading ? (
            <p className="text-xs text-muted-foreground text-center py-8">Loading...</p>
          ) : viewArchived ? (
            <div className="space-y-2">
              {books.length === 0 && <p className="text-xs text-muted-foreground">No archived books.</p>}
              {books.map(book => (
                <div key={book.id} className="bg-white border border-border rounded-md px-3 py-2 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{book.name}</div>
                    <div className="text-[10px] text-muted-foreground">{book.subject}</div>
                  </div>
                  <button onClick={() => restoreBook(book.id)} className="text-[#534AB7]">
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <>
              {tigerlily.length > 0 && (
                <BookGroup label="Tigerlily" color="#3B6D11" bg="#EAF3DE" books={tigerlily} selectedId={selectedBook?.id} onSelect={setSelectedBook} />
              )}
              {rowen.length > 0 && (
                <BookGroup label="Rowen" color="#0C447C" bg="#E6F1FB" books={rowen} selectedId={selectedBook?.id} onSelect={setSelectedBook} />
              )}
              {shared.length > 0 && (
                <BookGroup label="Both" color="#854F0B" bg="#FAEEDA" books={shared} selectedId={selectedBook?.id} onSelect={setSelectedBook} />
              )}
              {books.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">No curriculum books yet.</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right panel: book detail or empty state */}
      <div className="flex-1 overflow-hidden">
        {selectedBook ? (
          <BookDetailPanel
            key={selectedBook.id}
            book={selectedBook}
            onRefresh={loadBooks}
            onClose={() => setSelectedBook(null)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="text-4xl mb-4">📚</div>
            <div className="text-sm font-medium text-foreground mb-1">Select a curriculum book</div>
            <div className="text-xs text-muted-foreground">Click a book on the left to view details, manage units, plan assignments, and more.</div>
          </div>
        )}
      </div>

      {showAdd && <AddCurriculumModal onClose={() => setShowAdd(false)} onAdded={loadBooks} />}
    </div>
  );
}

function BookGroup({ label, color, bg, books, selectedId, onSelect }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: bg, color }}>
          {label}
        </span>
      </div>
      <div className="space-y-1">
        {books.map(book => {
          const units = book.units || [];
          const done = units.filter(u => u.completed).length;
          const pct = units.length > 0 ? Math.round((done / units.length) * 100) : 0;
          const subjectColor = SUBJECT_COLORS[book.subject] || "#534AB7";
          const isSelected = selectedId === book.id;
          return (
            <button
              key={book.id}
              onClick={() => onSelect(book)}
              className={`w-full text-left px-3 py-2.5 rounded-md border transition-colors ${isSelected ? "bg-[#EEEDFE] border-[#534AB7]/30" : "bg-white border-border hover:bg-muted/50"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: subjectColor }} />
                <span className="text-xs font-medium text-foreground truncate flex-1">{book.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: subjectColor }} />
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{done}/{units.length}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}