# Flowboard Changelog

## v1.12.1
### Bug Fixes & Improvements
- **Stack column: subtasks are now visually nested under the parent** with an indent guide line, matching the tree-style treatment already used when expanding a stack on the board. The parent keeps its purple left-border accent; subtasks sit indented below it instead of all cards looking like plain uniform siblings.

## v1.12.0
### New Features
- **Redesigned subtask visibility as a docked stack column in sheet view**, replacing the left-panel list from v1.11.0. Opening the sheet for any task in a stack (parent or child) now shows a separate panel to the right, styled like a board column but visually distinct (accent border, no blur bleed-through confusion with real columns) — with simplified subtask cards (title, due date, priority only). Click any card to jump to it; the column stays present for tree-like navigation between parent and subtasks, and the main sheet view stays centered with the column filling the space to its right.
### Bug Fixes & Improvements
- **Fixed new-card auto-scroll clipping the highlight glow.** When a new card landed at the bottom of a column, `scrollIntoView` only accounted for the card's own box, not the glow extending past it — the bottom of the glow (and sometimes the border) got cut off. Scrolling now reserves a buffer so the full glow is visible.

## v1.11.0
### New Features
- **New cards are now highlighted and scrolled into view when added.** The card (or stack parent) you just created gets a soft purple glow and border for a moment so it's easy to spot, and its column automatically scrolls to reveal it. The highlight fades gently the first time you mouse over the card.
- **Subtask visibility in sheet view.** Opening the sheet for a stack parent now shows a compact "Subtasks" list (with a done/total count) between Tags and the action buttons. Each row shows priority, title, and a checkmark if complete — click one to jump into that subtask's own sheet.
### Bug Fixes & Improvements
- **Notes bubble: Enter now saves the note, Shift+Enter for a new line** — matching the sheet view's notes panel, which already worked this way. Previously the bubble only saved on Cmd/Ctrl+Enter, and plain Enter just inserted a newline.

## v1.10.0
### New Features
- **Sidebar bottom panel (settings, tags, archive) is now pinned.** Previously, expanding a collapsible filter section (Weekly Summary, Filter by Priority, Filter by Tag) pushed the bottom button row down and off the window. That row now stays fixed in place, and the filter sections scroll independently behind it.
- **Columns are now capped to the board area and scroll individually.** Columns no longer grow taller than the window as cards are added — each column matches the board's height and scales with the window, with its own card list scrolling internally instead of the whole board scrolling as one unit.

## v1.9.0
### New Features
- **On-hold badge added next to the due date in sheet view.** Opening a card that's on hold now shows an "On Hold" badge right beside the due date pill, so hold status is visible without scrolling to the notes panel.
### Bug Fixes & Improvements
- **Card on-hold badge now matches the amber styling used everywhere else** (notes, sheet view). It was previously a plain gray badge, inconsistent with every other on-hold indicator in the app.

## v1.8.1
### Bug Fixes & Improvements
- **Fixed the "On Hold" badge sitting flush against the note timestamp** in both the notes bubble and the full sheet view. The timestamp row's flex layout collapsed the gap because the delete/restore icon button's own right-alignment margin was consuming all the row's free space, leaving none for the badge. Added an explicit gap so there's now clear separation.

