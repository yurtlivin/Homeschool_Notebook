export const CLUSTERS = [
  {
    id: "language-literacy",
    name: "Language & Literacy",
    color: "#E94B3C",
    icon: "📚",
  },
  {
    id: "math-logic",
    name: "Math & Logic",
    color: "#2E7D32",
    icon: "🔢",
  },
  {
    id: "world-society",
    name: "World & Society",
    color: "#0D47A1",
    icon: "🌍",
  },
  {
    id: "nature-science",
    name: "Nature & Science",
    color: "#F57C00",
    icon: "🔬",
  },
  {
    id: "body-movement",
    name: "Body & Movement",
    color: "#6A1B9A",
    icon: "⚽",
  },
  {
    id: "creative-arts",
    name: "Creative Arts",
    color: "#00796B",
    icon: "🎨",
  },
  {
    id: "life-mindfulness",
    name: "Life & Mindfulness",
    color: "#C62828",
    icon: "🧘",
  },
];

export const CLUSTER_MAP = Object.fromEntries(CLUSTERS.map(c => [c.id, c]));