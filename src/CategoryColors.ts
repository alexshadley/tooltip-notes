const COLORS = ["d3f8e2", "e4c1f9", "f694c1", "ede7b1", "a9def9"];

export const colorForCategory = (category: string) => {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash += category.charCodeAt(i);
  }

  return "#" + COLORS[hash % COLORS.length];
};