## v1.8.0
### New Features
- **Native macOS title bar.** The Mac build now uses real, OS-drawn traffic-light window controls (via `titleBarStyle: 'hiddenInset'`) instead of the Windows-style custom min/maximize/close buttons — matching macOS UI conventions. Windows is unaffected and keeps its existing custom title bar exactly as before.
### Bug Fixes & Improvements
- **Fixed the app window blurring and losing clickable window controls whenever a card's sheet view was open**, on both platforms. The sheet's full-screen backdrop (and the API key modal's backdrop, which had the same issue) was covering the entire window including the title bar — it now stops above the title bar, so the title bar stays sharp, visible, and fully clickable while a sheet or modal is open.

## v1.7.2
### Bug Fixes & Improvements
- **Fixed the command bar occasionally submitting a task with nothing happening.** If the AI's response ever came back with no usable text (rare API edge case), the app silently treated it as "zero tasks" with no visible error — the prompt looked like it vanished. It now surfaces a clear red error message instead, and doing the same for a genuinely empty or malformed response.
- **Raised the AI response token limit** (1000 → 4096) so longer requests — especially breaking a task into a stack with several subtasks — are far less likely to get cut off mid-response and fail to parse.
- **Added a 30-second timeout** to the AI request so a hung connection fails with a clear message instead of spinning indefinitely.
- **Error messages in the command bar are now visually distinct from success messages** (red vs. the usual accent color) so a failed request is obvious instead of easy to mistake for confirmation.

## v1.7.1
### Bug Fixes & Improvements
- **Hold button now correctly flips to Resume.** After putting a task on hold from the notes bubble or sheet view, the button stayed labeled "Hold"/"Put on Hold" and disabled until a note was typed. It now shows "Resume" with amber active styling, is immediately clickable, and no longer requires text to resume.
- **Removed the duplicate, broken Hold button from the sheet view's action row.** The bottom-left panel (Mark Complete / Archive / Delete) had its own "Put on Hold"/"Resume" button that crashed with a `ReferenceError` when clicked — it's now removed since the notes-panel button already owns hold/resume.

## v1.7.0
### New Features
- **macOS build target added.** `electron-builder.yml` now includes a `mac` target (unsigned `.dmg`, reusing the existing app icon) alongside the Windows NSIS build. Run `npm run build:mac` to produce a local Mac build for development/testing. Windows remains the only signed, published, auto-updating target for testers.

## v1.6.2
### Changes & Fixes
- **Hold moved into notes UI.** The Hold button is removed from the card action row. To put a task on hold, open the notes bubble or sheet view and use the Hold button inside the note input area. This enforces a hold reason naturally — the Hold button is disabled until text is entered. Attempting to click it empty flashes the border red and shows a brief red placeholder message.
- **Note delete/restore icons.** Text "Delete"/"Restore" labels replaced with hover-reveal icon buttons (× to delete, ↩ to restore) right-justified on the timestamp row.
- **Notes input row layout.** Hold button left-justified, Save Note right-justified, in both the card bubble ("Hold") and sheet view ("Put on Hold").

## v1.6.1
### Bug Fixes & Improvements
- **Card view:** Due date + priority info row now appears above tags, not below.
- **Due date pill:** Width is now content-fit rather than fixed, with priority badge sitting flush against it.
- **Sheet view — notes:** Sheet panel is now a fixed height (680px max). Notes list scrolls within the panel rather than expanding it.
- **Sheet view — note input:** Enter now saves a note; Shift+Enter inserts a new line.
- **Sheet view — tags:** Existing tags can be applied via a + popout picker next to the Tags header. Add tag input moved to bottom of left panel above action buttons.
- **Sheet view — time scheduling:** Start time, end time, and All Day toggle added to sheet view (below due date, above priority). Not visible on card view.
- **Soft-delete notes:** Notes in both the card bubble and sheet view can be soft-deleted (red styling + strikethrough) and restored. Notes are never permanently removed from storage.
- **Settings:** Work hours (start/end time) added to Board Settings. Used by AI for intelligent time-aware scheduling.

## v1.6.0
### New Features
- **Card Sheet View:** Clicking anywhere on a card (outside buttons) opens a full expanded sheet view. The sheet shows the card title (editable with pencil icon), inline priority selector, due date picker, tag management (add/remove), a full scrollable notes history, and an always-visible note entry box. Complete, Hold, and Archive/Delete actions are also available in the sheet.
- **Due date + priority on same line in card view:** The due date pill and priority badge now share a single info row below the card title. Due date is left-justified with a fixed width; priority sits to the right.

## v1.5.16
### Improvements
- **Standardized active/selected highlighting.** Priority picker active state now uses the same accent-purple pattern (tinted background, accent color, accent border) used by sidebar filters, pill buttons, day toggles, and calendar selections throughout the app.

## v1.5.15
### New Features
- **Priority picker:** Clicking the priority badge on a card opens a popout bubble to change the priority. Matches the style of the notes and calendar popouts with a CSS arrow indicator.
### Bug Fixes
- **Calendar popout arrow now visible.** The arrow was being clipped by overflow:hidden on the calendar bubble.
- **Task count badge now shows total tasks.** Previously counted only visible (filtered) tasks instead of all non-archived tasks, causing a mismatch with column counters when filters were active.
- **Cards re-sort immediately** when priority or due date is changed.

## v1.5.14
### Bug Fixes
- **Calendar due date picker now renders correctly in dark mode.** Day cells were displaying with a white browser-default button background instead of transparent, causing blazing white boxes with low-contrast text. Fixed by explicitly setting background:transparent on calendar day buttons.

## v1.5.13
### Improvements
- **Weekly summary "Last Week" now uses a rolling 7-day lookback** instead of the previous Mon–Sun calendar week. Completed tasks and progress notes from the past 7 days always appear in the summary, regardless of what day of the week it is. Ensures Monday and Tuesday work shows up correctly for a Wednesday standup.

## v1.5.12
### Fixes
- Reverted column layout change from v1.5.11 that broke column sizing and appearance. Drag and drop column height fix will be revisited with a different approach.

## v1.5.11
### Changes
- **Removed board search bar.** To be reimplemented in a future release.
### Bug Fixes
- **Drag and drop now works across the full column height.** Previously, dropping a card into an empty or sparsely populated column required targeting the small card tray area. Columns now stretch to fill the full board height, making the entire vertical column space a valid drop target.

## v1.5.10
### Bug Fixes
- **Board search now reliably filters cards.** Added keyup and change event listeners alongside the existing input listener to ensure the search handler fires regardless of how input is delivered in Electron's renderer (direct typing, paste, autocomplete). Search now triggers on any value change.

## v1.5.9
### Bug Fixes
- **Board search bar now accepts input.** The launch animation overlay was not being removed from the DOM reliably because the cleanup code ran before the DOM was fully ready, leaving an invisible element blocking all clicks on the board. Fixed by wrapping the launch animation in a DOMContentLoaded listener and adding pointer-events:none to the blur layer as a safety net.
- **Board search now filters cards correctly.** Search results were being silently discarded because child tasks that matched the query passed the filter but were never rendered (children only render inside their parent's stack). Fixed: when a child matches, its parent is now guaranteed to appear in the visible set so the stack renders and the matching child is visible within it.

## v1.5.8
### Bug Fixes
- **Board search now works correctly.** Three issues fixed: (1) the "On Hold" priority filter was short-circuiting the filter pipeline and ignoring the search query entirely; (2) searching for text in a child task title or tag within a stack had no effect because only the parent title was checked — stacks now surface in results when any child matches; (3) the task count badge always showed the total unfiltered count, giving no visual feedback that search was doing anything. Archived tasks continue to be excluded from board search results (use the Archive drawer's own search for those).

## v1.5.7
### Fixes
- Update button now switches from a download arrow to a circular restart icon when the update has finished downloading and is ready to install.

## v1.5.6
### Improvements
- **Silent update install:** Clicking "Restart & Install" now shows a branded Flowboard splash screen with an animated progress bar while the installer runs silently in the background. No installer prompts or wizard screens. App relaunches automatically when complete.

## v1.5.5
### Fixes
- Changelog section in Settings drawer is now collapsible and starts collapsed.

## v1.5.4
### Updates
- **Auto-updater:** Replaced manual update downloader with electron-updater for reliable, verified background updates. Updates now download silently and prompt to restart rather than relaunching mid-session.
- **Changelog:** Added in-app changelog accessible from the Settings drawer. View current release notes and full version history without leaving the app.

## v1.5.3
### New Features
- **Work days setting:** Configurable work days in Settings → Board Settings. Day-of-week toggle buttons let you define your schedule. All AI scheduling, due date suggestions, calendar highlighting, and weekly summary now respect your configured work days. Removes the hardcoded Tue–Fri 4×10 default.
- **Auto-archive:** New setting to automatically archive completed tasks after a configurable number of days. Set to 0 to disable.
- **Tag icon:** Redesigned tag pill icon to match standard price-tag iconography.

### Bug Fixes
- Fixed board becoming stuck on empty view after deleting the last card using the active tag filter, or after deleting the filtered tag itself. Board now resets to unfiltered view automatically.

## v1.5.2
### Bug Fixes
- Fixed tag filter persisting as active after the filtered tag was deleted, leaving the board empty with no way to recover without manually switching filters.
- Fixed tag filter persisting after the last card using that tag was deleted.
- Redesigned tag pill icon in the sidebar for better symmetry.

## v1.5.1
### Bug Fixes
- Fixed settings pill button displaying a sun icon instead of a gear/cog wheel.
- Fixed tag manager pill button icon not rendering (was using unavailable icon font glyph).

## v1.5.0
### New Features
- **Settings drawer:** Replaced the API Settings modal with a persistent Settings drawer accessible from the sidebar. API key configuration moved into the drawer.
- **Sidebar pill buttons:** Replaced the sidebar bottom button row with three compact pill toggle buttons — Settings (⚙), Tags (🏷), Archive (📦).
- **Drawer mutual exclusion:** Opening any drawer now automatically closes any other open drawer.
- **Unified drawer width:** All drawers (Settings, Tags, Archive) standardized to 420px width.

## v1.4.4
- Archive sidebar button is now a toggle — clicking again closes the drawer.

## v1.4.3
- Done cards now show an Archive button in place of the Delete button. Permanent deletion of completed tasks is available from the Archive drawer.

## v1.4.1
- Fixed archive and delete button alignment on done cards.

## v1.4.0
### New Features
- **Task archive:** Completed tasks can be archived from the board with a single click. Archived tasks are hidden from the Done column but preserved in full.
- **Archive drawer:** Searchable archive viewer accessible from the sidebar. Supports restoring tasks to Done or permanently deleting them.
- **Archive button:** Appears on completed cards in place of the delete button. Highlights amber on hover to distinguish from destructive actions.
- **Auto-archive setting:** (Added in v1.5.3) Tasks can be automatically archived after a configurable number of days.

## v1.3.3
- New tags added via the Tag Manager are now automatically applied to relevant active tasks using AI relevancy detection. Completed cards are excluded.

## v1.3.2
- Due date on cards is now a clickable button that opens a calendar picker bubble. Matches the notes bubble style with a CSS arrow and flip behavior.
- Due date styled as a visible pill with color-coded states (normal, overdue, soon).
- Cards with no due date show a "Set date" placeholder button.

## v1.3.0
### New Features
- **Auto-updater:** Flowboard now checks for updates on launch and displays a download button in the titlebar when a new version is available. Clicking downloads the installer and launches it automatically.
- **Download progress:** Progress bar appears on the update button during download with live percentage tooltip.

## v1.2.0
### New Features
- **Launch animation:** Flowboard logo displays centered on a blurred board background for 1.5 seconds on launch, then fades out as the interface sharpens into focus.
- **App icon in titlebar:** Flowboard infinity logo displayed between "Flow" and "board" in the titlebar wordmark.
- **SVG send button:** Command bar send button and loading spinner replaced with inline SVG icons for reliable rendering.
- **Light/dark mode:** Theme toggle in the titlebar. Full light mode palette with per-element color corrections. Theme persists across sessions.
- **Dynamic taskbar icon:** Taskbar icon updates when switching between light and dark mode.

## v1.1.0
### New Features
- **Progress notes:** Notes button on every card opens a popout bubble with timestamped progress log. Hold notes visually distinguished with amber styling and "On Hold" badge.
- **Hold flow:** Putting a card on hold now requires a note explaining the reason. Resume clears hold without requiring a note.
- **Weekly summary panel:** Sidebar panel showing this week's upcoming tasks, last week's completions and updates, and blocked/on-hold tasks with reasons. Includes "Copy for standup" button.
- **Stacks:** Expandable parent cards with subtask children. Progress bar shows completion. Children sorted by due date. AI auto-creates stacks for complex tasks.
- **Calendar due date picker:** (Moved to v1.3.2)
- **Tag auto-apply:** (Moved to v1.3.3)

## v1.0.0
### Initial Release
- Four-column Kanban board (Backlog, Up Next, In Progress, Done)
- AI command bar for natural language task creation
- Priority badges (Critical, High, Medium, Low)
- Tag system with 16 built-in tags and custom tag support
- Drag and drop between columns
- Column focus/expand mode
- Due date inference and work-day scheduling
- On-hold state with hold badge
- Tag Manager drawer with AI tag suggestions
- Filter by priority and tag
- Custom Windows titlebar with minimize/maximize/close
- Light and dark mode
- Per-user AppData storage (tasks.json, config.json)
- NSIS installer with desktop and Start Menu shortcuts
