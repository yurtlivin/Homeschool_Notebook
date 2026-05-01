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
  return data.map(cat => ({
    id: cat.id,
    name: cat.name,
    color: cat.color,
    icon: ICONS[cat.name] || "📖",
    supabase_id: cat.id,
  }));
}

export const CLUSTER_MAP = {};