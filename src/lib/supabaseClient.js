import { base44 } from '@/api/base44Client';

// Data access layer wrapping custom homeschool integrations
// All tag references are by tag_id, never text strings

const CORE = 'homeschool-core';
const RELATIONS = 'homeschool-relationships';

// ── CHILDREN ──
export const children = {
  list: async () => {
    const res = await base44.integrations.custom.call(CORE, 'get:/children', {});
    return res.success ? res.data : [];
  },
  get: async (id) => {
    const res = await base44.integrations.custom.call(CORE, 'get:/children', {
      queryParams: { id }
    });
    return res.success ? res.data[0] : null;
  },
};

// ── SUBJECT CATEGORIES (7 main clusters) ──
export const subjectCategories = {
  list: async () => {
    const res = await base44.integrations.custom.call(CORE, 'get:/subject_categories', {});
    return res.success ? res.data : [];
  },
  get: async (id) => {
    const res = await base44.integrations.custom.call(CORE, 'get:/subject_categories', {
      queryParams: { id }
    });
    return res.success ? res.data[0] : null;
  },
  create: async (data) => {
    const res = await base44.integrations.custom.call(CORE, 'post:/subject_categories', {
      payload: data
    });
    return res.success ? res.data : null;
  },
  update: async (id, data) => {
    const res = await base44.integrations.custom.call(CORE, 'patch:/subject_categories', {
      payload: { id, ...data }
    });
    return res.success ? res.data : null;
  },
};

// ── BOOKS (curriculum & reading, consolidated) ──
export const books = {
  list: async () => {
    const res = await base44.integrations.custom.call(CORE, 'get:/books', {});
    return res.success ? res.data : [];
  },
  filter: async (query) => {
    // Query by child_id, status, etc.
    const res = await base44.integrations.custom.call(CORE, 'get:/books', {
      queryParams: query
    });
    return res.success ? res.data : [];
  },
  get: async (id) => {
    const res = await base44.integrations.custom.call(CORE, 'get:/books', {
      queryParams: { id }
    });
    return res.success ? res.data[0] : null;
  },
  create: async (data) => {
    const res = await base44.integrations.custom.call(CORE, 'post:/books', {
      payload: data
    });
    return res.success ? res.data : null;
  },
  update: async (id, data) => {
    const res = await base44.integrations.custom.call(CORE, 'patch:/books', {
      payload: { id, ...data }
    });
    return res.success ? res.data : null;
  },
  delete: async (id) => {
    const res = await base44.integrations.custom.call(CORE, 'delete:/books', {
      payload: { id }
    });
    return res.success;
  },
};

// ── LESSONS (logs, planner, anchors — all lessons with tags) ──
export const lessons = {
  list: async () => {
    const res = await base44.integrations.custom.call(CORE, 'get:/lessons', {});
    return res.success ? res.data : [];
  },
  filter: async (query) => {
    // Query by child_id, date, tag filters, etc.
    const res = await base44.integrations.custom.call(CORE, 'get:/lessons', {
      queryParams: query
    });
    return res.success ? res.data : [];
  },
  get: async (id) => {
    const res = await base44.integrations.custom.call(CORE, 'get:/lessons', {
      queryParams: { id }
    });
    return res.success ? res.data[0] : null;
  },
  create: async (data) => {
    const res = await base44.integrations.custom.call(CORE, 'post:/lessons', {
      payload: data
    });
    return res.success ? res.data : null;
  },
  update: async (id, data) => {
    const res = await base44.integrations.custom.call(CORE, 'patch:/lessons', {
      payload: { id, ...data }
    });
    return res.success ? res.data : null;
  },
  delete: async (id) => {
    const res = await base44.integrations.custom.call(CORE, 'delete:/lessons', {
      payload: { id }
    });
    return res.success;
  },
};

// ── TAGS (granular topics: multiplication, division, etc.) ──
export const tags = {
  list: async () => {
    const res = await base44.integrations.custom.call(CORE, 'get:/tags', {});
    return res.success ? res.data : [];
  },
  filter: async (query) => {
    // Query by category_id, name, etc.
    const res = await base44.integrations.custom.call(CORE, 'get:/tags', {
      queryParams: query
    });
    return res.success ? res.data : [];
  },
  get: async (id) => {
    const res = await base44.integrations.custom.call(CORE, 'get:/tags', {
      queryParams: { id }
    });
    return res.success ? res.data[0] : null;
  },
  create: async (data) => {
    const res = await base44.integrations.custom.call(CORE, 'post:/tags', {
      payload: data
    });
    return res.success ? res.data : null;
  },
};

