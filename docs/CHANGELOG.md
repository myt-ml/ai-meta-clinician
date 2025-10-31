# Changelog

## 2025-10-31 — Mayo Clinic UI overhaul

### Added

- Design tokens in `globals.css` (primary, text, border, alert, subtle backgrounds)
- Base typography: Arial stack, 16px base size, 1.5 line-height
- Token-backed utility classes: `text-primary`, `bg-subtle`, `border-subtle`, `text-alert`, `bg-alert`, `border-alert`

### Changed

- Header simplified: removed decorative heart, left-aligned title/subtitle
- Navigation restructured: right-aligned Language, History, and Screening
- Welcome prompts restyled as suggestion chips with + icon
- Emergency footer: calm alert palette and clickable tel: links for 911/988
- Primary actions: solid Mayo blue for buttons; toned down gradients
- SVG icons: explicit width/height + `flex-shrink-0` to prevent oversized icons

### Accessibility

- Risk alert uses `role="alert"` with `aria-live="assertive"`; decorative icons aria-hidden
- Send icon and other decorative SVGs marked `aria-hidden="true"`
- Language dropdown: `aria-haspopup`, `aria-expanded`, `aria-controls`; `role=listbox` and `role=option`
- PHQ-9 modal: `role=dialog`, `aria-modal`, `aria-labelledby`; close button labeled

### Notes

- The previous control bar was removed to reduce cognitive load; core actions remain accessible in the header and input area.
- Color tokens align with Mayo Clinic’s trusted palette for a professional, compassionate feel.
