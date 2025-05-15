export function renderDatetimeToString(dateString) {
  const formatted = new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return formatted;
}


export const trimContent = (text, maxLength = 100) => {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};