---
name: a11y-check
description: Audit accessibility (screen reader support, color contrast, touch target size, dynamic text scaling) for the SleepFlow React Native/Expo app. Use when asked to check, audit, validate, review, or improve accessibility, a11y, or screen reader support for this app.
tools: Read, Glob, Grep, Bash, Edit
---

# Accessibility audit — SleepFlow

Audits this app for screen reader support (VoiceOver/TalkBack), color contrast,
touch target size, and dynamic text scaling. Two passes: a static code scan
(always run) and an automated DOM audit via the web build (run when a dev
server can be started).

**Report first.** Only edit files if the user has already asked for fixes, or
approves the findings you present. When applying fixes, prefer additive
`accessibility*` props over restructuring components.

## Phase 1 — Static scan

### 1a. Interactive elements without accessible names

```bash
grep -rn "Pressable\|TouchableOpacity\|TouchableHighlight" src/components src/screens
```

For each match, open the file and check:

- Does it have `accessibilityRole` (`"button"`, `"link"`, `"checkbox"`, etc.)?
  A `Pressable` with no role reads as an unlabeled generic element to a screen
  reader, not as an interactive control.
- Does it (or a labeled child `Text`) give the screen reader something
  meaningful to announce? A `Pressable` wrapping only an emoji or icon (e.g.
  the tab icons in `src/navigation/MainTabs.tsx`, the moon badge in
  `src/screens/LoginScreen.tsx`) needs an explicit `accessibilityLabel` —
  screen readers do not reliably announce emoji glyphs as words.
- Toggle-style controls need `accessibilityState`. `src/components/Chip.tsx`
  is the clearest example: it renders a `selected` boolean visually (border/
  fill color) but never exposes it via `accessibilityRole="button"` +
  `accessibilityState={{ selected }}` — a screen reader user can't tell
  selected chips from unselected ones.
- `src/components/StatusBadge.tsx` and `src/components/AppButton.tsx`
  (`loading` state) should be checked the same way: is state conveyed only
  through color, or also through something a screen reader announces?

### 1b. Form fields

```bash
grep -n "TextInput" src/components/FormField.tsx
```

`FormField` renders a visual `<Text>` label above the `TextInput`, but visual
proximity does not create a screen-reader association the way HTML's
`<label for>` does. Check whether the `TextInput` sets `accessibilityLabel`
(defaulting to the `label` prop) — if not, screen reader users hear "text
field, edit box" with no indication of which field it is. This affects every
screen that uses `FormField`: `LoginScreen`, `RecordScreen`.

### 1c. Touch target size

```bash
grep -rn "height:\|paddingVertical:\|width:" src/components
```

iOS Human Interface Guidelines and Android Material both recommend a minimum
44×44pt / 48×48dp touch target. Check components with small fixed dimensions
against that — `Chip.tsx`'s `paddingVertical: 8` with `typography.caption`
text is worth measuring explicitly (rendered text height + padding), since
it's easy to land under 44pt.

### 1d. Dynamic text scaling

```bash
grep -rn "allowFontScaling" src
```

Flag any `allowFontScaling={false}`. It blocks the OS-level "larger text"
accessibility setting from working, which should only ever be disabled
deliberately (e.g. a fixed-size icon glyph), never on body copy.

### 1e. Color contrast

Read `src/theme/tokens.ts` (`light` and `dark` palettes). For each foreground/
background pair actually used for text or icons — `primaryInk`/`page`,
`secondaryInk`/`page`, `mutedInk`/`page`, `primaryInk`/`card`, white text on
`brand` (buttons), `brand`/`brandSoft` (Chip selected state), each
`statusColors` entry against the surface it renders on — compute the WCAG
contrast ratio and flag anything below **4.5:1** for normal text or **3:1**
for large text (≥18pt / ≥14pt bold) and UI components (borders, icon-only
controls).

Contrast ratio formula (apply this exactly, don't estimate by eye):

```
for each channel c in {R, G, B} (0-255):
  c_srgb = c / 255
  c_lin  = c_srgb / 12.92                          if c_srgb <= 0.03928
         = ((c_srgb + 0.055) / 1.055) ^ 2.4         otherwise

L = 0.2126 * R_lin + 0.7152 * G_lin + 0.0722 * B_lin

ratio = (L_lighter + 0.05) / (L_darker + 0.05)
```

A short Node one-liner is fine for the arithmetic — don't do this by hand:

```bash
node -e "
function lum(hex){
  const c = hex.replace('#','').match(/.{2}/g).map(h=>parseInt(h,16)/255)
    .map(v => v <= 0.03928 ? v/12.92 : ((v+0.055)/1.055)**2.4);
  return 0.2126*c[0] + 0.7152*c[1] + 0.0722*c[2];
}
function ratio(a,b){
  const [l1,l2] = [lum(a), lum(b)].sort((x,y)=>y-x);
  return ((l1+0.05)/(l2+0.05)).toFixed(2);
}
console.log(ratio('#898781','#f9f9f7')); // mutedInk on page, example
"
```

## Phase 2 — Automated DOM audit (optional, deeper)

`react-native-web` renders real DOM, so `axe-core` can audit it directly
through the web build. Skip this phase if a dev server can't be started in
the current environment; the static scan still stands on its own.

```bash
npx expo start --web --port 8081 &
timeout 30 bash -c 'until curl -sf http://localhost:8081 >/dev/null; do sleep 1; done'
```

Drive it with Playwright + `@axe-core/playwright` (installed on demand, not
as a project dependency — this is an audit tool, not a runtime one):

```bash
npx --yes playwright install chromium
node -e "
const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8081');
  await page.waitForSelector('text=SleepFlow');

  // Login screen audit
  const loginResults = await new AxeBuilder({ page }).analyze();
  console.log('LOGIN', JSON.stringify(loginResults.violations, null, 2));

  // Log in (any email 4+ chars / password 4+ chars) to reach the authenticated screens
  await page.fill('input[placeholder=\"voce@email.com\"]', 'a11y@teste.com');
  await page.fill('input[placeholder=\"********\"]', '1234');
  await page.click('text=Entrar');
  await page.waitForTimeout(1500);

  const homeResults = await new AxeBuilder({ page }).analyze();
  console.log('HOME', JSON.stringify(homeResults.violations, null, 2));

  await browser.close();
})();
"
```

Repeat the login → navigate → `AxeBuilder(...).analyze()` pattern for
Histórico, Registro, and Perfil (each is a tab in `MainTabs`). Requires the
backend (`server/`) running too, since Home/Histórico fetch data on load —
start it the same way described in `README.md` if it isn't already up. Kill
the port 8081 listener when done (`lsof`/`netstat` + `kill`, same as any other
background dev server started during a session).

## Report format

Group findings by screen, most severe first:

- **Critical** — a screen reader user cannot complete a core flow (unlabeled
  primary action, form field with no accessible name).
- **Moderate** — contrast below WCAG AA, missing state announcement (e.g.
  Chip's `selected`) , touch target under the recommended minimum.
- **Minor** — `allowFontScaling={false}` on non-icon text, missing
  `accessibilityHint` on non-obvious actions.

For each finding: file path + line, what's missing, and the concrete prop(s)
that would fix it (e.g. `accessibilityRole="button" accessibilityLabel="Selecionar posição: de lado"`).
