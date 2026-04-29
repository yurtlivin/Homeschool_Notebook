import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/lib/userContext";
import { format } from "date-fns";
import { Plus, RotateCcw, ChevronDown, ChevronUp, Star } from "lucide-react";

const FILTERS = ["All", "Tigerlily", "Rowen", "Reading", "Finished"];

export default function Books() {
  const { activeUser } = useUser();
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState({});
  const [form, setForm] = useState({ title: "", kid: "Tigerlily", status: "reading", genre: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadBooks(); }, []);

  const loadBooks = async () => {
    setLoading(true);
    const data = await base44.entities.Book.list("-created_date", 200);
    setBooks(data);
    setLoading(false);
  };

  const addBook = async () => {
    if (!form.title.trim()) return;
    await base44.entities.Book.create({
      ...form,
      added_by: activeUser,
      date_added: format(new Date(), "yyyy-MM-dd"),
    });
    setForm({ title: "", kid: "Tigerlily", status: "reading", genre: "" });
    loadBooks();
  };

  const cycleStatus = async (book) => {
    const next = book.status === "reading" ? "finished" : "reading";
    await base44.entities.Book.update(book.id, { status: next });
    loadBooks();
  };

  const updateBook = async (id, changes) => {
    await base44.entities.Book.update(id, changes);
    loadBooks();
  };

  const filtered = books.filter(b => {
    if (filter === "All") return true;
    if (filter === "Tigerlily" || filter === "Rowen") return b.kid === filter;
    if (filter === "Reading") return b.status === "reading";
    if (filter === "Finished") return b.status === "finished";
    return true;
  });

  const tigerlily = books.filter(b => b.kid === "Tigerlily");
  const rowen = books.filter(b => b.kid === "Rowen");

  return (
    <div className="px-6 py-5 max-w-3xl">
      <h1 className="text-xl font-semibold text-foreground mb-5">Books</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white border border-border rounded-md px-4 py-3">
          <div className="text-xs text-muted-foreground">Tigerlily</div>
          <div className="text-lg font-semibold">{tigerlily.filter(b => b.status === "reading").length} reading</div>
          <div className="text-xs text-muted-foreground">{tigerlily.filter(b => b.status === "finished").length} finished</div>
        </div>
        <div className="bg-white border border-border rounded-md px-4 py-3">
          <div className="text-xs text-muted-foreground">Rowen</div>
          <div className="text-lg font-semibold">{rowen.filter(b => b.status === "reading").length} reading</div>
          <div className="text-xs text-muted-foreground">{rowen.filter(b => b.status === "finished").length} finished</div>
        </div>
        <div className="bg-white border border-border rounded-md px-4 py-3">
          <div className="text-xs text-muted-foreground">All time</div>
          <div className="text-lg font-semibold">{books.length} books</div>
          <div className="text-xs text-muted-foreground">{books.filter(b => b.status === "finished").length} finished</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filter === f ? "bg-[#534AB7] text-white border-[#534AB7]" : "border-border text-muted-foreground hover:bg-muted"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Book list */}
      <div className="space-y-1.5 mb-6">
        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {filtered.map(book => (
          <div key={book.id} className="bg-white border border-border rounded-md overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <span className={`w-2 h-2 rounded-full shrink-0 ${book.kid === "Tigerlily" ? "bg-green-500" : "bg-amber-500"}`} />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground">{book.title}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{book.kid}</span>
                  {book.genre && <span className="text-xs text-muted-foreground">· {book.genre}</span>}
                  {book.date_added && <span className="text-xs text-muted-foreground">· {book.date_added}</span>}
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${book.status === "finished" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                {book.status}
              </span>
              <button
                onClick={() => cycleStatus(book)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
                title="Toggle status"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setExpanded(p => ({ ...p, [book.id]: !p[book.id] }))}
                className="p-1.5 text-muted-foreground hover:text-foreground"
              >
                {expanded[book.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
            {expanded[book.id] && (
              <div className="px-4 pb-3 pt-0 border-t border-border bg-muted/20 space-y-2">
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4,5].map(star => (
                    <button
                      key={star}
                      onClick={() => updateBook(book.id, { rating: star })}
                      className={`text-lg leading-none ${(book.rating || 0) >= star ? "text-amber-400" : "text-muted-foreground/30"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Add a note..."
                  defaultValue={book.note || ""}
                  onBlur={e => updateBook(book.id, { note: e.target.value })}
                  className="w-full text-xs bg-white border border-border rounded px-2.5 py-2 resize-none min-h-[48px] outline-none focus:border-[#534AB7]"
                />
                <input
                  placeholder="Genre (e.g. Fantasy)"
                  defaultValue={book.genre || ""}
                  onBlur={e => updateBook(book.id, { genre: e.target.value })}
                  className="w-full text-xs bg-white border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
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
          <select value={form.kid} onChange={e => setForm(f => ({ ...f, kid: e.target.value }))} className="border border-border rounded px-3 py-2 text-sm outline-none focus:border-[#534AB7]">
            <option value="Tigerlily">Tigerlily</option>
            <option value="Rowen">Rowen</option>
          </select>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="border border-border rounded px-3 py-2 text-sm outline-none focus:border-[#534AB7]">
            <option value="reading">Reading</option>
            <option value="finished">Finished</option>
          </select>
          <input
            value={form.genre}
            onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}
            placeholder="Genre (optional)"
            className="col-span-2 border border-border rounded px-3 py-2 text-sm outline-none focus:border-[#534AB7]"
          />
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