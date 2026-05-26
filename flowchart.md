# Flowchart: React Todo List App (Post-Refactor / Target State)

> Flowchart ini menggambarkan **kondisi aplikasi setelah seluruh fix di [prd.md](./prd.md) diterapkan** — bukan kondisi kode saat ini. Setiap node yang berubah dari versi awal diberi tag `[Fix-XX]` merujuk ke ID issue di PRD.

---

## 1. App Initialization

```mermaid
flowchart TD
    A([App Mounts]) --> B[useEffect mount: read localStorage]
    B --> C{Data found\nin localStorage?}
    C -- No --> F[todos stays empty array]
    C -- Yes --> D[try: JSON.parse saved todos]
    D --> D1{Parse success?}
    D1 -- Yes --> E[setTodos with saved data]
    D1 -- No --> D2["catch: fall back to []  [Fix-D-1]"]
    D2 --> F
    E --> G([Render App])
    F --> G
```

---

## 2. Add Todo Flow

```mermaid
flowchart TD
    A([User types in input]) --> B[onChange: setInput]
    B --> C{Submit via\nButton click\nor Enter via onKeyDown [Fix-A-3]}
    C --> D{input.trim\n=== empty?}
    D -- Yes --> E[alert: Please enter a todo]
    E --> F([No change])
    D -- No --> G["Create newTodo object\nid: crypto.randomUUID() [Fix-P-6]\ntext: input\ncompleted: false\ncreatedAt: ISO string"]
    G --> H["setTodos: append newTodo\n(addTodo wrapped in useCallback [Fix-P-4])"]
    H --> I[setInput: reset to empty]
    I --> J["useEffect [todos]: save to localStorage [Fix-P-1]"]
    J --> K([Re-render with new todo list])
```

---

## 3. Toggle Todo Flow

```mermaid
flowchart TD
    A([User clicks checkbox]) --> B[toggleTodo called with todo.id\nwrapped in useCallback]
    B --> C[Map over todos array]
    C --> D{todo.id\nmatches?}
    D -- Yes --> E[Return todo with\ncompleted flipped]
    D -- No --> F[Return todo unchanged]
    E --> G[setTodos with updated array]
    F --> G
    G --> H["useEffect [todos]: save to localStorage [Fix-P-1]"]
    H --> I([Re-render with updated state])
```

---

## 4. Delete Todo Flow

```mermaid
flowchart TD
    A([User clicks Delete button]) --> B[deleteTodo called with todo.id\nwrapped in useCallback]
    B --> C[Filter todos array\nexcluding matching id]
    C --> D[setTodos with filtered array]
    D --> E["useEffect [todos]: save to localStorage [Fix-P-1]"]
    E --> F([Re-render without deleted todo])
```

---

## 5. Filter Flow

```mermaid
flowchart TD
    A([User clicks filter button\nAll / Active / Completed]) --> B[setFilter with selected value]
    B --> B1["Update active CSS class on button [Fix-Q-1]"]
    B1 --> C([Re-render triggered])
    C --> D["useMemo recomputes filteredTodos\nonly if todos or filter changed [Fix-P-2]"]
    D --> E{filter value?}
    E -- all --> F[Return all todos]
    E -- active --> G[Return todos where\ncompleted = false]
    E -- completed --> H[Return todos where\ncompleted = true]
    F --> I([Render filtered list])
    G --> I
    H --> I
```

---

## 6. Stats Calculation Flow

```mermaid
flowchart TD
    A([todos state changes]) --> B["useMemo recomputes stats\ndependency: [todos] [Fix-P-3]"]
    B --> C[total = todos.length]
    B --> D[completed = todos.filter completed]
    B --> E[active = todos.filter not completed]
    C --> F([Render stats bar])
    D --> F
    E --> F
    G([Other state changes:\ninput / filter]) --> H[stats NOT recomputed\ncached value reused]
    H --> F
```

---

## 7. Full App Render Flow (High-Level)

```mermaid
flowchart TD
    A([App renders]) --> B[Read state:\ntodos / input / filter]
    B --> C["useMemo: stats [Fix-P-3]"]
    B --> D["useMemo: filteredTodos [Fix-P-2]"]
    C --> E[Render Header\nMy Todo List]
    D --> E
    E --> F["Render Input Section\nlabel + input + Add button [Fix-A-1]"]
    F --> G["Render Filter Buttons\nactive state via CSS class [Fix-Q-1]"]
    G --> H{filteredTodos\nempty?}
    H -- No --> I["Render todo items\ncheckbox with aria-label [Fix-A-2]\n+ plain text span [Fix-S-3]\n+ Delete button"]
    H -- Yes --> J["Render empty state message [Fix-Q-2]"]
    I --> K[Render Stats Bar]
    J --> K
    K --> L([DOM updated])
```

> Catatan: tidak ada lagi `console.log` debug `[Fix-Q-3]` maupun `API_KEY` `[Fix-S-1, S-2]` di render body.

---

## 8. localStorage Persistence Flow

```mermaid
flowchart TD
    A([todos state changes]) --> B["useEffect fires\ndependency: [todos] [Fix-P-1]"]
    B --> C[localStorage.setItem\ntodos = JSON.stringify todos]
    C --> D([Data persisted])

    E([App mounts]) --> F["useEffect fires\ndependency: []"]
    F --> G[localStorage.getItem todos]
    G --> H{Value exists?}
    H -- No --> K([Skip, todos stays empty])
    H -- Yes --> I[try: JSON.parse value]
    I --> I1{Parse success?}
    I1 -- Yes --> J[setTodos]
    I1 -- No --> I2["catch: keep empty [] [Fix-D-1]"]
    J --> L([Hydrated from storage])
    I2 --> K
```
