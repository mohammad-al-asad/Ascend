# Ascend App — Backend Integration Prompts

This document contains 5 self-contained prompts, one per app section, for wiring
`ascend-app` (Expo/React Native, currently 100% local-mock) to the real
`ascend-backend` (FastAPI, MongoDB). Every endpoint, field name, and status code
below was verified against the actual backend source — nothing here is invented.

Give any one prompt to an engineer (or an AI coding agent) on its own; each is
independently actionable. Prompt 0 is shared infrastructure — do it first, once,
regardless of which section you start with.

**Backend base URL (dev):** `http://localhost:8010/api/v1` (adjust host/port per
environment — the real prefix is `/api/v1`, NOT the placeholder
`https://monorail-lagoon-pettiness.ngrok-free.dev/api/v1` currently hardcoded in `baseApi.ts`).

**Response envelope (every endpoint, unless noted as raw binary):**
```json
{ "message": "string", "data": { }, "meta": {} }
```

**Error envelope:** `{ "detail": "string" }` or `{ "detail": { ...structured... } }` at
a non-2xx status. `422` is FastAPI's standard Pydantic validation-error array.

---

## Prompt 0 — Shared infrastructure (do this first)

**Context:** `ascend-app/app/src/redux/api/baseApi.ts` is an empty RTK Query stub:
```ts
export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.ascend-readiness.com/v1",
    prepareHeaders: (headers) => {
      // Mock authorization headers
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: () => ({}),
});
```
It has zero injected endpoints anywhere in the codebase, and `prepareHeaders`
never attaches a real `Authorization` header despite the comment claiming it does.
`ascend-app/app/src/redux/slices/authSlice.ts`'s `User` type (`username`, `userId`,
`role`, `provisionedStatus`, `firstLoginTimestamp`) also has no 1:1 mapping to the
backend's real `UserResponse` shape.

**Task:**
1. Fix `baseApi.ts`: point `baseUrl` at the real backend (`{API_BASE_URL}/api/v1`,
   pull from an env var, don't hardcode). In `prepareHeaders`, read the real access
   token from Redux state (`getState().auth.accessToken` — you'll add this field in
   step 2) and set `Authorization: Bearer ${token}` when present.
2. Rewrite `authSlice.ts`'s `User`/`AuthState` shape to match the backend's real
   `UserResponse` (returned by `GET /auth/me`, and nested as `.user` in
   register/login/refresh responses):
   ```
   id, email, full_name, role, is_active, is_verified,
   onboarding_completed, onboarding_status, onboarding_step,
   day0_daily_checkin_status, created_at, updated_at, last_login_at
   ```
   Add `accessToken: string | null` and `refreshToken: string | null` to
   `AuthState` (the backend's token response is `{ access_token, refresh_token,
   token_type: "bearer", remember_me, user }`). Persist both tokens to
   `AsyncStorage`/`SecureStore` on login/register/refresh; rehydrate on app start;
   clear on `logout`.
3. Add a real 401 → refresh-token → retry interceptor in `baseApi.ts` (RTK Query's
   `baseQueryWithReauth` pattern), calling `POST /auth/refresh` with the stored
   `refresh_token`. On refresh failure, dispatch `logout()` and redirect to
   `/auth/signin`.
4. Inject endpoints per section using `baseApi.injectEndpoints(...)` in separate
   files (e.g. `redux/api/authApi.ts`, `redux/api/dashboardApi.ts`, etc.) — one file
   per backend module, matching the prompts below.

**Do not decide unilaterally:** whether tokens live in `AsyncStorage` (simpler) or
`expo-secure-store` (more secure, recommended for a DoD-adjacent app) is a real
product decision — ask before picking, default to `expo-secure-store` if no answer
is available given the OPSEC-sensitive nature of this app.

---

## Prompt 1 — Sign In (auth)

**Screens:** `app/src/app/auth/signin.tsx`, `signup.tsx`, `forgot-password.tsx`,
`privacy.tsx`, and the non-CAC part of `app/src/app/(tabs)/profile/activation.tsx`
(its CAC/PIV/EDIPI section is a separate, explicitly out-of-scope subsystem —
do not touch it).

All endpoints below are under `/auth` (i.e. `{base}/api/v1/auth/...`), require
**no** auth token except `GET /me`, and are defined in
`ascend-backend/app/modules/auth/routes.py`.

### 1. `signin.tsx`
Currently: `handleEmailSignIn` dispatches a fully fake `loginSuccess` with no
password check and no API call at all.

Replace with `POST /auth/login`:
- Request: `{ email: string, password: string (min 8, max 128), remember_me?: boolean }`
- Success (200) → `{ access_token, refresh_token, token_type: "bearer", remember_me, user: <UserResponse> }` — store tokens + user via the `authSlice` from Prompt 0, then `router.replace(...)` based on `user.onboarding_completed` (see Prompt 2 for the correct landing route).
- Errors: `401 "Invalid email or password."` (show inline, do not reveal which field), `403 "This account is inactive."`, `503 "Database is temporarily unavailable. Please try again shortly."` (show a retry-friendly banner).
- There is no "remember me" checkbox on the current screen — either add one bound to `remember_me`, or omit the field (defaults to `false` server-side). Ask which before assuming.
- Google sign-in button currently just calls the same fake handler — there is no real OAuth backend for this. Leave it disabled or hide it; do not fabricate an OAuth flow.

### 2. `signup.tsx`
Currently: same fake `loginSuccess` dispatch, ignores `fullName`/`password` entirely, no navigation actually happens despite the "Redirecting..." copy.

Replace with `POST /auth/register` (status 201):
- Request — `RegisterRequest`: `{ full_name: string (2-120 chars), email: string, password: string (8-128 chars, MUST contain ≥1 uppercase + ≥1 digit — validate client-side before submit and show the rule inline), role?: string }`. Leave `role` unset — it defaults to Airman server-side; do not add a role picker to this screen.
- Success (201) → same token-response shape as login. Registration logs the user in immediately (no email-verification gate blocks token issuance) — store tokens/user and navigate straight into onboarding (Prompt 2), matching the backend's real `onboarding_completed: false` state.
- Errors: `400 "An account with this email already exists."`, `422` validation errors (surface the password-rule message specifically — currently there's no password-strength UI on this screen at all, add one).
- There is no confirm-password field currently and the backend doesn't require one for register (unlike reset-password, which does) — this is fine as-is, no change needed there.

### 3. `forgot-password.tsx`
Currently: **entirely fake** — all 3 steps are pure local state transitions with zero API calls. The real backend has a genuine, fully-working 3-step flow already built; none of it is wired.

- **Step 1 (email → send code):** call `POST /auth/forgot-password` with `{ email }`. Always returns `200 {}` regardless of whether the account exists (deliberately account-existence-safe — do not add an inline "no account found" error, the backend won't tell you). Advance to step 2 on any 200.
- **Step 2 (OTP):** the 4-digit input already matches the backend's format. Call `POST /auth/verify-reset-code` with `{ email, code: "<concatenated 4 digits>" }`. On success (`200 {}`) advance to step 3. On `400 "Invalid reset code."` or `400 "Reset code has expired."`, show the specific message inline — don't just silently advance like today. Wire "Didn't receive OTP? Try again" to re-call `POST /auth/forgot-password` (currently a no-op).
- **Step 3 (new password):** call `POST /auth/reset-password` with `{ email, code: "<same 4 digits from step 2>", new_password, confirm_password }`. The existing client-side requirements checklist (`hasMinLength`, `hasNumber`, `hasUppercase`, `passwordsMatch`) already matches the server's real rule (uppercase + digit, 8-128 chars) — **use it to actually disable the "Done" button until all pass**, which it currently does not do. Errors: `400 "Passwords do not match."`, `400 "Invalid reset code."`, `400 "Reset code has expired."` (if the code expired between step 2 and step 3, send the user back to step 1 with a message).
- Remove the hardcoded fallback email literal (`mahfuzur.work@gmail.com`) shown in step 2 — that's leaked test data.

### 4. `privacy.tsx`
Pure static informational content — no backend call needed, leave as-is. (If you want it to reflect the real OPSEC notice text rather than hardcoded copy, it's available as `opsec_notice_text` in `GET /auth/screen-config`, but this is optional polish, not a functional gap.)

### 5. `profile/activation.tsx` (non-CAC portion only)
"Request deactivation" button currently only shows a local `Alert` and calls nothing.
Wire it to `POST /users/deactivation-requests` (see Prompt 5, section on Sign-in &
activation — this endpoint belongs to the `/users` module, not `/auth`) with body
`{ reason?: string }`. On `400 "A deactivation request is already pending for this
account."`, show that specific message instead of the generic success alert.

### Known gaps to flag, not fabricate
- `GET /auth/me` exists and returns `UserResponse` — use it on app boot to
  rehydrate `authSlice.user` from a stored access token (don't just trust a stale
  cached user object forever).
- A `POST /auth/change-password` endpoint exists in the service layer but has
  **no route wired to it** on the backend. It is not currently callable — if a
  "change password while logged in" flow is wanted anywhere in the app, that needs
  a backend route added first; do not attempt to hit a nonexistent endpoint.
- `data_use_consent` / `wellness_recommendations_opt_in` / `policy_version_accepted`
  fields exist on the `User` model but are **not exposed by any `/auth` endpoint**.
  They're set via the onboarding consent step instead (`POST /onboarding/consent` —
  see Prompt 2). Don't add a consent call to the sign-in/sign-up screens themselves.
