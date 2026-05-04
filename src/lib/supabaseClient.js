import { base44 } from '@/api/base44Client';

// Data access layer wrapping custom homeschool integrations
// Table mapping: integration endpoint → actual Supabase table
//   homeschool-core:
//     /subject_categories → hs_subject_categories
//     /tags               → hs_tags
//     /children           → hs_children
//     /books              → hs_books
//     /lessons            → hs_lessons
//   homeschool-relationships:
//     /lesson_tags        → hs_lesson_tags
//     /lesson_books       → hs_child_books
//     /media              → hs_media
//     /media_tags         → hs_media_tags

const CORE = 'homeschool-core';
const RELATIONS = 'homeschool-relationships';

// ── hs_children ──
// columns: id, name, preferred_name, birthdate, grade_level, color_hex, avatar_url, sort_order, active
export const children = {
  list: async () => {
    const res = await base44.integrations.custom.call(CORE, 'get:/children', {
      queryParams: { active: true }
    });
    return res.success ? res.data : [];
  },
  get: async (id) => {
    const res = await base44.integrations.custom.call(CORE, 'get:/children', {
      queryParams: { id }
    });
    return res.success ? res.data[0] : null;
  },
  create: async (data) => {
    const res = await base44.integrations.custom.call(CORE, 'post:/children', { payload: data });
    return res.success ? res.data : null;
  },
  update: async (id, data) => {
    const res = await base44.integrations.custom.call(CORE, 'patch:/children', { payload: { id, ...data } });
    return res.success ? res.data : null;
  },
};

// ── hs_subject_categories ──
// columns: id, name, color_hex, icon, sort_order, active
export const subjectCategories = {
  list: async () => {
    const res = await base44.integrations.custom.call(CORE, 'get:/subject_categories', {
      queryParams: { active: true }
    });
    return res.success ? res.data : [];
  },
  get: async (id) => {
    const res = await base44.integrations.custom.call(CORE, 'get:/subject_categories', {
      queryParams: { id }
    });
    return res.success ? res.data[0] : null;
  },
};

// ── hs_tags ──
// columns: id, name, category_id, sort_order, active
export const tags = {
  list: async () => {
    const res = await base44.integrations.custom.call(CORE, 'get:/tags', {
      queryParams: { active: true }
    });
    return res.success ? res.data : [];
  },
  filter: async (query) => {
    const res = await base44.integrations.custom.call(CORE, 'get:/tags', { queryParams: query });
    return res.success ? res.data : [];
  },
  get: async (id) => {
    const res = await base44.integrations.custom.call(CORE, 'get:/tags', { queryParams: { id } });
    return res.success ? res.data[0] : null;
  },
  create: async (data) => {
    const res = await base44.integrations.custom.call(CORE, 'post:/tags', { payload: data });
    return res.success ? res.data : null;
  },
};

// ── hs_books ──
// columns: id, title, subtitle, author, publisher, cover_url, category_id, description, notes, active
export const books = {
  list: async () => {
    const res = await base44.integrations.custom.call(CORE, 'get:/books', {
      queryParams: { active: true }
    });
    return res.success ? res.data : [];
  },
  filter: async (query) => {
    const res = await base44.integrations.custom.call(CORE, 'get:/books', { queryParams: query });
    return res.success ? res.data : [];
  },
  get: async (id) => {
    const res = await base44.integrations.custom.call(CORE, 'get:/books', { queryParams: { id } });
    return res.success ? res.data[0] : null;
  },
  create: async (data) => {
    const res = await base44.integrations.custom.call(CORE, 'post:/books', { payload: data });
    return res.success ? res.data : null;
  },
  update: async (id, data) => {
    const res = await base44.integrations.custom.call(CORE, 'patch:/books', { payload: { id, ...data } });
    return res.success ? res.data : null;
  },
  delete: async (id) => {
    const res = await base44.integrations.custom.call(CORE, 'delete:/books', { payload: { id } });
    return res.success;
  },
};

