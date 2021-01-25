import Mustache from "mustache";
import franc from "franc";
import to1 from "iso-639-3/to-1";

interface Modifiers {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  cmd: boolean;
}

interface Settings {
  keyCode: number;
  modifiers: Modifiers;
  sourceLanguage: string;
  targetLanguage: string;
  instantTranslation: boolean;
}

interface ReceivedSettings {
  keyCodeUnicode: number;
  modifiers: number;
  sourceLanguage: string;
  targetLanguage: string;
  instantTranslation: boolean;
}

interface BoundingRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

interface DictionaryEntry {
  score: number;
  word: string;
  reverse_translation: string[];
}

interface DictionaryItem {
  base_form: string;
  entry: DictionaryEntry[];
  pos: "noun" | "verb";
  pos_enum: number;
  terms: string[];
}

interface SynonymEntry {
  definition_id: string;
  synonym: string[];
}

interface Synonym {
  base_form: string;
  pos: string;
  entry: SynonymEntry[];
}

interface ReceivedTranslation {
  sourceLanguage: string;
  translation: string;
  transliteration: string;
  sourceTransliteration: string;
  dictionary: DictionaryItem[];
  synonyms: Synonym[];
  id: string;
}

interface UpstreamError {
  error: string;
  id: string;
}

enum RequestMessageType {
  RequestSettings = "getSettings",
  Translate = "translate",
}

enum ResponseMessageType {
  SettingsReceived = "settingsReceived",
  TranslationReceived = "translated",
  ErrorOccured = "error",
  PerformTranslation = "performTranslation",
}

const PANEL_ID = "polyglot__panel";
const INDICATOR = `<div class="polyglot__inner"><div class="polyglot__loader">Loading</div></div>`;

let isPanelOpen = false;
let settings: Settings;

function setup(): void {
  console.debug("Polyglot: loaded", window.location.href);

  // handle messages from App Extension
  safari.self.addEventListener("message", handleMessage, false);

  // handle js events in active page
  window.addEventListener("mouseup", handleMouseUp, false);
  window.addEventListener("keypress", handleKeypress, false);
  window.addEventListener("click", handleClick, false);

  // fetch global settings from App Extension
  safari.extension.dispatchMessage(RequestMessageType.RequestSettings);
}

// Get selected text and return to global script
function handleMessage(msg: SafariExtensionMessageEvent): void {
  switch (msg.name) {
    case ResponseMessageType.SettingsReceived:
      console.debug("ResponseMessageType.SettingsReceived", msg.message);
      settingsHandler(msg.message);
      break;
    case ResponseMessageType.TranslationReceived:
      translationHandler(msg.message);
      break;
    case ResponseMessageType.ErrorOccured:
      translationErrorHandler(msg.message);
      break;
    case ResponseMessageType.PerformTranslation:
      performTranslation(); // TODO: support iframe
      break;
    default:
  }
}

function settingsHandler(received: ReceivedSettings): void {
  settings = {
    keyCode: received.keyCodeUnicode || 0,
    modifiers: received.modifiers
      ? divideModifiers(received.modifiers)
      : { ctrl: false, alt: false, shift: false, cmd: false },
    sourceLanguage: received.sourceLanguage,
    targetLanguage: received.targetLanguage,
    instantTranslation: received.instantTranslation || false,
  };
  console.debug(settings);
}

function translationErrorHandler(message: UpstreamError) {
  if (message.id !== window.location.href) return;
  const args = {
    error: message.error,
  };
  const result = Mustache.render(
    `
  <div class="polyglot__inner">
  <div class="polyglot__section">
    {{{error}}}
  </div>
  </div>`,
    args
  );
  showPanel(result);
}

