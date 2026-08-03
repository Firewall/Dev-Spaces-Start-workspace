# Thread Sidebar Variations

Created 5 design variations for expanding the running threads sidebar with:
- **Model icon** (colored circle with model initial)
- **Git branch** information
- **At least 1 multi-row layout** (V3 uses 2 rows per thread)

## Live Demo

Run `npm run dev` and navigate to: **`#/variations-demo`**

---

## V1: Model Badge
**Single row, icon + model badge on right**

Shows the model icon and time-ago on the same line as the thread name. Most compact. Icon on left, time on right.

```
[O] Sidebar redesign work                    5m ago
[S] Fix alignment issue                      10m ago
[H] Update README                            20m ago
```

**Best for:** Space-constrained sidebars, minimal visual clutter

---

## V2: Compact Full Info
**Single row, full info: model + branch + time**

Adds branch name (right side) to V1. All info on one line with tighter spacing. Shows branch short-name (e.g., "sidebar-v2").

```
[O] Sidebar redesign work        sidebar-v2 • 5m ago
[S] Fix alignment issue          icon-align • 10m ago
[H] Update README                readme-update • 20m ago
```

**Best for:** Users who care about branch visibility in quick glances

---

## V3: Multi-Row (2 rows per thread) ⭐
**Two rows per thread: title + model on top, branch + time on bottom**

**This is the multi-row variation.** Each thread expands to 2 rows:
- **Row 1:** Model icon + thread title + time
- **Row 2:** Branch info (indented with 🌿 emoji)

```
[O] Sidebar redesign work                              5m ago
    🌿 feature/sidebar-v2
    
[S] Fix alignment issue                               10m ago
    🌿 bugfix/icon-align
    
[H] Update README                                     20m ago
    🌿 docs/readme-update
```

**Best for:** Detailed view where branch info needs prominence. Left border highlight on selection. Visual separation between threads.

---

## V4: Icon Above
**Inline with icons above name - model icon visible, branch as tooltip**

Model icon floats left, thread title below it. Branch visible as secondary text. On hover, full branch shows as tooltip.

```
[O] Sidebar redesign work
    feature/sidebar-v2
    
[S] Fix alignment issue
    bugfix/icon-align
    
[H] Update README
    docs/readme-update
```

**Best for:** Balanced visual weight, scannable by icon color + title

---

## V5: Detailed View
**Expanded details - model name text, branch label, full metadata**

Most spacious. Model icon + name text (not just initial). Branch shown with 🌿 emoji. Rounded background.

```
┌──────────────────────────────────────┐
│ [O] Sidebar redesign work            │
│     opus-4.8                         │
│     🌿 feature/sidebar-v2 • 5m ago   │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ [S] Fix alignment issue              │
│     sonnet-5                         │
│     🌿 bugfix/icon-align • 10m ago   │
└──────────────────────────────────────┘
```

**Best for:** Power users who want full context at a glance, less scrolling

---

## Color Scheme

Model icons use a consistent color palette:
- **Opus 4.8** → Indigo (#6366f1)
- **Sonnet 5** → Sky Blue (#0ea5e9)
- **Haiku 4.5** → Pink (#ec4899)
- **Claude (default)** → Purple (#8b5cf6)

---

## Implementation Notes

- Variations use **mock data** (Agent type extended with `model` and `branch` fields)
- Model icon is a **20px colored circle** with 1-letter initials (O, S, H)
- Branch emoji is **🌿** for visual consistency
- Time display uses existing `timeAgo()` function
- All variations respect PatternFly theming and dark mode

---

## Next Steps

1. **Choose preferred variation** (or hybrid)
2. **Update Agent type** to include `model?: string` and `branch?: string`
3. **Integrate into AgentSidebar.tsx** 
4. **Wire up real model/branch data** from agent settings and git
5. **Test scrolling behavior** with many threads
