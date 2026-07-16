import { es } from "./locales/es.locale";
import { en } from "./locales/en.locale";

/**
 * i18n liviano sin dependencias: los mensajes de error viajan como claves
 * (`errors.INVALID_CREDENTIALS`) y el error handler los resuelve al idioma
 * del request (cabecera `Accept-Language`). Default y fallback: español.
 *
 * Para agregar un idioma: crear `locales/<lang>.locale.ts` (tipado con
 * `TranslationDict`) y sumarlo al mapa `dictionaries`.
 */
const dictionaries = { es, en } as const;

export type Lang = keyof typeof dictionaries;

export const DEFAULT_LANG: Lang = "es";

const isSupported = (lang: string): lang is Lang => lang in dictionaries;

/**
 * Resuelve el idioma desde `Accept-Language`. Variantes regionales como
 * `es-AR` o `en-US` resuelven al idioma base; no soportado → español.
 */
export const resolveLang = (acceptLanguage?: string): Lang => {
    if (!acceptLanguage) return DEFAULT_LANG;

    const candidates = acceptLanguage
        .split(",")
        .map((part) => part.split(";")[0].trim().toLowerCase().split("-")[0]);

    for (const candidate of candidates) {
        if (isSupported(candidate)) return candidate;
    }
    return DEFAULT_LANG;
};

/** Indica si un mensaje es una clave de traducción (y no un texto literal). */
export const isTranslationKey = (message: string): boolean =>
    message.startsWith("errors.") || message.startsWith("mail.");

/**
 * Traduce una clave con puntos (`errors.NOT_FOUND`) al idioma pedido,
 * interpolando placeholders `{param}`. Una clave desconocida se devuelve tal cual.
 */
export const t = (key: string, lang: Lang = DEFAULT_LANG, params?: Record<string, string | number>): string => {
    const dict: Record<string, unknown> = dictionaries[lang];

    const value = key.split(".").reduce<unknown>((node, part) => {
        if (node && typeof node === "object" && part in node) return (node as Record<string, unknown>)[part];
        return undefined;
    }, dict);

    if (typeof value !== "string") return key;

    if (!params) return value;
    return value.replace(/\{(\w+)\}/g, (match, name: string) =>
        name in params ? String(params[name]) : match,
    );
};