- `POST /auth/resend-verification-code` is real and functional if an email-
  verification resend UI is ever added — not currently present on any screen, no
  action needed unless requested.

### Acceptance checklist
- [ ] Real sign-in with a seeded backend account succeeds and lands on the correct screen based on `onboarding_completed`.
- [ ] Wrong password shows the real 401 message, not a silent success.
- [ ] Sign-up creates a real `User` document (verify via backend admin/DB) and logs in immediately.
- [ ] Forgot-password: request code → real code (check backend logs, since delivery is log-only, not emailed) → verify → reset → sign in with the new password.
- [ ] Deactivation request appears in the backend's real admin queue.

---

## Prompt 2 — Onboarding + Home

**Screens:** `app/src/app/onboarding/index.tsx` (+ its local `questions.json`,
which should be **deleted** once wired — the backend is now the sole source of
truth for questions), `app/src/app/(tabs)/(home)/index.tsx`,
`app/src/app/(tabs)/(home)/checkin.tsx`, `assessments.tsx`, `notifications.tsx`,
`oft.tsx`, and the `app/src/app/(tabs)/checkin.tsx` redirect wrapper (no change
needed there, it just redirects).

Backend modules: `/onboarding`, `/checkins`, `/assessments`, `/oft`,
`/notifications`, `/dashboards`. All require a valid access token; none are
role-gated for the Airman-side reads below (schedule/complete/record endpoints on
assessments/OFT are Admin/SCS-only and out of scope for this operator-facing pass).

### 1. Onboarding flow (`onboarding/index.tsx`)
Replace the local `questions.json` + `authSlice` onboarding reducers entirely with:

- **On mount:** `GET /onboarding/intro` → use `welcome_name`, `intro_body`,
  `cta_label`, `privacy_summary`, `consent_required_label`,
  `consent_required_description`, `optional_opt_in_label`,
  `optional_opt_in_description`, `policy_version`, `trace_id`,
  `opsec_notice_text` for the Welcome + Consent steps (replacing the hardcoded
  `"Capt. Lin"`, static policy-version string, and static trace-ID literal
  currently in the component).
- **Consent step submit:** `POST /onboarding/consent` with
  `{ data_use_consent: boolean, wellness_recommendations_opt_in?: boolean,
  policy_version: string }` (`policy_version` = the value from `intro`). `400` if
  `data_use_consent` is `false` — block advancing and show the error, matching the
  existing UI's disabled-continue behavior but now server-enforced too.
- **Fetch questions:** `GET /onboarding/questions` → 20 real questions
  (`O1`–`O20`). Map each `OnboardingQuestionResponse` into the same UI shape the
  screen already renders (`category`, `question`, `description`, `options`,
  `follow_up`), but note real field/value differences from the old local JSON:
  - `follow_up.type` values are **underscored** (`severity_sheet`, `toggle_sheet`,
    `role_sheet`, `text_sheet`), not hyphenated as in the old mock JSON.
  - Real option label text for Q3/Q16 uses a plain hyphen (`"Yes - minor"`), not an
    em-dash.
  - Use `question.answered` / `question.current_answer` to pre-fill state if the
    user backgrounds and resumes the flow — the backend already tracks per-question
    completion, don't reinvent that client-side.
