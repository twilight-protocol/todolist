const STORAGE_KEY = "todos";
export const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t) =>
        t &&
        typeof t.id === "string" &&
        typeof t.text === "string" &&
        typeof t.completed === "boolean",
    );
  } catch {
    return memoryFallback ? JSON.parse(memoryFallback) : [];
  }
};
export const save = (todos) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    memoryFallback = JSON.stringify(todos);
    showToast("本地存储受限，数据仅在本次会话有效");
  }
};
export { STORAGE_KEY };
export default { load, save, key: STORAGE_KEY };
