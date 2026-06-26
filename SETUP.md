# Flowboard — Setup Guide (Windows)

## What You Need
- About 10 minutes
- An internet connection
- Your Anthropic API key (get one free at https://console.anthropic.com)

---

## Step 1 — Install Node.js

1. Go to **https://nodejs.org**
2. Click the big green **"LTS"** button to download the installer
3. Run the downloaded `.msi` file
4. Click through the installer — all default options are fine
5. When it's done, click **Finish**

To verify it worked: press `Win + R`, type `cmd`, press Enter, then type:
```
node --version
```
You should see something like `v20.x.x`. If you do, Node is installed!

---

## Step 2 — Set Up Flowboard

1. **Move the `flowboard` folder** somewhere permanent on your computer — for example:
   ```
   C:\Users\YourName\flowboard
   ```
   (Don't leave it in Downloads — pick a home for it.)

2. **Open a Command Prompt in that folder:**
   - Open File Explorer and navigate to your `flowboard` folder
   - Click the address bar at the top, type `cmd`, and press Enter
   - A Command Prompt window will open already in the right folder

3. **Install dependencies** by typing this and pressing Enter:
   ```
   npm install
   ```
   This will take 1–3 minutes. You'll see a progress bar. Wait for it to finish.

---

## Step 3 — Run Flowboard

In the same Command Prompt window, type:
```
npm start
```

Flowboard will launch as a desktop window!

---

## Step 4 — Enter Your API Key

The first time you open Flowboard, it will prompt you to enter your Anthropic API key.

1. Go to **https://console.anthropic.com**
2. Sign in (or create a free account)
3. Click **"API Keys"** in the left sidebar
4. Click **"Create Key"**, give it a name like "Flowboard", and copy the key
5. Paste it into the Flowboard prompt and click **Save Key**

Your key is stored only on your computer — it never goes anywhere except directly to Anthropic when you add a task.

---

## Step 5 — Create a Shortcut (Optional)

So you don't have to use the Command Prompt every time:

1. In the `flowboard` folder, create a new text file
2. Paste this into it:
   ```
   @echo off
   cd /d "%~dp0"
   npm start
   ```
3. Save it as `Launch Flowboard.bat` (make sure the extension is `.bat`, not `.txt`)
4. Double-click `Launch Flowboard.bat` any time to open the app
5. You can right-click it → **Send to → Desktop (create shortcut)** for a desktop icon

---

## Using Flowboard

Type tasks in plain English in the bar at the bottom. Examples:

- *"Finish the budget report by Friday, high priority"*
- *"I'm currently working on the website redesign"*
- *"Schedule dentist appointment sometime next month"*
- *"Send recap email and prep slides for Monday standup"*

The AI will parse your words into cards and place them in the right column automatically.

**Keyboard shortcut:** Press `Enter` to add · `Shift+Enter` for a new line

Your tasks are saved automatically and will be there next time you open the app.

---

## Troubleshooting

**"npm is not recognized"** — Node.js didn't install correctly. Try restarting your computer and running `npm install` again.

**"Cannot find module 'electron'"** — Run `npm install` again in the flowboard folder.

**Tasks not saving** — Make sure you're always launching from the same folder.

**API key error** — Double-check your key at console.anthropic.com. Keys start with `sk-ant-`.
