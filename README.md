# Spreadsheets from Zero

Two interactive books, **Excel** and **Google Sheets**, from zero to intermediate.
12 chapters and 41 lessons each, with live practice sheets that check answers as you type, quizzes, and progress saved in the browser.

Plain HTML/CSS/JS. No build step, no server code, no dependencies.

## Run locally

```sh
python3 -m http.server 8080   # then open http://localhost:8080
```

Opening `index.html` directly from the folder also works.

## Host it for free

Upload the folder's contents to any static host. You can leave out `tests/` and `package.json`.

- **GitHub Pages**: push to a GitHub repo, then go to Settings › Pages › Deploy from branch › `main` / root. The site appears at `https://<user>.github.io/<repo>/`.
- **Netlify Drop**: drag the folder onto https://app.netlify.com/drop.
- **Cloudflare Pages**: connect the repo, leave the build command empty, and set the output directory to `/`.

## Project layout

| Path | What |
|---|---|
| `index.html` | Landing page: pick a book |
| `book.html?track=excel` / `?track=sheets` | The reader |
| `js/engine.js` | Formula engine (parser, ~70 functions, reference shifting) |
| `js/grid.js` | Practice spreadsheet widget (editing, fill handle, copy/paste, F4, formats, sort, charts, task checks) |
| `js/content/part1-3.js` | Lesson text, exercises and quizzes. One outline, with Excel- and Sheets-specific text, plus a track-only chapter 11 |
| `js/app.js` | Navigation, progress, quizzes |

## Tests

```sh
npm test                                   # formula engine unit tests
python3 -m http.server 8765 &              # then:
node tests/e2e.cjs                         # Playwright: solves every exercise and quiz in both books
```