// ── LESSON_TAGS (junction: link lessons to tags) ──
export const lessonTags = {
  list: async () => {
    const res = await base44.integrations.custom.call(RELATIONS, 'get:/lesson_tags', {});
    return res.success ? res.data : [];
  },
  filter: async (query) => {
    // Query by lesson_id, tag_id, etc.
    const res = await base44.integrations.custom.call(RELATIONS, 'get:/lesson_tags', {
      queryParams: query
    });
    return res.success ? res.data : [];
  },
  create: async (data) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'post:/lesson_tags', {
      payload: data
    });
    return res.success ? res.data : null;
  },
  delete: async (lessonId, tagId) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'delete:/lesson_tags', {
      payload: { lesson_id: lessonId, tag_id: tagId }
    });
    return res.success;
  },
};

// ── LESSON_BOOKS (junction: link lessons to books/curriculum & books to tags) ──
export const lessonBooks = {
  list: async () => {
    const res = await base44.integrations.custom.call(RELATIONS, 'get:/lesson_books', {});
    return res.success ? res.data : [];
  },
  filter: async (query) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'get:/lesson_books', {
      queryParams: query
    });
    return res.success ? res.data : [];
  },
  create: async (data) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'post:/lesson_books', {
      payload: data
    });
    return res.success ? res.data : null;
  },
  delete: async (lessonId, bookId) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'delete:/lesson_books', {
      payload: { lesson_id: lessonId, book_id: bookId }
    });
    return res.success;
  },
};

// ── BOOK_TAGS (junction: link books to tags) ──
export const bookTags = {
  list: async () => {
    const res = await base44.integrations.custom.call(RELATIONS, 'get:/book_tags', {});
    return res.success ? res.data : [];
  },
  filter: async (query) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'get:/book_tags', {
      queryParams: query
    });
    return res.success ? res.data : [];
  },
  create: async (data) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'post:/book_tags', {
      payload: data
    });
    return res.success ? res.data : null;
  },
  delete: async (bookId, tagId) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'delete:/book_tags', {
      payload: { book_id: bookId, tag_id: tagId }
    });
    return res.success;
  },
};

// ── MEDIA (photos, videos, etc. — linked to lessons) ──
export const media = {
  list: async () => {
    const res = await base44.integrations.custom.call(RELATIONS, 'get:/media', {});
    return res.success ? res.data : [];
  },
  filter: async (query) => {
    // Query by lesson_id, child_id, media_type, etc.
    const res = await base44.integrations.custom.call(RELATIONS, 'get:/media', {
      queryParams: query
    });
    return res.success ? res.data : [];
  },
  get: async (id) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'get:/media', {
      queryParams: { id }
    });
    return res.success ? res.data[0] : null;
  },
  create: async (data) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'post:/media', {
      payload: data
    });
    return res.success ? res.data : null;
  },
  update: async (id, data) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'patch:/media', {
      payload: { id, ...data }
    });
    return res.success ? res.data : null;
  },
  delete: async (id) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'delete:/media', {
      payload: { id }
    });
    return res.success;
  },
};

// ── MEDIA_TAGS (junction: link media to tags) ──
export const mediaTags = {
  list: async () => {
    const res = await base44.integrations.custom.call(RELATIONS, 'get:/media_tags', {});
    return res.success ? res.data : [];
  },
  filter: async (query) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'get:/media_tags', {
      queryParams: query
    });
    return res.success ? res.data : [];
  },
  create: async (data) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'post:/media_tags', {
      payload: data
    });
    return res.success ? res.data : null;
  },
  delete: async (mediaId, tagId) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'delete:/media_tags', {
      payload: { media_id: mediaId, tag_id: tagId }
    });
    return res.success;
  },
};

export default {
  children,
  subjectCategories,
  books,
  lessons,
  tags,
  lessonTags,
  lessonBooks,
  media,
  mediaTags,
};