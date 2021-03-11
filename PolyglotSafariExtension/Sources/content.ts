import franc from "franc";
import to1 from "iso-639-3/to-1.json";
import {
  ReceivedSettings,
  ReceivedTranslation,
  RequestMessageType,
  ResponseMessageType,
  Settings,
  UpstreamError,
} from "./interfaces";
import { expandModifiers, matchModifiers } from "./modifiers";
import {
  isElementPanelChildren,
  removePanel,
  showConfirmButton,
  showError,
  showIndicator,
  showTranslation,
} from "./panel";

let settings: Settings;

function init(): void {
  console.debug("Polyglot: loaded", window.location.href);

  // handle messages from App Extension
  safari.self.addEventListener("message", handleMessage, false);

  // handle js events in active page
  window.addEventListener("keypress", handleKeypress, false);
  window.addEventListener("mousedown", handleMouseDown, false);
  window.addEventListener("mouseup", handleMouseUp, false);

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
      ? expandModifiers(received.modifiers)
      : { ctrl: false, alt: false, shift: false, cmd: false },
    sourceLanguage: received.sourceLanguage,
    targetLanguage: received.targetLanguage,
    instantTranslation: received.instantTranslation || false,
    confirmInstantTranslation: received.confirmInstantTranslation || false,
  };
  console.debug(settings);
}

function translationErrorHandler(message: UpstreamError) {
  if (message.id !== window.location.href) return;
  showError(message.error);
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
  showTranslation(args);
}

function handleKeypress(keyboardEvent: KeyboardEvent): void {
  // Check if shortcut key is properly configured
  const { keyCode } = settings;
  if (!keyCode) return;

  const kbdKeyCode = keyboardEvent.key.toUpperCase().charCodeAt(0);

  const isValidModifiers = matchModifiers(settings.modifiers, keyboardEvent);
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

// handle mousedown event to manage panel
function handleMouseDown(e: MouseEvent): void {
  // return if the clicked element is one of the panel's children
  if (isElementPanelChildren(<HTMLElement>e.target)) return;

  // cleanup panel
  removePanel();
}

// handle mouseup event for instant translation
function handleMouseUp(e: MouseEvent): void {
  // return if the clicked element is one of the panel's children
  if (isElementPanelChildren(<HTMLElement>e.target)) return;

  // return if the element is textarea or input
  const activeElement = document.activeElement?.tagName.toLowerCase();
  if (
    activeElement &&
    (activeElement === "textarea" || activeElement === "input")
  )
    return;

  // return if instant translation is disabled
  if (!settings.instantTranslation) return;

  if (settings.confirmInstantTranslation) {
    if (!getSelectedText()) return;
    showConfirmButton(() => {
      performTranslation();
    }, e.pageX);
  } else {
    performTranslation();
  }
}

function performTranslation(): void {
  const selectedText = getSelectedText();
  if (!selectedText) return;

  const language = to1[franc(selectedText, { minLength: 1 })];
  console.log("detected language", language);

  // prevent translation if all of conditions are met
  // - instant translation is enabled
  // - detected language is equal to target language
  const prevent =
    settings.instantTranslation &&
    language !== undefined &&
    language === settings.targetLanguage;
  if (prevent) return;

  showIndicator();

  safari.extension.dispatchMessage(RequestMessageType.Translate, {
    text: selectedText,
    id: window.location.href,
  });
}

function getSelectedText(): string | undefined {
  const selection = window.getSelection();
  if (!selection) return undefined;

  const selectedText = selection.toString();

  if (selectedText && selectedText !== "\n") {
    return selectedText;
  }
}

init();
