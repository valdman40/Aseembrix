import eng from './eng';
import heb from './hebrew';

const translations: { [lang: string]: { [code: string]: string } } = {
    en: eng,
    he: heb,
};

type Language = 'en' | 'he';

function getText(key: string): string {
    const lang = localStorage.getItem('lang') as Language || 'en';
    if (!translations[lang]) {
        console.warn(`Language ${lang} not supported. Falling back to English.`);
        return translations.en?.[key] || key;
    }
    return translations?.[lang]?.[key];
}

function setLanguage(lang: Language) {
    if (translations[lang]) {
        localStorage.setItem('lang', lang);
    } else {
        console.warn(`Language ${lang} not supported. Falling back to English.`);
        localStorage.setItem('lang', 'en');
    }
}

export { getText, setLanguage, Language };