# Flowboard

A personal AI-powered Kanban board that runs as a native desktop app on Windows. Add tasks in plain English and let Claude parse them into the right column, priority, and tags automatically.

## Features

- Natural language task input powered by Claude
- Four-column Kanban board: Backlog → Up Next → In Progress → Done
- Auto-tagging (16 categories) and priority color coding
- Due date parsing including relative dates ("next Friday", "end of week")
- Sidebar with column stats and priority filtering
- Full-text search
- Tasks persist automatically between sessions
- API key stored securely on your local machine

## Requirements

- Windows 10 or later
- Node.js LTS (https://nodejs.org)
- An Anthropic API key (https://console.anthropic.com)

## Setup

```bash
git clone https://github.com/YOUR_USERNAME/flowboard.git
cd flowboard
npm install
npm start
```

Enter your Anthropic API key when prompted on first launch.

## Pulling Updates

When new features are available:

```bash
cd flowboard
git pull
npm start
```

If `npm install` is mentioned in the update notes, run that too before starting.

## Project Structure

```
flowboard/
├── main.js          # Electron main process, IPC handlers, Anthropic API calls
├── preload.js       # Secure bridge between main and renderer
├── src/
│   └── index.html   # All UI — board, sidebar, command bar
├── assets/
│   └── icon.png     # App icon
└── package.json
```
