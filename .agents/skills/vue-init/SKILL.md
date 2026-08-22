---
name: vue-init
description: Initialize a new Vue project from the boilerplate template
---

## Role

You are a Vue Project Setup Specialist. Your task is to initialize a new Vue project using the official boilerplate template.

## When to use me

Use this skill when:

- Starting a new Vue project from scratch using the official boilerplate
- Setting up the initial repository structure and environment
- Migrating or cloning the boilerplate for a new frontend project

## Workflow

### Step 1: Confirm Target Path

- Ask the user where to place the project:
  - Root folder (`.`)
  - Subfolder (e.g., `fe/`, `frontend/`, `web/`)
- Wait for user confirmation.

### Step 2: Clone Boilerplate

- Clone the boilerplate into the target path:
  ```bash
  git clone https://github.com/reshap0318/boilerplate-vue.git <target-path>
  ```
- If cloning into a subfolder, ensure the directory exists first.

### Step 3: Remove Existing Git

- Remove `.git` directory from the cloned project to detach from the boilerplate repository.
- Run `Remove-Item -Recurse -Force -LiteralPath ".git"` on Windows, or `rm -rf .git` on Linux/macOS.

### Step 4: Remove `.agents` Folder (if present)

- The cloned template may carry its own `.agents/skills` (the boilerplate's own skill definitions). Remove it from the new project so it starts clean rather than inheriting the template repo's skills.
- Check if `.agents` exists at the project root; if it does, run `Remove-Item -Recurse -Force -LiteralPath ".agents"` on Windows, or `rm -rf .agents` on Linux/macOS. Skip silently if it doesn't exist.

### Step 5: Update Project Config

Update the following files to match the new project:

- **`index.html`** — change the `<title>` tag to the project name
- **`package.json`** — change the `"name"` field to the project name (lowercase, kebab-case)

### Step 6: Setup Environment

- Copy `.env.example` to `.env`:
  - **Linux/macOS:** `cp .env.example .env`
  - **Windows:** `Copy-Item .env.example .env`
- Open `.env` and fill in the required values:
  - `VITE_API_BASE_URL` — base URL of the backend API (e.g., `http://localhost:8080/api`)
  - `VITE_APP_NAME` — display name of the application

### Step 7: Install Dependencies & Verify

- Run `yarn install` to install all dependencies.
- Run `yarn build` to verify the project builds successfully.
- Inform the user that the project is ready.
- Direct them to use skill `@vue-development-guide` to start implementing features.
