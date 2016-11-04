HOW TO DEVELOP
--------------

### setup

- make sure you installed jekyll and grunt in your computer
- `$ bundle install`
- `$ npm install`
- `$ jekyll build`
- `$ grunt build`

in order to create thumbnails, you'll need ffmpeg.

### development server
run `jekyll serve` to create a local server at localhost:4000

### adding experiments

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
to `_thumbnails/[name].mov` and run the following commands to create
the image and video thumbnails:

```
ffmpeg -i _thumbnails/UU00UUE3.mov -r 1 -s 320x500 -f image2 thumbnails/UU00UUE3.jpg
ffmpeg -i _thumbnails/UU00UUE3.mov thumbnails/UU00UUE3.webm
ffmpeg -i _thumbnails/UU00UUE3.mov -c:v libx264 -crf 15 thumbnails/UU00UUE3.mp4
```

TODO: incorporate this as a grunt task


LOCAL STAGING
-------------
before deploying you can make sure all the compiled files work building
everything and serving a staging server locally.

run `$ grunt staging` to build and site the stagin will be served to
localhost:4001

TODO


the final file structure, after everything is built
```
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
|   ├── UU00UUE1.jpg
|   ├── UU00UUE1.webm
|   ├── UU00UUE1.mp4
|   ├── UU00UUE2.jpg
|   ├── UU00UUE2.webm
|   └── UU00UUE2.mp4
├── textures
|   ├── cola-base.png
|   └── cola-paper.png
└── audio
    ├── UU00UUE1-base.wav
    ├── UU00UUE1-drums.wav
    ├── UU00UUE2-base.wav
    └── UU00UUE2-drums.wav
```



HOW TO DEPLOY
-------------

- install surge, create an acount and a project
- edit `domain: [...]` in `Gruntfile.js`
- `$ grunt deploy`
