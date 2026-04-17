// 获取当前筛选条件
export const getFilterFromHash = () => {
  const hash = (location.hash || "#all").replace("#", "");
  if (hash === "active" || hash === "completed") return hash;
  return "all";
};
// 筛选待办列表
export const filterTodos = (todos) => {
  const f = getFilterFromHash();
  return todos.filter((t) => {
    if (f === "active") return !t.completed;
    if (f === "completed") return t.completed;
    return true;
  });
};
// 更新筛选按钮 UI
export const updateFilterUI = (filterBtns) => {
  const current = getFilterFromHash();
  filterBtns.forEach((btn) => {
    const isActive = btn.dataset.filter === current;
    btn.classList.toggle("is-active", isActive);
  });
};
