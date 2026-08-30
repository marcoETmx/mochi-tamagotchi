/**
 * Phaser hit-tests add displayOrigin (width/2, height/2 after setSize on a
 * Container). Hit shapes must therefore be in top-left space: (0, 0) is the
 * top-left of the sized container, not its visual center.
 */
export function containerHitBox(width, height, padX = 0, padY = padX) {
  return {
    x: -padX,
    y: -padY,
    width: width + padX * 2,
    height: height + padY * 2,
  };
}

export function pointHitsContainer(box, width, height, localX, localY) {
  const x = localX + width / 2;
  const y = localY + height / 2;
  return x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height;
}
