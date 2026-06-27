# Flowboard Changelog

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
