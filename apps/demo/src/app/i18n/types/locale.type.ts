import type { SUPPORTED_LOCALES } from '../constants/locale.constants';

/** Локаль сайта: `ru` или `en` — список в `locale.constants.ts`. */
export type Locale = (typeof SUPPORTED_LOCALES)[number];
