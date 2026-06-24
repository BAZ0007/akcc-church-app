# /add-language

Scaffold a new locale and list all strings that need translation.

**Usage:** `/add-language <locale-code>`  
Example: `/add-language jv` (Kachin/Jinghpaw)

## Steps

1. Copy `src/i18n/dictionaries/en.json` to `src/i18n/dictionaries/<locale>.json`.
2. Replace every string value with `"TODO: translate"` as a marker.
3. Add the locale to `src/i18n/config.ts` in the `locales` array.
4. Update the language toggle in `src/components/layout/AppBar.tsx` to show the new locale (remove the "coming soon" label if present).
5. Print a list of all keys that need translation so the admin/translator can work through them.

## Notes
- All user-facing strings already live in `src/i18n/dictionaries/en.json` (non-negotiable from day one).
- No code changes required to add a language — only a new dictionary file and config update.
- The Kachin (Jinghpaw) locale will be `jv` — check with the church before finalising the code.
