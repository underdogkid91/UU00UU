
HOW TO ADD AN EXPERIMENT
------------------------

1. create a file: `_experiments/[name].md`
```
---
title: [name]
published: false
release-date: mid july
---
```

2. create experiment in `src/experiments/[name].js` using requirejs,
grunt will compile it and export it to `js/e/[name].js` and jekyll
will copy it to `_site/...`

3. textures can be added to `textures/` and sounds to `audio/`

4. when ready to publish: change `published` to `true`, add a video
to `thumbnails/[name].webm` and a thumbnail to `thumbnails/[name].jpg`

the final file structure, after jekyll and grunt:

.
├── index.html
├── e
|   ├── UU00UUE1
|   |   └── index.html
|   └── UU00UUE2
|       └── index.html
├── js
|   ├── UU00UUE1.js
|   └── UU00UUE2.js
├── thumbnails
|   ├── UU00UUE1.webm
|   ├── UU00UUE1.jpg
|   ├── UU00UUE2.webm
|   └── UU00UUE2.jpg
├── textures
|   ├── cola-base.png
|   └── cola-paper.png
└── audio
    ├── UU00UUE1-base.wav
    ├── UU00UUE1-drums.wav
    ├── UU00UUE2-base.wav
    └── UU00UUE2-drums.wav


