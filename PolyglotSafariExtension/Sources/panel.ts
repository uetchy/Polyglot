import Mustache from "mustache";
import { getSelectionBoundingRect, isDescendant } from "./dom";

const PANEL_ID = "polyglot__panel";
const INDICATOR = `<div class="polyglot__inner"><div class="polyglot__loader">Loading</div></div>`;
const CONFIRM_BUTTON = `<div class="polyglot__inner">
  <button class="polyglot__confirm-button">
    <img alt="Translate" src="${safari.extension.baseURI}icon.png" />
  </button>
</div>`;

let isPanelOpen = false;

export function isElementPanelChildren(dom: HTMLElement) {
  const panel = document.getElementById(PANEL_ID);
  if (!panel) return false;

  return isDescendant(panel, dom);
}

export function showIndicator() {
  showPanel(INDICATOR);
}

export function showConfirmButton(
  onClick: ((ev: MouseEvent) => any) | null,
  cursorX: number
) {
  showPanel(CONFIRM_BUTTON, {
    onClick,
    style: { left: cursorX + "px" },
  });
}

export function showError(message: string) {
  const args = {
    message,
  };
  const result = Mustache.render(
    `
  <div class="polyglot__inner">
  <div class="polyglot__section">
    {{{message}}}
  </div>
  </div>`,
    args
  );
  showPanel(result);
}

interface TranslationParams {
  sourceLanguage: string | null;
  translation: string;
  transliteration: string;
  sourceTransliteration: string;
  synonyms: { pos: string; entries: string[] }[] | null;
}
export function showTranslation(args: TranslationParams) {
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

export function removePanel() {
  isPanelOpen = false;
  const panel = document.getElementById(PANEL_ID);
  if (panel) {
    panel.remove();
  }
}

// Show panel with given text
export function showPanel(
  content: string,
  {
    style = {},
    onClick = null,
  }: {
    style?: Partial<CSSStyleDeclaration>;
    onClick?: ((ev: MouseEvent) => any) | null;
  } = {}
): void {
  if (isPanelOpen) removePanel();

  const bounds = getSelectionBoundingRect();
  if (bounds === undefined) return;

  const el = document.createElement("div");
  el.innerHTML = content;
  el.id = PANEL_ID;
  el.style.left = bounds.left + "px";
  el.style.top = bounds.bottom + "px";
  el.onclick = onClick;

  for (const key in style) {
    el.style[key] = style[key]!;
  }

  document.body.insertBefore(el, document.body.firstChild);
  isPanelOpen = true;
}
