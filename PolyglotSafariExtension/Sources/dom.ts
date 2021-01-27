export interface BoundingRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

// Return selection coords
export function getSelectionBoundingRect(): BoundingRect | undefined {
  const rect = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
  };

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return undefined;

  for (let i = 0; i < sel.rangeCount; ++i) {
    const _rect = sel.getRangeAt(i).getBoundingClientRect();
    if (rect.left < _rect.left) {
      rect.left = _rect.left;
    }
    if (rect.top < _rect.top) {
      rect.top = _rect.top;
    }
    if (rect.right < _rect.right) {
      rect.right = _rect.right;
    }
    if (rect.bottom < _rect.bottom) {
      rect.bottom = _rect.bottom;
    }
  }
  rect.width = rect.right - rect.left;
  rect.height = rect.bottom - rect.top;
  rect.left += window.pageXOffset;
  rect.top += window.pageYOffset;
  rect.right += window.pageXOffset;
  rect.bottom += window.pageYOffset;

  return rect;
}
export function isDescendant(parent: HTMLElement, child: HTMLElement) {
  if (parent === child) {
    return true;
  }
  let node = child.parentNode;
  while (node !== null) {
    if (node === parent) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}
