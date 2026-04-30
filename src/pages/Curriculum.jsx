import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Archive, RotateCcw } from "lucide-react";
import CurriculumCard from "@/components/curriculum/CurriculumCard";
import CurriculumOverview from "@/components/curriculum/CurriculumOverview";
import AddCurriculumModal from "@/components/curriculum/AddCurriculumModal.jsx";

export default function Curriculum() {
  const [books, setBooks] = useState([]);
  const [logEntries, setLogEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState(null);
  const [viewArchived, setViewArchived] = useState(false);

  useEffect(() => { loadAll(); }, [viewArchived]);

  const loadAll = async () => {
    setLoading(true);
    const [bks, logs] = await Promise.all([
      base44.entities.CurriculumBook.filter({ is_archived: viewArchived }, "-created_date", 100),
      base44.entities.LogEntry.list("-date", 500),
    ]);
    setBooks(bks);
    setLogEntries(logs);
    setLoading(false);
  };

  const restoreBook = async (id) => {
    await base44.entities.CurriculumBook.update(id, { is_archived: false });
    loadAll();
  };

  const tigerlily = books.filter(b => b.kid === "Tigerlily");
  const rowen = books.filter(b => b.kid === "Rowen");
  const shared = books.filter(b => b.kid === "Both");

  const selectedCurriculum = books.find(b => b.id === selectedCurriculumId) || null;
  const connectedLogs = selectedCurriculum
    ? logEntries.filter(e => e.curriculum_name === selectedCurriculum.name)
    : [];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main scrollable area */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-foreground">Curriculum</h1>
            <button
              onClick={() => { setViewArchived(v => !v); setSelectedCurriculumId(null); }}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-colors ${viewArchived ? "bg-amber-100 text-amber-700 border-amber-200" : "border-border text-muted-foreground hover:bg-muted"}`}
            >
              <Archive className="w-3 h-3" /> {viewArchived ? "Viewing archived" : "Archived"}
            </button>
          </div>
          {!viewArchived && (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 text-sm bg-[#534AB7] text-white px-4 py-2 rounded-md hover:bg-[#4340a0] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add curriculum
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground py-20 text-center">Loading...</div>
        ) : viewArchived ? (
          <div>
            <p className="text-xs text-muted-foreground mb-4">Archived curricula are hidden from the main view but their data is preserved.</p>
            {books.length === 0 ? (
              <p className="text-sm text-muted-foreground">No archived curricula.</p>
            ) : (
              <div className="space-y-2">
                {books.map(book => (
                  <div key={book.id} className="bg-white border border-border rounded-md px-4 py-3 flex items-center gap-3">
                    {book.cover_image && <img src={book.cover_image} alt="cover" className="w-8 h-10 object-cover rounded border border-border shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{book.name}</div>
                      <div className="text-xs text-muted-foreground">{book.subject} · {book.kid}</div>
                    </div>
                    <button
                      onClick={() => restoreBook(book.id)}
                      className="flex items-center gap-1.5 text-xs text-[#534AB7] border border-[#534AB7]/30 px-3 py-1.5 rounded hover:bg-[#EEEDFE] transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" /> Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Overview card */}
            <CurriculumOverview
              books={books}
              logEntries={logEntries}
              selectedCurriculumId={selectedCurriculumId}
              onSelectCurriculum={(id) => setSelectedCurriculumId(prev => prev === id ? null : id)}
            />

            {/* Kids grid */}
            <div className="grid grid-cols-2 gap-6 mt-6 mb-6">
              {/* Tigerlily */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EAF3DE] text-[#3B6D11]">Tigerlily</span>
                  <span className="text-xs text-muted-foreground">{tigerlily.length} curriculum{tigerlily.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="space-y-4">
                  {tigerlily.length === 0 && <p className="text-sm text-muted-foreground">No curriculum yet.</p>}
                  {tigerlily.map(book => (
                    <CurriculumCard key={book.id} book={book} logEntries={logEntries} onRefresh={loadAll} />
                  ))}
                </div>
              </div>

              {/* Rowen */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E6F1FB] text-[#0C447C]">Rowen</span>
                  <span className="text-xs text-muted-foreground">{rowen.length} curriculum{rowen.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="space-y-4">
                  {rowen.length === 0 && <p className="text-sm text-muted-foreground">No curriculum yet.</p>}
                  {rowen.map(book => (
                    <CurriculumCard key={book.id} book={book} logEntries={logEntries} onRefresh={loadAll} />
                  ))}
                </div>
              </div>
            </div>

            {/* Shared curricula */}
            {shared.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAEEDA] text-[#854F0B]">Shared — both kids</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {shared.map(book => (
                    <CurriculumCard key={book.id} book={book} logEntries={logEntries} onRefresh={loadAll} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Right panel: log connections */}
      {selectedCurriculum && (
        <div className="w-72 border-l border-border bg-[#FAFAF8] overflow-y-auto px-4 py-5 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold text-foreground">{selectedCurriculum.name}</div>
              <div className="text-xs text-muted-foreground">{connectedLogs.length} log entries</div>
            </div>
            <button onClick={() => setSelectedCurriculumId(null)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
          </div>
          {connectedLogs.length === 0 ? (
            <p className="text-xs text-muted-foreground">No log entries connected to this curriculum yet.</p>
          ) : (
            <div className="space-y-2">
              {connectedLogs.map(log => (
                <div key={log.id} className="bg-white border border-border rounded-md px-3 py-2">
                  <div className="text-xs text-muted-foreground mb-1">{log.date} · {log.kid}</div>
                  <p className="text-sm text-foreground">{log.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showAdd && <AddCurriculumModal onClose={() => setShowAdd(false)} onAdded={loadAll} />}
    </div>
  );
}