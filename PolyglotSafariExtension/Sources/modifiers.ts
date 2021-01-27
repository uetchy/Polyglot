export interface Modifiers {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  cmd: boolean;
}

// cmd   = 256
// shift = 512
// alt   = 2048
// ctrl  = 4096
export function expandModifiers(modifiers: number): Modifiers {
  const modifierMaps = {
    ctrl: false,
    alt: false,
    shift: false,
    cmd: false,
  };

  let cur = modifiers;
  while (cur !== 0) {
    if (cur >= 4096) {
      modifierMaps.ctrl = true;
      cur %= 4096;
    } else if (cur >= 2048) {
      modifierMaps.alt = true;
      cur %= 2048;
    } else if (cur >= 512) {
      modifierMaps.shift = true;
      cur %= 512;
    } else {
      modifierMaps.cmd = true;
      cur %= 256;
    }
  }

  return modifierMaps;
}
export function matchModifiers(
  modifiers: Modifiers,
  e: KeyboardEvent
): boolean {
  return modifiers.ctrl
    ? e.ctrlKey
    : true && modifiers.alt
    ? e.altKey
    : true && modifiers.shift
    ? e.shiftKey
    : true && modifiers.cmd
    ? e.metaKey
    : true;
}
