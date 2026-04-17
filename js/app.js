import { load, save } from "./storage.js";
import { getFilterFromHash, filterTodos, updateFilterUI } from "./filter.js";
/** @typedef {{ id: string, text: string, completed: boolean }} Todo */
/** @type {Todo[]} */
let todos = [];
const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const listEl = document.getElementById("todo-list");
const emptyHint = document.getElementById("empty-hint");
const filterBtns = document.querySelectorAll(".filter-btn");

const saveToStorage = () => save(todos);

const findIndexById = (id) => todos.findIndex((t) => t.id === id);

// 上移 / 下移
const moveTodo = (id, delta) => {
  const i = findIndexById(id);
  if (i < 0) return;
  const j = i + delta;
  if (j < 0 || j >= todos.length) return;
  [todos[i], todos[j]] = [todos[j], todos[i]];
  saveToStorage();
  render();
};

let dragId = null;

const clearDropIndicators = () => {
  listEl.querySelectorAll(".todo-item").forEach((el) => {
    el.classList.remove("drop-indicator-top", "drop-indicator-bottom");
  });
};

// 创建待办项 DOM
const createTodoItem = (todo) => {
  const li = document.createElement("li");
  li.className = "todo-item";
  li.dataset.id = todo.id;
  li.draggable = true;

  // 拖拽手柄
  const grip = document.createElement("span");
  grip.className = "todo-item__grip";
  grip.setAttribute("aria-hidden", "true");
  grip.textContent = "⋮⋮";
  grip.title = "拖动排序";

  // 复选框
  const checkWrap = document.createElement("label");
  checkWrap.className = "todo-item__checkbox-wrap";
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.className = "todo-item__checkbox";
  cb.checked = todo.completed;
  cb.addEventListener("change", () => {
    const idx = findIndexById(todo.id);
    if (idx >= 0) {
      todos[idx].completed = cb.checked;
      saveToStorage();
      render();
    }
  });
  checkWrap.appendChild(cb);

  // 文本
  const textSpan = document.createElement("span");
  textSpan.className = todo.completed
    ? "todo-item__text is-completed"
    : "todo-item__text";
  textSpan.textContent = todo.text;

  // 操作按钮
  const actions = document.createElement("div");
  actions.className = "todo-item__actions";

  const makeBtn = (label, title, onClick) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.setAttribute("aria-label", title);
    b.className = "todo-item__action-btn";
    b.addEventListener("click", onClick);
    return b;
  };

  actions.appendChild(makeBtn("↑", "上移", () => moveTodo(todo.id, -1)));
  actions.appendChild(makeBtn("↓", "下移", () => moveTodo(todo.id, 1)));
  actions.appendChild(
    makeBtn("删", "删除", () => {
      todos = todos.filter((t) => t.id !== todo.id);
      saveToStorage();
      render();
    }),
  );

  li.append(grip, checkWrap, textSpan, actions);

  // 拖拽事件
  li.addEventListener("dragstart", (e) => {
    dragId = todo.id;
    li.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move"; // 设置拖拽效果为"移动"
    try {
      e.dataTransfer.setData("text/plain", todo.id); // 存储数据到剪贴板
    } catch {}
  });

  li.addEventListener("dragend", () => {
    li.classList.remove("dragging");
    dragId = null;
    clearDropIndicators();
  });

  li.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move"; // 设置放置效果
    if (!dragId || dragId === todo.id) return;
    clearDropIndicators();
    const rect = li.getBoundingClientRect();
    // 计算鼠标位置
    const before = e.clientY < rect.top + rect.height / 2;
    li.classList.add(before ? "drop-indicator-top" : "drop-indicator-bottom");
  });

  li.addEventListener("dragleave", (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    li.classList.remove("drop-indicator-top", "drop-indicator-bottom");
  });

  li.addEventListener("drop", (e) => {
    e.preventDefault();
    let fromId = dragId;
    try {
      const dt = e.dataTransfer.getData("text/plain");
      if (dt) fromId = dt;
    } catch {}
    clearDropIndicators();
    if (!fromId || fromId === todo.id) return;

    const fromIdx = findIndexById(fromId);
    if (fromIdx < 0) return;

    const rect = li.getBoundingClientRect();
    const insertBefore = e.clientY < rect.top + rect.height / 2;
    const item = todos.splice(fromIdx, 1)[0];
    const newToIdx = findIndexById(todo.id);

    if (newToIdx < 0) {
      todos.push(item);
    } else {
      let targetPos = insertBefore ? newToIdx : newToIdx + 1;
      targetPos = Math.max(0, Math.min(targetPos, todos.length));
      todos.splice(targetPos, 0, item);
    }
    saveToStorage();
    render();
  });
  // 触摸事件（移动端）
  let touchDrag = null;
  li.addEventListener(
    "touchstart",
    (ev) => {
      if (ev.touches.length !== 1) return;
      const t = ev.touches[0];
      touchDrag = {
        id: todo.id,
        startX: t.clientX,
        startY: t.clientY,
        moved: false,
      };
    },
    { passive: true }, // 不阻塞滚动，提升性能
  );

  li.addEventListener(
    "touchmove",
    (ev) => {
      if (!touchDrag || touchDrag.id !== todo.id) return;
      const t = ev.touches[0];
      if (
        Math.abs(t.clientX - touchDrag.startX) > 8 ||
        Math.abs(t.clientY - touchDrag.startY) > 8
      ) {
        touchDrag.moved = true;
        li.classList.add("dragging");
      }
    },
    { passive: true },
  );

  li.addEventListener("touchend", (ev) => {
    if (!touchDrag || touchDrag.id !== todo.id) return;
    li.classList.remove("dragging");
    if (!touchDrag.moved) {
      touchDrag = null;
      return;
    }
    const t = ev.changedTouches[0];
    const elBelow = document.elementFromPoint(t.clientX, t.clientY);
    const targetLi = elBelow?.closest?.(".todo-item");
    touchDrag = null;
    if (!targetLi || targetLi === li) return;

    const otherId = targetLi.dataset.id;
    if (!otherId) return;

    const a = findIndexById(todo.id);
    const b = findIndexById(otherId);
    if (a < 0 || b < 0) return;

    const rectTarget = targetLi.getBoundingClientRect();
    const insertBefore = t.clientY < rectTarget.top + rectTarget.height / 2;
    const movedItem = todos.splice(a, 1)[0];
    const newB = findIndexById(otherId);

    if (newB < 0) {
      todos.push(movedItem);
    } else {
      let targetPos = insertBefore ? newB : newB + 1;
      targetPos = Math.max(0, Math.min(targetPos, todos.length));
      todos.splice(targetPos, 0, movedItem);
    }
    saveToStorage();
    render();
  });

  return li;
};

// 渲染主函数
const render = () => {
  updateFilterUI(filterBtns);
  const visible = filterTodos(todos);
  listEl.innerHTML = "";

  const isEmpty = visible.length === 0;
  emptyHint.classList.toggle("hidden", !isEmpty);
  emptyHint.textContent =
    todos.length === 0 ? "暂无待办，输入后点击添加" : "当前筛选下没有待办";

  visible.forEach((todo) => {
    listEl.appendChild(createTodoItem(todo));
  });
};

// 表单提交
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = (input.value || "").trim();
  if (!text) return;
  todos.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    text,
    completed: false,
  });
  input.value = "";
  saveToStorage();
  render();
});

// hash 变化重新渲染
window.addEventListener("hashchange", render);

// 初始化
todos = load();
if (!location.hash) {
  location.hash = "#all";
}
render();
input.focus();