function translationHandler(message: ReceivedTranslation): void {
  if (message.id !== window.location.href) return;

  const args = {
    sourceLanguage: message.sourceLanguage || null,
    translation: message.translation.replace(/\n/g, "<br/>"),
    transliteration: message.transliteration.replace(/\n/g, "<br/>"),
    sourceTransliteration: message.sourceTransliteration.replace(
      /\n/g,
      "<br/>"
    ),
    synonyms: message.synonyms
      ? message.synonyms.map((synonym) => ({
          pos: synonym.pos,
          entries: Array.from(
            new Set(synonym.entry.map((entry) => entry.synonym[0]))
          ),
        }))
      : null,
  };
  const result = Mustache.render(
    `
  <div class="polyglot__inner">
    <div class="polyglot__section">
      {{{translation}}}
    </div>

    {{#sourceTransliteration}}
    <div class="polyglot__section">
      <div class="polyglot__section--title">Transliteration</div>
      {{{sourceTransliteration}}}
    </div>
    {{/sourceTransliteration}}

    {{#synonyms}}
    <div class="polyglot__section">
      <div class="polyglot__section--title">{{pos}}</div>
      <div class="polyglot__synonyms">
        {{#entries}}
        <div class="polyglot__synonyms--entry">{{.}}</div>
        {{/entries}}
      </div>
    </div>
    {{/synonyms}}
  </div>`,
    args
  );

  showPanel(result);
}

function handleKeypress(keyboardEvent: KeyboardEvent): void {
  // Check if shortcut key is properly configured
  const { keyCode } = settings;
  if (keyCode === undefined) return;
  const kbdKeyCode = keyboardEvent.key.toUpperCase().charCodeAt(0);

  const isValidModifiers = checkModifiers(settings.modifiers, keyboardEvent);
  const isValidKeyCode = keyCode === kbdKeyCode;

  console.debug(
    keyCode,
    "keyCode: " + kbdKeyCode,
    "key: " + keyboardEvent.key,
    isValidKeyCode,
    isValidModifiers
  );

  if (isValidModifiers && isValidKeyCode) {
    keyboardEvent.preventDefault();
    performTranslation();
  }
}

function handleMouseUp(e: MouseEvent): void {
  const panel = document.getElementById(PANEL_ID);

  // if clicked on outside of panel, remove panel
  if (panel && isPanelOpen && !isDescendant(panel, <HTMLElement>e.target)) {
    removePanel();
  }
}

// handle click event for instant translation
function handleClick(e: MouseEvent): void {
  if (
    !settings.instantTranslation ||
    (<HTMLDivElement>e.target).id === PANEL_ID
  ) {
    return;
  }

  if (document.activeElement) {
    const activeElement = document.activeElement.tagName.toLowerCase();
    if (activeElement === "textarea" || activeElement === "input") {
      return;
    }
  }

  performTranslation();
}

function performTranslation() {
  const selectedText = getSelectedText();
  if (!selectedText) return;

  const language = to1[franc(selectedText, { minLength: 2 })];
  console.log("detected language", language);

  // prevent translation if all of conditions are met
  // - instant translation is enabled
  // - detected language is equal to target language
  const prevent =
    settings.instantTranslation &&
    language !== undefined &&
    language === settings.targetLanguage;
  if (prevent) return;

  showPanel(INDICATOR);
  safari.extension.dispatchMessage(RequestMessageType.Translate, {
    text: selectedText,
    id: window.location.href,
  });
}

// cmd   = 256
// shift = 512
// alt   = 2048
// ctrl  = 4096
function divideModifiers(modifiers: number): Modifiers {
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

function checkModifiers(modifiers: Modifiers, e: KeyboardEvent): boolean {
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

function getSelectedText(): string | undefined {
  const selection = window.getSelection();
  if (!selection) return undefined;

  const selectedText = selection.toString();

  if (selectedText && selectedText !== "\n") {
    return selectedText;
  }
}

function removePanel() {
  isPanelOpen = false;
  const panel = document.getElementById(PANEL_ID);
  if (panel) {
    panel.remove();
  }
}

// Show panel with given text
function showPanel(content: string): void {
  if (isPanelOpen) removePanel();

  const bounds = getSelectionBoundingRect();
  if (bounds === undefined) return;

  const el = document.createElement("div");
  el.innerHTML = content;
  el.id = PANEL_ID;
  el.style.left = bounds.left + "px";
  el.style.top = bounds.bottom + "px";
  document.body.insertBefore(el, document.body.firstChild);
  isPanelOpen = true;
}

// Return selection coords
function getSelectionBoundingRect(): BoundingRect | undefined {
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

function isDescendant(parent: HTMLElement, child: HTMLElement) {
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

setup();
