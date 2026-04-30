import BookDetailPanel from "./BookDetailPanel";

export default function BookDetailModal({ book, onRefresh, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-[860px] max-w-[95vw] h-[85vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <BookDetailPanel
          key={book.id}
          book={book}
          onRefresh={onRefresh}
          onClose={onClose}
        />
      </div>
    </div>
  );
}