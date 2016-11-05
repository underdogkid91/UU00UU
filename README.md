
```
/\ \/\ \/\ \/\ \  /'__`\  /'__`\/\ \/\ \/\ \/\ \    
\ \ \ \ \ \ \ \ \/\ \/\ \/\ \/\ \ \ \ \ \ \ \ \ \   
 \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \  
  \ \ \_\ \ \ \_\ \ \ \_\ \ \ \_\ \ \ \_\ \ \ \_\ \ 
   \ \_____\ \_____\ \____/\ \____/\ \_____\ \_____\
    \/_____/\/_____/\/___/  \/___/  \/_____/\/_____/

 exploring nonsense 3d interactions through webtoys

空 空 空 空 空 空 空 空 空 空 空 空 空 空 空 空 空 空
```

[ ~VISIT HERE ~](https://uu00uu.surge.sh/)



HOW TO DEVELOP
--------------

### setup
make sure you installed jekyll and grunt in your computer

```
$ bundle install
$ npm install
```

in order to create thumbnails, you'll need ffmpeg
in order to deploy to surge, you'll need surge :v:

### development
for info on how to develop for jekyll, visit [jekyll's awesome docs](https://jekyllrb.com/docs/home/).

to create a local server that serves the experiments/webtoys run:

```
$ grunt dev
```
in development there's no compilation of files of any type, in order
to avoid compilation time and make creating webtoys fun – that's
the point after all. for production, almond is used to compile all
the scripts, more on that later.

### adding experiments

1. create a file: `_experiments/[name].md`
```
---
title: [name]
published: false
---
```

2. create an experiment in `_src/experiments/[name].js`. dimensions.js
is used. folder structure:
  - experiments
  - scenes
  - objects
  - materials

3. textures can be added to `textures/`

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


the final folders structure, after everything is built
```
├── index.html
├── e
|   ├── UU00UUE1
|   |   └── index.html
|   └── UU00UUE2
|       └── index.html
├── js
|   ├── e/UU00UUE1.js
|   └── e/UU00UUE2.js
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
