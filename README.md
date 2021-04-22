# open-anki-roam

Easily show relevant Anki cards for a given page in Roam. Install like any other `roam/js` script (check the code first!). Typically, this means pasting the contents of `open-anki.js` in a nested javascript code block under `{{[[roam/js]]}}`

## Assumed setup

- Tag Structure: I like to use the Attribute `Anki Tag::` to mark pages. For instance, if I'm on the page "The Art of Doing Science and Engineering (book)" and I want to make flashcards in Anki, I will create a top-level block on the page like `Anki Tag::[ArtOfScience, Hamming]`. I include `[ArtOfScience, Hamming]` in any flashcards I create in Anki that are relevant to this page. I typically prepend this to the card contents.
- This requires Anki and the AnkiConnect extension. Anki must be running.
- Go to Anki -> Tools -> Addons -> Anki Connect -> Config and amend `webCorsOriginList` to include `https://roamresearch.com`
- You can modify the Attribute used in the js script.
