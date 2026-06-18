export type Category = {
  key: string;
  label: string;
  icon: string;
  color: string;
};

export const CATEGORIES: Category[] = [
  { key: "food", label: "Food", icon: "🍔", color: "#FF6B6B" },
  { key: "travel", label: "Travel", icon: "🚗", color: "#4ECDC4" },
  { key: "shopping", label: "Shopping", icon: "🛍️", color: "#F7B731" },
  { key: "bills", label: "Bills", icon: "🧾", color: "#6C5CE7" },
  { key: "health", label: "Health", icon: "💊", color: "#2ECC71" },
  { key: "fun", label: "Fun", icon: "🎬", color: "#E17055" },
  { key: "other", label: "Other", icon: "📦", color: "#95A5A6" },
];

const FALLBACK = CATEGORIES[CATEGORIES.length - 1];

export const getCategory = (key: string): Category =>
  CATEGORIES.find((c) => c.key === key) ?? FALLBACK;
