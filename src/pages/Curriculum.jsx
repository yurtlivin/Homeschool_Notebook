import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import CurriculumColumn from "@/components/curriculum/CurriculumColumn";
import AddCurriculumModal from "@/components/curriculum/AddCurriculumModal";
import { Plus } from "lucide-react";

export default function Curriculum() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { loadBooks(); }, []);

  const loadBooks = async () => {
    setLoading(true);
    const data = await base44.entities.CurriculumBook.list("-created_date", 100);
    setBooks(data);
    setLoading(false);
  };

  const tigerlily = books.filter(b => b.kid === "Tigerlily");
  const rowen = books.filter(b => b.kid === "Rowen");
  const shared = books.filter(b => b.kid === "Both");

  return (
    <div className="px-6 py-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-foreground">Curriculum</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 text-sm bg-[#534AB7] text-white px-4 py-2 rounded-md hover:bg-[#4340a0] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add curriculum
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Loading...</div>
      ) : (
        <>
          {/* Two-column layout */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <CurriculumColumn kid="Tigerlily" books={tigerlily} onRefresh={loadBooks} />
            <CurriculumColumn kid="Rowen" books={rowen} onRefresh={loadBooks} />
          </div>

          {/* Shared curricula full-width */}
          {shared.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#854F0B]">Shared</span>
                <span className="text-sm font-medium text-foreground">Both kids</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {shared.map(book => (
                  <div key={book.id}>
                    <CurriculumColumn kid="Both" books={[book]} onRefresh={loadBooks} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showAdd && <AddCurriculumModal onClose={() => setShowAdd(false)} onAdded={loadBooks} />}
    </div>
  );
}