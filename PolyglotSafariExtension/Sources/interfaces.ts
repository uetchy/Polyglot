import { Modifiers } from "./modifiers";

export interface Settings {
  keyCode: number;
  modifiers: Modifiers;
  sourceLanguage: string;
  targetLanguage: string;
  instantTranslation: boolean;
  confirmInstantTranslation: boolean;
}
export interface ReceivedSettings {
  keyCodeUnicode: number;
  modifiers: number;
  sourceLanguage: string;
  targetLanguage: string;
  instantTranslation: boolean;
  confirmInstantTranslation: boolean;
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
export interface ReceivedTranslation {
  sourceLanguage: string;
  translation: string;
  transliteration: string;
  sourceTransliteration: string;
  dictionary: DictionaryItem[];
  synonyms: Synonym[];
  id: string;
}
export interface UpstreamError {
  error: string;
  id: string;
}
export enum RequestMessageType {
  RequestSettings = "getSettings",
  Translate = "translate",
}
export enum ResponseMessageType {
  SettingsReceived = "settingsReceived",
  TranslationReceived = "translated",
  ErrorOccured = "error",
  PerformTranslation = "performTranslation",
}
