export const cleanUnderscoreStrings = (str: string) => {
  return str.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

export const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
