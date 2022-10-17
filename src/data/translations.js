import { loadData } from '../libs/kontra.js';
import { config } from './config.js';

const translations = {};
let curLang = 'en';

/**
 * Get the current language translation for a key.
 * @param {String} key - Key to get translation for.
 * @return {String}
 */
export function i18n(key) {
  if (!translations[curLang][key]) {
    return `<____${curLang}:${key}____>`;
  }

  return translations[curLang][key];
}

/**
 * Set the current language and load mod translations for the language.
 * @param {String} lang - Language to set.
 */
export async function setLang(lang) {
  if (translations[lang]) {
    curLang = lang;
    return;
  }

  try {
    translations[lang] = await loadData(`/src/data/translations/${lang}.json`);

    // load mods. mods are only able to create new translations
    // and cannot disable or remove ones
    config.mods.forEach(mod => {
      if (mod.translations && mod.translations[lang]) {
        Object.entries(mod.translations[lang]).forEach(([key, value]) => {
          if (translations[lang][key]) {
            // TODO: report debug

            return;
          }

          translations[lang][key] = value;
        });
      }
    });
  } catch (e) {
    if (config.debug) {
      console.warn(`\nNo translation for lang "${lang}"`);
    }
  }
}
