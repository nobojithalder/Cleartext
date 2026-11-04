<div align="center">
  <h1><img src="docs/cleartext-mark.svg" alt="" width="38" height="38" align="absmiddle"> Cleartext</h1>
  <p><strong>Clean AI text before you use it.</strong><br>Remove hidden formatting and review common writing patterns.</p>
  <p><a href="https://cleartext.nobojit.com/"><img src="docs/visit-cleartext.svg" alt="Visit the live Cleartext site"></a></p>
  <img src="docs/cleartext-preview.png" alt="Cleartext text cleaner interface" width="100%">
  <p><em>Free to use · Runs in your browser · Your text stays on your device</em></p>
</div>

## ✨ Made for your next draft

| 🧹 Clean copied text | 🔎 Review writing patterns |
| --- | --- |
| Remove hidden characters, non-breaking spaces, long dashes, smart quotes, ellipses, and leftover Markdown. | Spot selected phrases, formatting artifacts, and repeated sentence openings as editing prompts. |
| 📝 Review every change | 🔒 Keep it private |
| See the before and after, undo the cleanup, then copy your text. | Processing happens in your browser. The app does not upload your text or require an account. |

> Signal matches are prompts for editing, not an authorship verdict. Common phrases can appear in human writing too.

## Run it locally

Open `index.html` in your browser. On Windows, double-click the file to open it in your default browser. No server, build step, or dependency installation is required.

If your browser restricts the **Copy** button when the page is opened as a file, you can use a local server as a fallback:

```sh
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Project files

- `index.html` — page structure and metadata
- `styles.css` — responsive layout and visual styles
- `app.js` — text cleanup and signal matching
- `docs/cleartext-preview.png` — interface screenshot
- `docs/cleartext-mark.svg` — Cleartext mark used above
- `docs/visit-cleartext.svg` — live site button
