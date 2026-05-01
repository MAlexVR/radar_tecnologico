/**
 * @deprecated Use the canonical configuration in `src/i18n/request.ts`.
 * This file is kept only because the runtime cannot remove files in this
 * environment; `next-intl/plugin` resolves `src/i18n/request.ts` first.
 *
 * Do not import from this module; it intentionally re-exports the
 * canonical config so any accidental import keeps working.
 */
export { default } from "./i18n/request";