- **Per-question submit:** `POST /onboarding/answer` with
  `{ question_id: number, answer: string | string[], follow_up_answer?: string | string[] }`
  on every "Next question" tap (not just at the end) — the backend upserts, so
  re-answering is safe. Handle `400`s for invalid options / missing required
  follow-up text by re-showing the relevant input with the server's message.
  Use the response's `next_question_id` to drive navigation instead of a purely
  local `currentStep + 1` counter — this keeps the client in sync if a question is
  ever reordered server-side.
- **Completion step:** call `POST /onboarding/baseline/complete` (no body) instead
  of just dispatching a local `completeOnboarding()`. On `400` with
  `missing_question_ids`, route the user back to the first missing question rather
  than showing the "Readiness baseline set" screen. On success, use the response's
  real `baseline_ops_score`, `baseline_band`, and `component_scores` to show an
  actual computed result on the completion screen (currently it shows generic
  static congratulatory text with no real numbers) — then navigate to
  `/(tabs)`.
- Delete `roleToggles` local state — Q18's real answer options
  (`Nutritionist`/`Mental Performance`/`Chaplain`/`SCS`, SCS always locked-on) come
  from the question's own `options` array now, not a separate hardcoded object.

### 2. Home dashboard (`(tabs)/(home)/index.tsx`)
Currently: a fabricated readiness-score formula built from raw onboarding answer
strings, hardcoded driver values, and a hardcoded SVG sparkline. Replace entirely
with `GET /dashboards/home`:
```
greeting, subtitle, date_label,
current_ops: { ops_score, ops_band, band_meaning, confidence_level, trend_delta, last_updated_at },
todays_checkin: { already_completed_today, title, body, cta_label, total_questions },
driver_trends: [{ readiness_component, signal_label, current_score, stale, trend_points }]  (5 items),
component_scores: {...},
today_for_you: {...} | null,
support_preview: [{ key, label, description, availability_status }],
upcoming: [{ key, title, subtitle, tag }],
last_updated_label
```
- Radar chart: feed it `component_scores` directly — stop computing
  `physicalVal`/`sleepVal`/etc. from raw onboarding answers client-side (that logic
  is also currently broken for nutrition, since it checks an answer string that no
  real option ever produces).
- "CURRENT OPR" card: use `current_ops.ops_score`, `.ops_band`,
  `.confidence_level`, `.last_updated_at` — drop the hardcoded "Medium confidence" /
  "Updated 14 min ago" / static "BAND: Monitor" text.
- "Today's Check-in" card: use `todays_checkin.already_completed_today` to decide
  whether the card shows "start" vs "already done today" state — this is a real,
  currently-missing distinction. Route its button to the daily check-in flow (see
  §3 below), **not** back into `/onboarding` as it does today.
- Driver trend cards: iterate the real `driver_trends` array (5 items — the mock
  currently only shows 3, dropping Nutritional/Spiritual) and use each item's real
  `trend_points` for the sparkline instead of a static path string. Show a
  "stale" indicator when `stale: true`.
