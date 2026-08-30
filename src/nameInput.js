import { NAME_MAX } from "./species.js";

function gameParent() {
  return document.getElementById("game") || document.body;
}

function placeOver(el, scene, { x, y, w, h }) {
  const canvas = scene.game.canvas.getBoundingClientRect();
  const parent = el.offsetParent?.getBoundingClientRect?.() || gameParent().getBoundingClientRect();
  const zoom = scene.scale.zoom;
  el.style.left = `${canvas.left - parent.left + (x - w / 2) * zoom}px`;
  el.style.top = `${canvas.top - parent.top + (y - h / 2) * zoom}px`;
  el.style.width = `${w * zoom}px`;
  el.style.height = `${h * zoom}px`;
}

export function mountNameField(scene, { x, y, w, h, value, placeholder, onChange }) {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "pet-name-field";
  input.maxLength = NAME_MAX;
  input.placeholder = placeholder || "Toca para escribir...";
  input.value = value || "";
  input.autocomplete = "off";
  input.autocapitalize = "words";
  input.spellcheck = false;
  input.enterKeyHint = "done";
  input.setAttribute("aria-label", "Nombre de tu mascota");

  gameParent().appendChild(input);
  placeOver(input, scene, { x, y, w, h });

  const emit = () => onChange?.(input.value);

  input.addEventListener("input", emit);
  input.addEventListener("change", emit);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      input.blur();
    }
  });

  const onResize = () => placeOver(input, scene, { x, y, w, h });
  window.addEventListener("resize", onResize);
  window.visualViewport?.addEventListener("resize", onResize);

  const destroy = () => {
    window.removeEventListener("resize", onResize);
    window.visualViewport?.removeEventListener("resize", onResize);
    input.remove();
  };
  scene.events.once("shutdown", destroy);
  scene.events.once("destroy", destroy);

  return {
    el: input,
    focus: () => input.focus(),
    setValue: (next) => {
      input.value = next;
    },
    destroy,
  };
}

export function openNameModal({ title, value, confirmLabel, onSubmit, onCancel }) {
  const root = document.createElement("div");
  root.className = "name-modal";
  root.innerHTML = `
    <form class="name-modal-card">
      <p class="name-modal-title"></p>
      <input class="pet-name-field name-modal-input" type="text" maxlength="${NAME_MAX}" autocomplete="off" spellcheck="false" enterkeyhint="done" />
      <div class="name-modal-actions">
        <button type="button" class="name-modal-cancel">Cancelar</button>
        <button type="submit" class="name-modal-ok"></button>
      </div>
    </form>
  `;

  const titleEl = root.querySelector(".name-modal-title");
  const input = root.querySelector("input");
  const ok = root.querySelector(".name-modal-ok");
  const cancel = root.querySelector(".name-modal-cancel");
  const form = root.querySelector("form");

  titleEl.textContent = title;
  ok.textContent = confirmLabel || "Listo";
  input.value = value || "";
  input.placeholder = "Nombre";

  const close = (submit) => {
    root.remove();
    if (submit) onSubmit?.(input.value);
    else onCancel?.();
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    close(true);
  });
  cancel.addEventListener("click", () => close(false));
  root.addEventListener("click", (event) => {
    if (event.target === root) close(false);
  });

  gameParent().appendChild(root);
  requestAnimationFrame(() => input.focus());
  input.select();

  return { destroy: () => root.remove() };
}
