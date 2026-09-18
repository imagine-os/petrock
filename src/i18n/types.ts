/** English is primary. Spanish (or any other language) is optional and falls back to English. */
export type Lang = 'en' | 'es';
export type StringEntry = string | { en: string; es?: string };
export type StringTable = Record<string, StringEntry>;