- "Today for you" card: bind to `today_for_you` (null-safe — hide the card
  entirely when null, don't show placeholder copy). Wire "Dismiss" to something
  real once a dismiss endpoint exists — none does yet, so either omit the button or
  hide it for now rather than leaving a dead no-op `Pressable`.
- "Talk to your team" cards: use `support_preview` (already reflects each
  pathway's real availability). Wire "Open support" to `router.push("/support")`
  (currently has no handler at all).
- "Upcoming" list: use the real `upcoming` array (`key`, `title`, `subtitle`,
  `tag`) instead of 3 hardcoded rows — map `key` to the same 3 routes already used
  (`/checkin`, `/oft`, `/assessments`).
- Detail bottom sheet (opened from a driver card): replace with
  `GET /dashboards/drivers/{component}` (URL-encode `component`, one of the 5 full
  `readiness_component` strings, e.g. `"Physical Readiness"`) →
  `{ current_score, score_band, trend_points, trend_direction, delta_7d, delta_30d,
  try_this: string[], influences: [{key,title,detail}], support_cta_label,
  support_route }`. **The backend deliberately has no "peer cohort %" field** — drop
  that stat card rather than fabricating a number; the other 3 grid stats
  (trend/7dΔ/30dΔ) are real. Wire "Talk to my PT/IM" to `support_route` via
  `router.push`, not the current bare `alert()`.

### 3. Daily check-in
There is currently **no distinct daily check-in screen** — both `(home)/checkin.tsx`
and the "Today's Check-in" card route into `/onboarding`, which is wrong; daily
check-in is a separate real flow (`D1`–`D6`, distinct from the 20-question
onboarding baseline). Build a new screen (or adapt the existing question-list UI
into a reusable component shared with onboarding) that:
- Loads `GET /checkins/daily` → `{ is_day_zero, already_completed_today,
  questions: DailyCheckinQuestion[6], answered_questions, total_questions: 6 }`.
  If `already_completed_today`, show a "come back tomorrow" state instead of the
  form.
- Submits all 6 at once via `POST /checkins/daily/submit` with
  `{ answers: [{ question_id, answer, follow_up_answer? }] }` (D6 requires a
  `follow_up_answer` text, ≤120 chars — validate client-side to match). On
  success, show the returned `current_ops_score`/`current_ops_band` (a real
  immediate result) before returning to Home.

### 4. Weekly check-in gate (`(home)/checkin.tsx`, currently "CHECK-IN LOCKED")
Replace the entirely-static screen (including the literal leaked field-name string
`"first_use_state.weekly_cadence"` shown on line 67) with `GET /checkins/weekly/gate`
→ `{ locked, cadence_label, today, days_until_open, next_open_at,
cadence_start_date }`. When `days_until_open === 0`, offer a real weekly
check-in flow via `GET /checkins/weekly` (10 questions, `W1`-`W10`) →
`POST /checkins/weekly/submit`, same `{answers:[{question_id,answer}]}` shape as
daily (no follow-up on weekly questions). Reuse the same pattern for
`/checkins/monthly` if a monthly screen is also wanted (backend already supports
it identically).

### 5. Assessments (`(home)/assessments.tsx`)
Replace the hardcoded 5-item array with `GET /assessments/me` →
`{ completed: AssessmentResponse[], completed_total, active: AssessmentResponse[] }`.
Each item already has `display_title` and `result_band_label` server-computed
strings that map directly onto the existing card layout — no client-side label
lookup needed. Wire "View all" (currently a bare `alert()`) to show `active` +
paginate/scroll `completed` instead of a fixed 5.

### 6. Notifications (`(home)/notifications.tsx`)
Replace all 3 hardcoded arrays with `GET /notifications?category=&unread_only=`
→ `{ total_count, unread_count, category_counts, notifications: NotificationDTO[] }`.
Group client-side by real `created_at` (today/yesterday/earlier) instead of 3
separate hardcoded arrays. Wire each row's tap to `POST
/notifications/{id}/read`, and "Mark all read" to `POST
/notifications/read-all` — both currently no-op `Pressable`s. Remove the
always-shown "You're all caught up" empty state; show it only when
`total_count === 0`.

### 7. OFT (`(home)/oft.tsx`)
Replace the 3 hardcoded cadence rows with `GET /oft/me` →
`{ current_status, latest_pass_fail, latest_test_date, items_passed, items_total,
next_scheduled_date, next_scheduled_relative, annual_test_count }`. Note
`next_scheduled_relative` already comes pre-formatted (e.g. `"in 38 days"`) — don't
recompute a day-count client-side.

### Known gaps to flag, not fabricate
- `dashboards/drivers/{component}` has no "peer cohort %" or wearable-derived
  "activity band" — the mock sheet shows these; drop them rather than inventing
  numbers.
- No pull-to-refresh handler exists on Home today despite the footer claiming one
  — wire actual pull-to-refresh (re-trigger the `GET /dashboards/home` query) or
  remove the claim.

### Acceptance checklist
- [ ] Completing onboarding end-to-end produces a real `OpsSnapshot` and a non-mock score shown on the completion screen.
- [ ] Home screen's OPS score matches what `GET /dashboards/home` actually returns after a real check-in submit.
- [ ] Daily check-in correctly blocks a second same-day submission with the real "already submitted" error.
- [ ] Notifications mark-as-read persists across an app restart (i.e., it's server state, not local).

---

## Prompt 3 — Trends

**Screens:** `app/src/app/(tabs)/trends/index.tsx`, `review.tsx`, `report.tsx`.
Backend module: `/dashboards` (same module as Home in Prompt 2).

### 1. `trends/index.tsx`
Replace with `GET /dashboards/trends?days={7|30|90}` (wire the existing
`selectedTimeRange` pill state, currently inert, to this query param — it's the
one real gap here, everything else about the pills' UI is already correct):
```
range_days, period_label,
ops_series: [{ date, ops_score, ops_band, confidence_level }],
component_series: [{ readiness_component, signal_label, points:[{date,score,stale}] }],
driver_overview: [{ readiness_component, signal_label, current_score, weight, has_daily_trend, trend_points, delta_vs_prior_period }],
ops_history: [{ date, ops_band, dominant_driver }]  (30 entries, fixed),
next_windows: [{ key, title, subtitle, tag }],
public_aggregate: { available, min_cohort_size, reason },
last_updated_label
```
- Driver Overview cards: bind score + sparkline (`trend_points`) per item in
  `driver_overview` — this replaces all 5 hardcoded scores (`82/76/69/74/82`) and
  the static SVG path strings. Spiritual's `has_daily_trend: false` explains why it
  currently has a progress bar instead of a sparkline — keep that distinction, it's
  real, not a UI inconsistency to "fix."
- "▲ vs prior period" label: compute from `delta_vs_prior_period` per driver (or
  an aggregate), replacing the static arrow text.
- OPS History grid: use real `ops_history` (30 real days with real `ops_band` per
  day) instead of the fixed `[0,1,2,3,0,1,3,0,2,0,1,3]` array reused identically
  for all 3 rows. Map `ops_band` → the existing 4-color `opsGridColors` palette
  (`Ready`/`Monitor`/`Caution`/anything-else, per your existing color scheme) and
  render 1 row (not 3 fixed label rows), or redesign the "Ready/Monitor/Caution"
  3-row grouping around real per-day bands — flag this to design before assuming
  which. Timeline labels ("30d ago"/"15d ago"/"Today") can stay computed from
  `range_days`.
- Next windows card: use `next_windows` (already the right shape: `key`, `title`,
  `subtitle`, `tag`) instead of 2 hardcoded rows.
- Public aggregate callout: gate visibility/copy on `public_aggregate.available`
  and show `public_aggregate.reason` when unavailable (e.g. cohort too small),
  instead of an unconditional static "Open full wellness report" callout.
- Footer "Last updated 14 min ago": use `last_updated_label` directly (already
  server-formatted).

### 2. `review.tsx` (Monthly Review)
Replace with `GET /dashboards/monthly-review`:
```
review_status ("draft" — real, always draft today, no sign-off flow exists),
period_label, period_start, period_end, generated_at,
thirty_day_recap: <same shape as driver_overview above>,
average_ops_score, average_ops_delta,
daily_checkins: { days_logged, days_total, cadence_percent },
workout_summary: {...},
oft_status: {...},
provider_notes: [{ sender_name, sender_role, body, created_at }]
```
- 30-day recap card: bind to `thirty_day_recap` (replaces the hardcoded
  `RECAP_ITEMS` array of 5 fixed trend/score pairs).
- "In this review" checklist: `daily_checkins` gives real cadence
  (`"{days_logged} of {days_total} days · {cadence_percent}% cadence"`);
  `workout_summary`/`oft_status` give the workout and OFT rows. **There is no
  backend field for "Medical records added" or a named signing PT/IM** — the
  current mock's 5th checklist row (medical records) and the specific "PT Knox
  (USR-7101)" signer name have no real data source. Drop that row, or replace it
  with `provider_notes` (real free-text notes from providers, a different but
  genuine concept) — don't invent a medical-records-review count.
- `review_status` is always `"draft"` right now — if the UI implies a
  locked/published state ("Locked-on-publish notice" card), be honest that no real
  publish/lock workflow exists yet; keep that card but don't claim data backs a
  state transition that doesn't exist server-side.

### 3. `report.tsx` (Wellness Report)
Replace with `GET /dashboards/wellness-report`:
```
period_label, average_ops, average_ops_delta, band, band_narrative,
driver_summary: [{ readiness_component, signal_label, average_score }],
standout_insights: [{ key, severity ("positive"|"watch"|"notable"), title, body }]  (0-3 items, real pattern detection),
footer_note
```
- OPS score card + band block: bind directly, replacing hardcoded `76`/`"+3 vs
  prior 30d"`/`"Monitor"`.
- Driver summary card: bind `driver_summary` (compute the progress-bar fill
  client-side as `average_score/100`, same as the existing `fillPercentage` logic
  — that part of the code doesn't need to change, just its data source).
- "What stands out": render `standout_insights` **as returned** — this is a real
  0-to-3-item list (not always exactly 3 like the current hardcoded `HIGHLIGHTS`
  array), and severity values are real (`positive`/`watch`/`notable`, not the
  mock's ad-hoc green/amber/red convention) — map severity → color, don't assume a
  fixed count of cards.

### Known gaps to flag, not fabricate
- **No PDF/CSV export exists for an individual's own trends, monthly review, or
  wellness report** — every export/download endpoint in the backend is
  Admin/leadership-facing only. If a "download report" button is wanted on these
  screens, that requires a new backend endpoint; don't point the UI at an
  admin-only export route (it will 403 for a normal Airman) and don't fabricate a
  client-side PDF.
- The `/dashboards/unit-report` endpoint (k-anonymity-gated unit aggregate) exists
  but isn't the target of the current "Open full wellness report" callout on
  `trends/index.tsx` — that callout's real target is `/dashboards/wellness-report`
  (i.e., the `report.tsx` screen), not the unit-report endpoint. Don't conflate
  the two.

### Acceptance checklist
- [ ] Switching 7d/30d/90d actually changes the data shown, not just the label.
- [ ] A driver with no recent data shows a real "stale"/"unavailable" state instead of a fabricated number.
- [ ] Monthly review's cadence percentage matches the user's real daily-checkin submission count.
- [ ] Wellness report's standout-insights count varies (0-3) rather than always showing 3 cards.

---

## Prompt 4 — Support

**Screens:** `app/src/app/(tabs)/support/index.tsx`, `chat.tsx`, `request.tsx`.
Backend modules: `/support` (support requests + team roster) and `/messaging`
(1:1 chat + OPSEC scan). Both require an access token; `/support/requests/assigned`
and its status-update route are Admin/SCS/PT-IM only and out of scope here.

### 1. `support/index.tsx` ("My team")
Replace with `GET /support/team` → `{ pathways: TeamPathwayStatus[] }` (5
entries always present, one per pathway):
```json
{
  "pathway_key": "SCS" | "PT/IM" | "Nutritionist" | "Mental Performance" | "Chaplain",
  "label": "...", "role_title": "...", "description": "...",
  "always_available": true|false,
  "status": "locked_on" | "enabled" | "disabled",
  "messaging_available": true|false,
  "provider": { "user_id": "...", "name": "..." } | null,
  "follow_up_status": {...} | null,
  "assigned_action": {...} | null
}
```
- Replace the 5 hardcoded provider cards' names (`tsgt. becker`, `capt. lin`,
  `ms. delaney`, `dr. fields`, `ch. taylor`) and IDs with `provider.name` /
  `provider.user_id` per pathway — real assigned providers, not fixed names.
- SCS and PT/IM badges are hardcoded "Locked on" today — this happens to be
  correct (`always_available: true` for both server-side), but drive it from
  `status`/`always_available` rather than hardcoding, since it's real data now.
- Nutrition/Mental/Chaplain toggle switches: wire to
  `POST /support/team/{pathway_key}/toggle` with `{ enabled: boolean }`. This is
  currently 100% local state with no persistence and no audit trail despite the
  info card's claim "Toggle changes are logged" — the backend genuinely does log
  this (`support_pathway_toggle` audit event), so wiring it makes that claim true.
  `400 "{label} is assigned automatically and cannot be disabled."` if attempted on
  SCS/PT-IM — shouldn't be reachable from the UI since those toggles don't exist
  for always-available pathways, but handle it defensively.
- "Send a message" buttons: use `messaging_available` (real, currently `true`
  only for SCS/PT-IM per `messaging_v1_supported`) to decide enabled vs.
  "(Open in v1.1)" disabled state — this already matches the current hardcoded
  behavior, just make it data-driven instead of a hardcoded per-provider constant.
  Navigate to chat using the real `provider.user_id`, not a hardcoded
  `?provider=becker` slug (see chat.tsx below — this is the key mapping change).
- Footer performing-user block: use the real logged-in user's name/ID from
  `authSlice` instead of the hardcoded `"capt.lin · USR-6601"`.

### 2. `support/chat.tsx`
This is the biggest rewrite in this section — currently 100% fake (two hardcoded
message arrays keyed by a URL slug, no send call, no scan call, no thread fetch).

- **Route param change:** navigate here with the real `other_user_id` (a Mongo
  ObjectId string) from `support/index.tsx`'s `provider.user_id`, not
  `?provider=becker`/`?provider=lin`.
- **Load thread:** `GET /messaging/thread/{other_user_id}` →
  `{ thread_key, other_user_id, other_user_name, other_user_role,
  pathway_context: {pathway_key,label,role_title,status} | null,
  messages: MessageResponse[] }`. Use `other_user_name`/`other_user_role` for the
  header (replacing hardcoded `providerName`/`providerRole`/`providerInitials`
  derived from the URL slug). This call also marks unread messages as read
  server-side — no separate "mark read" call needed here.
- **Message shape mapping:** backend `MessageResponse` fields are
  `{ id, thread_key, thread_id, sender_id, sender_role, recipient_id, body,
  is_read, source_type, related_recommendation_id, attachment, created_at }` — map
  `body`→the UI's `text`, `created_at`→`time`, and derive `sender: "operator" |
  "provider"` by comparing `sender_id` to the logged-in user's own id (the current
  local `Message` interface's field names don't match; update the interface, don't
  keep a separate translation layer scattered through the JSX).
- **Send button (`handleSend`):** this currently does a pure local array push with
  zero network activity — replace entirely.
  - **Request is multipart `FormData`, not JSON** — `POST /messaging/send` with
    form fields `recipient_id` (= `other_user_id`), `body` (= trimmed input text,
    1-2000 chars), and optionally `attachment` (file part, if you wire the
    currently-inert paperclip button — allowed types `.pdf/.jpg/.jpeg/.png/.heic`,
    ≤20MB).
  - On success (201), append the real returned `MessageResponse` to the thread
    (don't synthesize a local echo with `Math.random()` as an id).
  - **On the OPSEC-blocked `400`**, the error body is:
    ```json
    { "detail": { "message": "...", "blocked_terms": ["..."], "severity": 1-5 } }
    ```
    Show this to the user — currently the static warning banner
    ("Do not share schedules, tactics...") is purely decorative and no real block
    ever surfaces. This is the actual functional home of that warning; make it
    real. Optionally call `POST /messaging/scan` (JSON body `{ body: string }`,
    returns `{ blocked_terms, severity }`) on text-change for a live pre-send
    warning, matching the UI's existing "OPSEC scan on send · server re-validates"
    caption — but the server-side block on actual send is the authoritative check
    either way, and must never be skipped even if you add the live preview.
  - `403 "You are not authorized to message this user."` can occur if there's no
    real team assignment between the two users — handle gracefully (shouldn't
    happen if navigation only ever originates from `/support/team`'s real
    `provider.user_id`s, but don't assume it's unreachable).
- **Attach-file button:** currently has no `onPress` at all. Wire it to a real
  file/image picker (`expo-document-picker` or `expo-image-picker`) producing a
  file for the `attachment` form part above, respecting the same type/size limits.
- **Audit &amp; decisions bottom sheet:** replace with
  `GET /messaging/message/{message_id}/trace` (call it for the most recent message
  in the thread, or whichever message the user long-presses/inspects — decide the
  exact trigger with product, the current sheet opens from a generic header icon
  with no specific message selected):
  ```json
  {
    "thread_source": { "source_type": "provider_plan_link"|"user_initiated",
      "plan_link_id", "readiness_driver", "route_level", "assigned_to" },
    "last_send_audit": { "message_id", "audit_event_id", "audit_timestamp",
      "attachment_count", "opsec_scan", "role_scope" } | null
  }
  ```
  Note two real differences from the mock: there is **no `question_id` field** in
  the real response (drop that row), and `opsec_scan` is always formatted
  `"<value> (server)"`, never `"passed (client + server)"` as currently hardcoded.
  The `[OPEN] MESSAGING BEHAVIORS` list's 8 static rows are stale relative to the
  current backend — group threads and PDF/image attachments are **already real
  and implemented**, not open questions; trim that list down to what's genuinely
  still undecided (retention window, push notifications, read receipts, typing
  indicators — the WebSocket endpoint explicitly does not support typing
  indicators by design) rather than listing settled items as open.
- Date divider: use the real `created_at` of the first message in each day-group
  instead of a hardcoded `"Today · 2026-07-18"`.
- Unread badge on the header icon (hardcoded `"8"`): source from
  `GET /messaging/threads`' `unread_count` for this thread instead.
- **Real-time updates (optional but recommended given a WebSocket already
  exists):** `WS /messaging/live?token=<access_token>` pushes new messages as they
  arrive (`{id, thread_key, thread_id, sender_id, sender_role, recipient_id, body,
  created_at}`) via a MongoDB change stream — wire this to append incoming
  messages live instead of requiring a manual refetch. Closes with code `4403` on
  an invalid/expired token; handle reconnect-with-fresh-token on that close code.

### 3. `support/request.tsx`
Currently: topic selection + free text, `handleContinue` shows a local `Alert`
and never sends anything.

Replace with `POST /support/requests` (status 201) — JSON body:
```json
{ "pathway_key": "SCS"|"PT/IM"|"Nutritionist"|"Mental Performance"|"Chaplain",
  "message": "<contextText, optional, ≤280 chars>" }
```
- **Critical mapping fix:** the frontend's local topic ids
  (`fitness`/`injury`/`nutrition`/`mental`/`purpose`) do not match backend
  `pathway_key` values. Use this exact mapping:
  | Frontend `TOPIC_OPTIONS.id` | Backend `pathway_key` |
  |---|---|
  | `fitness` | `"SCS"` |
  | `injury` | `"PT/IM"` |
  | `nutrition` | `"Nutritionist"` |
  | `mental` | `"Mental Performance"` |
  | `purpose` | `"Chaplain"` |

  Note the frontend's own copy for both `fitness` and `injury` cards currently
  says "→ PT/IM", which conflicts with `fitness` actually routing to the
  backend's separately-labeled `"SCS"` pathway ("Fitness"). **This is a genuine
  product/copy inconsistency, not something to silently resolve** — flag it and
  get a decision on the card copy before shipping, rather than guessing which is
  right.
- Success (201) → `SupportRequestResponse`:
  `{ id, pathway_key, pathway_label, message, status: "open", priority_flag,
  safety_notice, created_at, updated_at }`. If `priority_flag` is `true`
  (meaning the message matched a real safety-boundary keyword — self-harm/crisis
  language, scanned server-side before OPSEC), **show `safety_notice` prominently**
  — it's the real crisis-line text (988, Press 1) and this is a genuine safety
  feature, not decorative copy. This case never blocks submission.
- Errors: `400 "Unknown support pathway."` (shouldn't happen given the mapping
  table above, but validates it), and an OPSEC-blocked `400`:
  ```json
  { "detail": { "message": "Request content was blocked by the OPSEC content scan.", "blocked_terms": ["..."] } }
  ```
  (note: no `severity` key here, unlike the messaging endpoint's block response —
  don't assume the two error shapes are identical).
- After success, replace the local `Alert.alert("Request Sent", ...)` +
  `router.back()` with the same UX (a confirmation, then back) but driven by the
  real response, and consider surfacing the created request somewhere the user can
  track it — `GET /support/requests` lists the caller's own requests
  (`{requests: SupportRequestResponse[]}`) if a "my requests" view is ever wanted;
  not currently present anywhere in the app, no action required unless asked.

### Known gaps to flag, not fabricate
- `GET /support/pathways` also exists (a simpler always-available + opted-in
  pathway list) — `GET /support/team` is the richer real data source for this
  screen and is what's specified above; don't call both redundantly.
- The `_can_message` authorization rule only allows messaging within a real team
  assignment (or provider↔admin, or provider↔provider) — an operator cannot
  message an arbitrary provider outside their assigned team. This is enforced
  server-side (`403`) and is correct; don't try to work around it client-side.

### Acceptance checklist
- [ ] "Send a message" from `support/index.tsx` opens a real thread with the correct assigned provider's name/role, not a hardcoded Becker/Lin.
- [ ] Sending a message containing a real OPSEC term (e.g. "convoy") is rejected with the real severity in the error, and nothing is appended to the thread.
- [ ] A support request submitted for "Fitness" lands against the correct backend pathway per the mapping table (verify server-side, since the id naming is non-obvious).
- [ ] A message containing crisis language triggers `priority_flag`+`safety_notice` and is still accepted (not blocked).

---

## Prompt 5 — Profile

**Screens:** `app/src/app/(tabs)/profile/index.tsx`, `records.tsx`,
`add-record.tsx`, `uploads.tsx`, `activation.tsx` (non-CAC portion only — its
CAC/PIV/EDIPI content is out of scope), `data-use.tsx`, `flyaway.tsx`.
Backend modules: `/users` (profile, sign-in history, deactivation) and `/records`
(medical records, data-use summary, fly-away kit).

### 1. `profile/index.tsx`
Replace with `GET /users/profile` → `ProfileResponse`:
```
id, email, full_name, role, unit_id, rank_grade, is_verified,
onboarding_completed, onboarding_status, day0_daily_checkin_status,
current_ops_score, current_ops_band, current_ops_band_meaning, ops_confidence_level,
onboarding_baseline_ops_score, onboarding_baseline_band,
support_pathways_opted_in: string[],
assigned_scs: { user_id, name } | null,
assigned_ptim: { user_id, name } | null,
communications_preference: "Regular" | "Limited"  (derived server-side),
theme_preference, notifications_enabled,
data_use_consent, wellness_recommendations_opt_in,
policy_version_accepted, policy_acknowledged_at,
sign_in_activation: { is_verified, member_since, last_login_at },
member_since
```
- Replace all hardcoded identity fields (`"Sgt Marcus R. Hayes"`, `"E-5 · Sgt · 21
  MDS · Bravo Flight"`, `"marcus.hayes@dws.af.mil · EDIPI 1234567890"`) with real
  `full_name`, `rank_grade`, `unit_id`, `email`. **There is no EDIPI field
  anywhere in the backend** (explicit, deliberate — no CAC/PKI integration exists)
  — drop the EDIPI display entirely rather than fabricating a value; this is
  distinct from the (separately out-of-scope) CAC/PIV auth subsystem.
- Assigned SCS/PT-IM rows: bind to `assigned_scs.name`/`assigned_ptim.name`
  (null-safe — show "Not yet assigned" rather than a hardcoded name when null).
- Dark theme / Notifications switches: wire to
  `PATCH /users/profile/settings` with `{ theme_preference?, notifications_enabled? }`
  (both currently pure local `useState` with no persistence at all — every app
  restart silently reverts them). Only send the field that changed.
- Communications preference text: bind to `communications_preference` (derived
  server-side from `wellness_recommendations_opt_in` — don't add a separate
  editable control for it here, it already says "Read-only here" / "Updated
  through your SCS" on the data-use screen, which is correct).
- Records home badge ("6 categories"): this happens to already match the real
  backend (see §2 below has exactly 6 categories) — fine to leave as a static
  literal, or better, drive it from the real category count for future-proofing.
- App version string: leave as local build metadata, not a backend concern.
- "Privacy notice" row: currently a dead-end `alert()` — either route it to the
  existing `auth/privacy.tsx` screen (reasonable reuse) or ask product which
  content it should show.

### 2. `profile/records.tsx`
Replace the 6 hardcoded card subtitles/badges with `GET /records/home` →
`{ categories: [{ key, label, subtitle }] }` — exactly 6 real entries (`key` ∈
`my_uploads | workouts_log | oft_status | reconditioning_plan | assessments |
fly_away_kit`), with server-computed live subtitles (e.g. real last-upload date,
or "No records yet" — never a stale hardcoded date). Map `key` to the existing 6
routes unchanged. The "Reconditioning Plan" card currently shows a bare `Alert`
instead of navigating anywhere — if there's no dedicated reconditioning screen
yet, that's a real product gap (the backend has full `ReconditioningPlan` data,
surfaced today only via the Fly Away Kit endpoint in §6) — flag it rather than
silently leaving the alert in place.

### 3. `profile/add-record.tsx`
Currently: fake file "attach" (always the same hardcoded filename), fake submit
(`Alert` + navigate, no network call at all).

Replace with `POST /records/uploads` (status 201) — **multipart `FormData`, not
JSON**:
- `document_type` (Form field) — **must be lowercase snake values**:
  `"labs" | "imaging" | "specialist" | "dme" | "other"`. The current dropdown
  shows `"Labs"/"Imaging"/"Specialist"/"DME"/"Others"` (capitalized, and "Others"
  plural) — map display labels to these exact backend values; don't send the
  display string directly, it will 400 with `"Unknown document type."`.
- `access_reason` (Form field) — the existing 12-char client-side minimum
  (`isReasonValid`) already matches the server's real `MIN_ACCESS_REASON_LENGTH`
  rule exactly; keep that validation, it's correct.
- `file` (File part) — wire a real file picker (`expo-document-picker`) instead
  of the hardcoded `"lipid_panel_draft_2026.pdf"` toggle. Enforce ≤50MB
  client-side to match `MEDICAL_RECORD_MAX_BYTES` and give a fast local error
  before upload rather than waiting for the server's 400.
- Response `data` = the full record detail object (see §4 shape below) — use its
  real `id`/`status` when navigating to a detail screen afterward, rather than
  the current unconditional `router.replace("/profile/record-detail")` with no
  record reference at all.
- Note: if the file extension is on the server's blocked list
  (`.exe/.bat/.cmd/.sh/.dll/.msi/.ps1`), the record is still created but with
  `status: "quarantined"` — this is **not a 400 error**, it's a 201 success with a
  different status; handle it as a distinct "quarantined" UI state, not an error
  toast.

### 4. `profile/uploads.tsx`
Replace the hardcoded 4-item `uploadsData` array with
`GET /records/uploads?document_type=&search=` — pass the active tab
(`"all"` when the "All" chip is selected, else the lowercase snake value from the
mapping table above) and the search box text as real query params instead of
client-side array filtering. Each real `MedicalRecordResponse` item:
```
id, document_type, file_name, file_type, file_size_bytes, status
  ("pending"|"reviewed_approved"|"reviewed_denied"|"quarantined"),
access_reason, uploaded_at, reviewed_at
```
- Map `status` to the existing "Reviewed"/"Pending" badge styling, and add a
  visible state for `"quarantined"` and `"reviewed_denied"` — the current UI only
  models 2 of the real 4 states.
- **Fix the "View" navigation:** it currently routes to `/profile/record-detail`
  with no id passed at all, so the detail screen has no way to know which record
  was tapped. Pass the real `id` and load `GET /records/uploads/{record_id}` on
  that screen (not itemized in this prompt's scope since `record-detail.tsx` isn't
  one of the 5 named screens, but this routing bug blocks any real detail view and
  must be fixed as part of wiring this list).
- "+ Add" button: unchanged, already routes correctly to `add-record.tsx`.

### 5. `profile/activation.tsx` (non-CAC portion)
- Replace the hardcoded "Last sign-in" card + `SIGNIN_HISTORY` array with
  `GET /users/sign-in-history` →
  `{ last_sign_in: SignInEvent|null, recent_history: SignInEvent[] (≤5),
  activation_date, deactivation_date }`, each `SignInEvent`:
  `{ event_type, method, outcome: "OK"|"FAIL", ip_address, user_agent, created_at }`.
  Real `method` values do not include any CAC/PIV/EDIPI value (`"password"` is the
  only method today) — for the (out-of-scope) CAC method badges currently shown,
  leave that UI as-is per the exclusion, but understand there's no real backend
  value feeding it. Real data does **not** include device model or geolocation
  (the mock's "iPhone 14 Pro · iOS 17.5" / "Pentagon / Arlington, VA" strings have
  no backend counterpart) — drop those two fields from the card rather than
  inventing them; `ip_address` and `user_agent` are the real, honest replacements.
- Wire "Submit request →" in the deactivation modal to
  `POST /users/deactivation-requests` with `{ reason?: string }` — see Prompt 1's
  note on this same endpoint (it's a `/users` route, referenced from both the
  sign-in screen's flow and this screen). `400 "A deactivation request is already
  pending for this account."` should replace the current unconditional success
  alert when a prior request is still open.
- The modal's static metadata grid (ROUTING/AUDIT ROW/RECORDS AFFECTED/APPROVAL)
  is genuinely descriptive policy text, not per-request data — fine to leave as
  static copy.

### 6. `profile/data-use.tsx`
Replace the 4 hardcoded static arrays with `GET /records/data-use-summary` →
```
system_of_record_boundary,
what_ascend_stores: [{title, detail}]  (6),
what_ascend_does_not_store: [{title, detail}]  (3),
who_can_see_your_data: [{title, detail}]  (6),
what_we_audit: [{title, detail}]  (5, includes the real OPSEC-scan line),
your_controls: [{title, detail}]  (2)
```
This maps closely to the existing 4 hardcoded arrays' content/structure but is now
real server content (source of truth for policy copy going forward, so edits to
this text happen backend-side, not by editing the app). The frontend's decorative
`icon`/`iconColor`/`badge` fields per row aren't part of the API response — keep
those as a local presentation-layer lookup keyed by `title` or array index, since
the backend correctly doesn't own icon choices.

### 7. `profile/flyaway.tsx`
This screen's concept is **real** on the backend (not frontend-only, contrary to
how it might look) — replace the hardcoded contacts array and the 5 hardcoded
"Rehab status" lines with `GET /records/fly-away-kit`:
```json
{
  "emergency_contacts": {
    "scs_on_call_phone", "ptim_clinic_phone", "ptim_clinic_hours",
    "chaplain_hotline_phone", "family_contact_note"
  } | null,
  "rehab_status": { "available": false } | { "available": true, "phase", "phase_label",
    "days_in_phase", "sessions_completed", "sessions_total", "cadence_note",
    "injury_flags", "ptim_clearance_status", "ptim_clearance_label",
    "next_review_date", "limitation_flag", "rehab_strategy_summary",
    "scs_coordination_status", "scs_coordination_label", "severity_level",
    "injury_reported_on", "..." },
  "assigned_provider": { "user_id", "name" } | null
}
```
- `emergency_contacts` is `null` if the user has no `unit_id` or their unit has no
  configured directory yet — show a real "not configured" state instead of the 4
  hardcoded `555-XXXX` placeholder numbers.
- `rehab_status.available: false` means the user has no active reconditioning
  plan — show an empty/"not applicable" state instead of the current 5 hardcoded
  status lines, which imply every user always has an active rehab plan (they
  don't).
- `assigned_provider` replaces the hardcoded `"pt.knox · PT/IM"` line.
- This screen is genuinely read-only from the operator's side (no self-service
  edit endpoint exists) — the "Locked"/"Configuration locked" copy is accurate,
  keep it.
- "Tap to call" buttons: wire to a real `Linking.openURL(\`tel:${phone}\`)` call
  using the real phone numbers from `emergency_contacts`, replacing the current
  `Alert.alert("Placing Call", ...)` no-op.

### Known gaps to flag, not fabricate
- No endpoint edits `full_name`, `unit_id`, `role`, or `email` — only
  `rank_grade`, `theme_preference`, and `notifications_enabled` are user-editable
  via `PATCH /users/profile/settings`. Don't add edit controls for the other
  fields without a backend change first.
- `POST /records/uploads/{id}/reveal-field` (one-time masked-field reveal, for
  non-owner clinical viewers) and the review/access-level endpoints are
  Admin/PT-IM-facing — not relevant to the operator's own Profile screens, no
  action needed here.

### Acceptance checklist
- [ ] Profile screen shows the real logged-in user's name/rank/unit, with no EDIPI value displayed anywhere outside the excluded CAC section.
- [ ] Theme/notification toggle changes survive an app restart.
- [ ] Uploading a record with a disallowed extension shows a real "quarantined" state, not a generic error or a false success.
- [ ] Tapping "View" on an uploaded record opens the correct record's real detail, not a genericized fixed screen.
- [ ] Fly Away Kit shows "not configured" honestly for a user with no unit-level emergency contacts, rather than placeholder phone numbers.
