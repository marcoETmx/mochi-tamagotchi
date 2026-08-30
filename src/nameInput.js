import { NAME_MAX, sanitizeName } from "./species.js";

let inputEl = null;
let focused = false;

export function isNameInputFocused() {
  return focused;
}

export function destroyNameInput() {
  focused = false;
  inputEl?.remove();
  inputEl = null;
}

function gameToPage(scene, gx, gy, gw, gh) {
  const canvas = scene.game.canvas;
  const rect = canvas.getBoundingClientRect();
  const sx = rect.width / scene.scale.width;
  const sy = rect.height / scene.scale.height;
  return {
    left: rect.left + (gx - gw / 2) * sx,
    top: rect.top + (gy - gh / 2) * sy,
    width: gw * sx,
    height: gh * sy,
  };
}

export function mountNameInput(scene, { x, y, w, h, value, onChange }) {
  destroyNameInput();

  const el = document.createElement("input");
  el.type = "text";
  el.maxLength = NAME_MAX;
  el.placeholder = "Nombre";
  el.value = value || "";
  el.autocomplete = "off";
  el.autocapitalize = "words";
  el.spellcheck = false;
  el.enterKeyHint = "done";
  el.setAttribute("inputmode", "text");
  el.id = "mochi-name-input";

  const place = () => {
    const box = gameToPage(scene, x, y, w, h);
    el.style.left = `${box.left}px`;
    el.style.top = `${box.top}px`;
    el.style.width = `${box.width}px`;
    el.style.height = `${box.height}px`;
    el.style.fontSize = `${Math.max(16, Math.round(box.height * 0.38))}px`;
    el.style.borderRadius = `${box.height / 2}px`;
  };

  Object.assign(el.style, {
    position: "fixed",
    zIndex: "30",
    margin: "0",
    border: "0",
    padding: "0 18px",
    boxSizing: "border-box",
    fontFamily: "Fredoka, sans-serif",
    fontWeight: "600",
    color: "#5a3d4a",
    background: "#fff7fb",
    boxShadow: "0 4px 0 rgba(90, 61, 74, 0.12)",
    outline: "none",
    textAlign: "center",
    appearance: "none",
    WebkitAppearance: "none",
    touchAction: "manipulation",
    userSelect: "text",
    WebkitUserSelect: "text",
  });

  const emit = () => onChange(sanitizeName(el.value));
  el.addEventListener("focus", () => {
    focused = true;
  });
  el.addEventListener("blur", () => {
    focused = false;
    emit();
  });
  el.addEventListener("input", emit);
  el.addEventListener("keydown", (event) => {
    if (event.key === "Enter") el.blur();
  });

  document.body.appendChild(el);
  inputEl = el;
  place();
  return { el, place };
}
