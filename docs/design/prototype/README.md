# Design prototype (source of truth for the revamp)

Open `index.html` through any static server (`python3 -m http.server`) after generating `data.js`:

    node gen-data.js ./data.js ./images-tmp    # pulls real public content from the live site

Live copy (private): https://claude.ai/artifact/VC4kRcVsjZdLde4LqLqrsr

Every screen of the Next.js app is built to match this prototype exactly (public site, admin, analytics,
blog editor), in light and dark, desktop and phone. The "Notes on this screen" under each screen record
what changed and why. Analytics numbers in the prototype are SAMPLE data.
