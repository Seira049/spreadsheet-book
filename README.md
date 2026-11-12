# Spreadsheets from Zero

Two interactive books, **Excel** and **Google Sheets**, that teach spreadsheets from zero to intermediate.
Each book has 12 chapters and 41 lessons, with live practice sheets that check answers as you type, quizzes, and progress saved in the browser.
Readers choose **Windows or Mac**, and every keyboard shortcut in the lessons adjusts to match.

**Live site: https://seira049.github.io/spreadsheet-book/**

---

## How to run it

The book is a plain website: HTML, CSS and JavaScript only. There is no server code, no database and nothing to install or build. Pick the case that fits you.

### 1. Just using the books: hosted, nothing to install

Open the link in any browser, on a computer, tablet or phone:

**https://seira049.github.io/spreadsheet-book/**

GitHub Pages hosts it for free, and it is always online. Choose Windows or Mac, pick a book and start. Progress is saved in that browser only. Nothing is sent anywhere.

### 2. Editing the lessons: run it locally

Get a copy of the project:

```sh
git clone https://github.com/Seira049/spreadsheet-book.git
cd spreadsheet-book
```

**Option A, quickest:** double-click `index.html`. It opens in your browser.

**Option B, closest to the live site** (needs Python 3, which macOS already includes):

```sh
python3 -m http.server 8080
```

Then open **http://localhost:8080**. Press **Ctrl+C** in the terminal to stop the server.

The lesson text lives in `js/content/part1.js`, `part2.js` and `part3.js`. Save a file, then refresh the browser to see your change.

### 3. Updating the live site after editing

```sh
git add -A
git commit -m "Describe your change"
git push
```

GitHub rebuilds the site in about a minute. If you still see the old version, hard-refresh with **⌘+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows).

### 4. Optional: run the tests before pushing

The tests need [Node.js](https://nodejs.org/). The browser test also needs [Playwright](https://playwright.dev/) (`npm install playwright && npx playwright install chromium`).

```sh
npm test                                  # formula engine tests
python3 -m http.server 8765 &             # start a local server for the browser test
node tests/e2e.cjs                        # opens every lesson in both books, on Windows and Mac,
                                          # solves every exercise and answers every quiz
```

To run the browser test against the live site instead, set the address:

```sh
BASE_URL=https://seira049.github.io/spreadsheet-book node tests/e2e.cjs
```

### Summary

| You want to… | Where | You need |
|---|---|---|
| Read the books | Hosted, at the link above | A browser |
| Edit and preview | Locally | The project folder, plus Python 3 for Option B |
| Publish your edits | Hosting, via `git push` | Git and push access to this repo |
| Run the tests | Locally | Node.js, plus Playwright for the browser test |

---

## Hosting somewhere else

Any static host works. Upload the folder's contents. You can leave out `tests/`, `package.json` and this README.

- **GitHub Pages** (used now): repo Settings › Pages › Deploy from a branch › `main` / root.
- **Netlify Drop**: drag the folder onto https://app.netlify.com/drop.
- **Cloudflare Pages**: connect the repo, leave the build command empty, and set the output directory to `/`.

## Project layout

| Path | What it is |
|---|---|
| `index.html` | Landing page: choose Windows or Mac, then pick a book |
| `book.html?track=excel&os=win` | The reader. `track` is `excel` or `sheets`, and `os` is `win` or `mac` |
| `js/engine.js` | Formula engine: parser, about 70 functions, reference shifting for copy/fill |
| `js/grid.js` | Practice spreadsheet: editing, fill handle, copy/paste, F4, formats, sorting, charts, task checks |
| `js/content/helpers.js` | Content helpers, including the Windows-to-Mac shortcut mapping |
| `js/content/part1.js` to `part3.js` | Lesson text, exercises and quizzes. One outline with Excel- and Sheets-specific text, plus a track-only chapter 11 |
| `js/app.js` | Navigation, progress, quizzes and the Windows/Mac switch |
| `css/style.css` | All styles, including dark mode and the mobile layout |
| `tests/` | Engine unit tests and the end-to-end browser test |

---

Excel is a trademark of Microsoft. Google Sheets is a trademark of Google. This is an independent learning resource and is not affiliated with either company.
