# PRD: React Todo List Refactoring

## Overview

This document describes the refactoring requirements for an existing React Todo List application. The app is functional but contains multiple issues across security, performance, code quality, and accessibility that must be resolved without breaking existing functionality or adding new features.

---

## Goals

- Remove all security vulnerabilities from the codebase
- Eliminate unnecessary re-renders and optimize expensive computations
- Bring code in line with React best practices
- Improve accessibility for keyboard and screen-reader users
- Clean up developer-facing issues (dead code, inconsistent styling)

---

## Scope

**In scope:** Audit and fix existing issues in `src/App.jsx` and `src/index.css`.

**Out of scope:** New features, full rewrites, changes to test files, or changes to project configuration.

---

## Issues to Fix

### 1. Security

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| S-1 | Hardcoded API key `sk-1234567890abcdef` exposed as a module-level constant | `App.jsx:4` | Remove the constant entirely — it is unused. If an API key is needed in future, it must come from an environment variable (`.env`), never committed to source. |
| S-2 | API key printed to the browser console via `console.log('API Key:', API_KEY)` | `App.jsx:145` | Remove the console.log statement. |
| S-3 | XSS vulnerability: user-supplied text rendered with `dangerouslySetInnerHTML` | `App.jsx:128` | Replace with a plain `<span>{todo.text}</span>` — there is no requirement to render HTML in todo text. |

---

### 2. Performance

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| P-1 | `useEffect` for saving to localStorage has no dependency array, so it runs after every render — including the initial mount before any data has loaded | `App.jsx:22-24` | Add `[todos]` as the dependency array so it only runs when `todos` actually changes. |
| P-2 | `getFilteredTodos` is a plain function called inline during render, recalculating the filtered list on every render regardless of whether `todos` or `filter` changed | `App.jsx:57-65` | Replace with `useMemo(() => ..., [todos, filter])`. |
| P-3 | `stats` object (total / completed / active counts) is recalculated on every render by iterating `todos` multiple times | `App.jsx:68-72` | Replace with `useMemo(() => ..., [todos])`. |
| P-4 | `addTodo` is recreated on every render as a plain function | `App.jsx:27` | Wrap with `useCallback`, depending on `[input, todos]`. |
| P-5 | Inline arrow functions in JSX event handlers (`onChange`, `onKeyPress`, `onClick` for filter buttons, checkbox, delete) are recreated on every render | `App.jsx:84, 85, 98, 103, 109, 125, 130` | Extract named handlers or use `useCallback` where appropriate. |
| P-6 | `Date.now()` used as a todo ID can produce collisions if two todos are added in the same millisecond | `App.jsx:35` | Replace with `crypto.randomUUID()` for a collision-free identifier. |

---

### 3. Code Quality

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| Q-1 | Filter buttons use inline `style` objects for active/inactive state, inconsistent with the existing CSS file | `App.jsx:96-115` | Remove inline styles; use CSS class names (e.g., `className={filter === 'all' ? 'active' : ''}`) and define the styles in `index.css`. |
| Q-2 | No empty-state message when the todo list is empty or a filter returns no results | `App.jsx:119` | Render a short message (e.g., "No todos here.") when `filteredTodos.length === 0`. |
| Q-3 | `console.log('Rendering with todos:', todos)` is debug code left in the render body | `App.jsx:144` | Remove it. |

---

### 4. Accessibility

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| A-1 | The text input has no associated `<label>`, making it inaccessible to screen readers | `App.jsx:81-91` | Add a visible or visually-hidden `<label htmlFor="todo-input">` and a matching `id="todo-input"` on the input. |
| A-2 | Checkbox inputs for each todo item have no accessible label — a screen reader cannot tell which todo the checkbox belongs to | `App.jsx:123-126` | Add `aria-label={todo.text}` (or associate with the sibling `<span>` via `aria-labelledby`) to each checkbox. |
| A-3 | `onKeyPress` is deprecated in React 17+ | `App.jsx:85-89` | Replace with `onKeyDown`, checking `e.key === 'Enter'`. |

---

### 5. Developer Experience

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| D-1 | `localStorage.getItem` result is parsed with `JSON.parse` without a try/catch; malformed storage data will crash the app | `App.jsx:16-18` | Wrap in try/catch and fall back to `[]` on parse errors. |

---

## Acceptance Criteria

1. All 5 test suites in `App.test.jsx` pass (`pnpm test`).
2. The `API_KEY` constant and both `console.log` debug lines are gone.
3. No use of `dangerouslySetInnerHTML` remains.
4. The localStorage `useEffect` has `[todos]` as its dependency array.
5. `getFilteredTodos` and `stats` are computed with `useMemo`.
6. `addTodo` is wrapped with `useCallback`.
7. Todo IDs are generated with `crypto.randomUUID()`.
8. Filter button active state is expressed via CSS classes, not inline styles.
9. An empty-state message renders when no todos match the current filter.
10. The todo text input has an accessible `<label>`.
11. Each todo checkbox has an accessible label.
12. `onKeyPress` is replaced with `onKeyDown`.
13. The localStorage read is wrapped in a try/catch.

---

## Commit Strategy

Each issue category should be addressed in its own atomic commit with a clear message:

```
fix(security): remove exposed API key and XSS vulnerability
fix(performance): memoize filtered todos, stats, and addTodo callback
fix(performance): add dependency array to save-to-localStorage effect
fix(perf): replace Date.now() IDs with crypto.randomUUID()
fix(a11y): add label to todo input and aria-labels to checkboxes
fix(a11y): replace deprecated onKeyPress with onKeyDown
fix(quality): replace inline styles with CSS classes for filter buttons
fix(quality): add empty-state message and remove debug console.logs
fix(dx): wrap localStorage parse in try/catch
```

---

## Constraints

- All existing tests must pass after every commit.
- Do not add new features.
- Do not rewrite the entire application.
- Do not break existing functionality.