// ── hs_lessons ──
// columns: id, date, title, description, duration_minutes, category_id, activity_type_id,
//          emotional_tone_id, location_id, is_life_moment, created_at
export const lessons = {
  list: async () => {
    const res = await base44.integrations.custom.call(CORE, 'get:/lessons', {});
    return res.success ? res.data : [];
  },
  filter: async (query) => {
    const res = await base44.integrations.custom.call(CORE, 'get:/lessons', { queryParams: query });
    return res.success ? res.data : [];
  },
  get: async (id) => {
    const res = await base44.integrations.custom.call(CORE, 'get:/lessons', { queryParams: { id } });
    return res.success ? res.data[0] : null;
  },
  create: async (data) => {
    const res = await base44.integrations.custom.call(CORE, 'post:/lessons', { payload: data });
    return res.success ? res.data : null;
  },
  update: async (id, data) => {
    const res = await base44.integrations.custom.call(CORE, 'patch:/lessons', { payload: { id, ...data } });
    return res.success ? res.data : null;
  },
  delete: async (id) => {
    const res = await base44.integrations.custom.call(CORE, 'delete:/lessons', { payload: { id } });
    return res.success;
  },
};

// ── hs_lesson_tags (junction) ──
// columns: lesson_id, tag_id
export const lessonTags = {
  list: async () => {
    const res = await base44.integrations.custom.call(RELATIONS, 'get:/lesson_tags', {});
    return res.success ? res.data : [];
  },
  filter: async (query) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'get:/lesson_tags', { queryParams: query });
    return res.success ? res.data : [];
  },
  create: async (data) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'post:/lesson_tags', { payload: data });
    return res.success ? res.data : null;
  },
  delete: async (lessonId, tagId) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'delete:/lesson_tags', {
      payload: { lesson_id: lessonId, tag_id: tagId }
    });
    return res.success;
  },
};

// ── hs_child_books (junction) ──
// columns: id, child_id, book_id, status, started_at, finished_at
export const lessonBooks = {
  list: async () => {
    const res = await base44.integrations.custom.call(RELATIONS, 'get:/lesson_books', {});
    return res.success ? res.data : [];
  },
  filter: async (query) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'get:/lesson_books', { queryParams: query });
    return res.success ? res.data : [];
  },
  create: async (data) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'post:/lesson_books', { payload: data });
    return res.success ? res.data : null;
  },
  delete: async (lessonId, bookId) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'delete:/lesson_books', {
      payload: { lesson_id: lessonId, book_id: bookId }
    });
    return res.success;
  },
};

// ── hs_media ──
// columns: id, storage_url, filename_original, category_id, date_taken, school_year_week,
//          caption, notes, location_id, activity_type_id, emotional_tone_id,
//          source_type_id, is_portfolio_asset, created_at
export const media = {
  list: async () => {
    const res = await base44.integrations.custom.call(RELATIONS, 'get:/media', {});
    return res.success ? res.data : [];
  },
  filter: async (query) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'get:/media', { queryParams: query });
    return res.success ? res.data : [];
  },
  get: async (id) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'get:/media', { queryParams: { id } });
    return res.success ? res.data[0] : null;
  },
  create: async (data) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'post:/media', { payload: data });
    return res.success ? res.data : null;
  },
  update: async (id, data) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'patch:/media', { payload: { id, ...data } });
    return res.success ? res.data : null;
  },
  delete: async (id) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'delete:/media', { payload: { id } });
    return res.success;
  },
};

// ── hs_media_tags (junction) ──
// columns: media_id, tag_id
export const mediaTags = {
  list: async () => {
    const res = await base44.integrations.custom.call(RELATIONS, 'get:/media_tags', {});
    return res.success ? res.data : [];
  },
  filter: async (query) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'get:/media_tags', { queryParams: query });
    return res.success ? res.data : [];
  },
  create: async (data) => {
    const res = await base44.integrations.custom.call(RELATIONS, 'post:/media_tags', { payload: data });
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