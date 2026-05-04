import { useState, useEffect } from "react";
import { books as booksApi, children as childrenApi, lessonBooks as childBooksApi } from "@/lib/supabaseClient";
import { Plus, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

const STATUSES = ["All", "reading", "finished"];

export default function Books() {
  const [books, setBooks] = useState([]);
  const [children, setChildren] = useState([]);
  const [childBooks, setChildBooks] = useState([]); // hs_child_books rows
  const [filter, setFilter] = useState("All");
  const [childFilter, setChildFilter] = useState("All");
  const [expanded, setExpanded] = useState({});
  const [form, setForm] = useState({ title: "", child_id: "", status: "reading" });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const [booksData, childrenData, childBooksData] = await Promise.all([
      booksApi.list(),
      childrenApi.list(),
      childBooksApi.list(),
    ]);
    setBooks(booksData);
    setChildren(childrenData);
    setChildBooks(childBooksData);
    if (childrenData.length > 0 && !form.child_id) {
      setForm(f => ({ ...f, child_id: childrenData[0].id }));
    }
    setLoading(false);
  };

  const addBook = async () => {
    if (!form.title.trim() || !form.child_id) return;
    const newBook = await booksApi.create({ title: form.title.trim(), active: true });
    if (newBook?.id) {
      await childBooksApi.create({
        child_id: form.child_id,
        book_id: newBook.id,
        status: form.status,
        started_at: new Date().toISOString(),
      });
    }
    setForm(f => ({ ...f, title: "" }));
    loadAll();
  };

  const cycleStatus = async (childBook) => {
    const next = childBook.status === "reading" ? "finished" : "reading";
    const updates = next === "finished"
      ? { status: next, finished_at: new Date().toISOString() }
      : { status: next, finished_at: null };
    await childBooksApi.create({ ...childBook, ...updates }); // use update if available, else re-create
    loadAll();
  };

  const updateBookNotes = async (bookId, notes) => {
    await booksApi.update(bookId, { notes });
    loadAll();
  };

  // Build a joined view: for each child_book, attach book + child details
  const rows = childBooks.map(cb => {
    const book = books.find(b => b.id === cb.book_id);
    const child = children.find(c => c.id === cb.child_id);
    return book && child ? { ...cb, book, child } : null;
  }).filter(Boolean);

  const filtered = rows.filter(r => {
    const statusMatch = filter === "All" || r.status === filter;
    const childMatch = childFilter === "All" || r.child_id === childFilter;
    return statusMatch && childMatch;
  });

  const statsFor = (childId) => ({
    reading: childBooks.filter(cb => cb.child_id === childId && cb.status === "reading").length,
    finished: childBooks.filter(cb => cb.child_id === childId && cb.status === "finished").length,
  });

  return (
    <div className="px-6 py-5 max-w-3xl">
      <h1 className="text-xl font-semibold text-foreground mb-5">Books</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {children.map(child => {
          const s = statsFor(child.id);
          return (
            <div key={child.id} className="bg-white border border-border rounded-md px-4 py-3">
              <div className="text-xs text-muted-foreground">{child.name}</div>
              <div className="text-lg font-semibold">{s.reading} reading</div>
              <div className="text-xs text-muted-foreground">{s.finished} finished</div>
            </div>
          );
        })}
        <div className="bg-white border border-border rounded-md px-4 py-3">
          <div className="text-xs text-muted-foreground">All time</div>
          <div className="text-lg font-semibold">{childBooks.length} entries</div>
          <div className="text-xs text-muted-foreground">{childBooks.filter(cb => cb.status === "finished").length} finished</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Child:</span>
        <button
          onClick={() => setChildFilter("All")}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${childFilter === "All" ? "bg-[#534AB7] text-white border-[#534AB7]" : "border-border text-muted-foreground hover:bg-muted"}`}
        >All</button>
        {children.map(c => (
          <button
            key={c.id}
            onClick={() => setChildFilter(c.id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${childFilter === c.id ? "bg-[#534AB7] text-white border-[#534AB7]" : "border-border text-muted-foreground hover:bg-muted"}`}
          >{c.name}</button>
        ))}
      </div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs text-muted-foreground">Status:</span>
        {STATUSES.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filter === f ? "bg-[#534AB7] text-white border-[#534AB7]" : "border-border text-muted-foreground hover:bg-muted"}`}
          >{f}</button>
        ))}
      </div>

      {/* Book list */}
      <div className="space-y-1.5 mb-6">
        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {filtered.map(row => (
          <div key={`${row.child_id}-${row.book_id}`} className="bg-white border border-border rounded-md overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: row.child.color_hex || "#888" }}
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground">{row.book.title}</span>
                {row.book.author && (
                  <div className="text-xs text-muted-foreground">{row.book.author}</div>
                )}
                <div className="text-xs text-muted-foreground mt-0.5">{row.child.name}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.status === "finished" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                {row.status}
              </span>
              <button onClick={() => cycleStatus(row)} className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setExpanded(p => ({ ...p, [`${row.child_id}-${row.book_id}`]: !p[`${row.child_id}-${row.book_id}`] }))} className="p-1.5 text-muted-foreground hover:text-foreground">
                {expanded[`${row.child_id}-${row.book_id}`] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
            {expanded[`${row.child_id}-${row.book_id}`] && (
              <div className="px-4 pb-3 pt-0 border-t border-border bg-muted/20 space-y-2">
                <textarea
                  placeholder="Add a note..."
                  defaultValue={row.book.notes || ""}
                  onBlur={e => updateBookNotes(row.book_id, e.target.value)}
                  className="w-full text-xs bg-white border border-border rounded px-2.5 py-2 resize-none min-h-[48px] outline-none focus:border-[#534AB7] mt-2"
                />
              </div>
            )}
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">No books here yet.</p>
        )}
      </div>

      {/* Add book form */}
      <div className="bg-white border border-border rounded-md p-4">
        <div className="text-xs font-medium text-muted-foreground mb-3">Add a book</div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="col-span-2">
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Book title"
              className="w-full border border-border rounded px-3 py-2 text-sm outline-none focus:border-[#534AB7]"
            />
          </div>
          <select
            value={form.child_id}
            onChange={e => setForm(f => ({ ...f, child_id: e.target.value }))}
            className="border border-border rounded px-3 py-2 text-sm outline-none focus:border-[#534AB7]"
          >
            {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            className="border border-border rounded px-3 py-2 text-sm outline-none focus:border-[#534AB7]"
          >
            <option value="reading">Reading</option>
            <option value="finished">Finished</option>
          </select>
        </div>
        <button
          onClick={addBook}
          disabled={!form.title.trim()}
          className="flex items-center gap-1.5 text-sm bg-[#534AB7] text-white px-4 py-2 rounded-md hover:bg-[#4340a0] disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" /> Add book
        </button>
      </div>
    </div>
  );
}