export function cssSize() {
  const viewport = window.visualViewport;
  const width = Math.round(
    viewport?.width || window.innerWidth || document.documentElement.clientWidth,
  );
  const height = Math.round(
    viewport?.height || window.innerHeight || document.documentElement.clientHeight,
  );
  return {
    width: Math.max(320, width),
    height: Math.max(480, height),
  };
}

export function dpr() {
  return Math.min(window.devicePixelRatio || 1, 2);
}

export function safeInsets() {
  const styles = getComputedStyle(document.documentElement);
  const read = (name) => {
    const value = parseFloat(styles.getPropertyValue(name));
    return Number.isFinite(value) ? value : 0;
  };
  return {
    top: Math.max(read("--sat"), 12),
    bottom: Math.max(read("--sab"), 28),
    left: Math.max(read("--sal"), 16),
    right: Math.max(read("--sar"), 16),
  };
}

export function view(scene) {
  const w = scene.scale.width;
  const h = scene.scale.height;
  const u = dpr();
  const css = safeInsets();
  return {
    w,
    h,
    cx: w / 2,
    cy: h / 2,
    u,
    safe: {
      top: css.top * u,
      bottom: css.bottom * u,
      left: css.left * u,
      right: css.right * u,
    },
    font: (size) => `${Math.round(size * u)}px`,
    px: (size) => size * u,
  };
}
