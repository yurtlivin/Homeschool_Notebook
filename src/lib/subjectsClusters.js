import { subjectCategories } from "@/lib/supabaseClient";

const ICONS = {
  "Language & Literacy": "📚",
  "Math & Logic": "🔢",
  "World & Society": "🌍",
  "Nature & Science": "🔬",
  "Body & Movement": "⚽",
  "Creative Arts": "🎨",
  "Life & Mindfulness": "🧘",
};

export async function loadClusters() {
  const data = await subjectCategories.list();
  return data
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map(cat => ({
      id: cat.id,
      name: cat.name,
      color: cat.color_hex,
      icon: cat.icon || ICONS[cat.name] || "📖",
    }));
}

export const CLUSTER_MAP = {};