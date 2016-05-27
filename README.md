
HOW TO RUN DEVELOPMENT
----------------------

# setup

- make sure you installed jekyll and grunt in your computer
- `$ bundle install`
- `$ npm install`
- `$ jekyll build`
- `$ grunt build`


# dev mode
when in dev mode, choose one experiment to work on (requirejs task is
slow, this way only that experiment is compiled on file changes)

- `$ grunt dev:[experiment_name]` in one terminal
- `$ jekyll serve` in another terminal

site is served to localhost:4000



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

2. create experiment in `_src/experiments/[name].js` using requirejs,
grunt will compile it and export it to `_site/js/e/[name].js`.

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


HOW TO DEPLOY
-------------

- install surge, create an acount and a project
- edit `domain: [...]` in `Gruntfile.js`
- `$ grunt deploy`
