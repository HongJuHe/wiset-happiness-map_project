# NodeGooglePanoramaEquirectangular
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

[![2d](http://i.imgur.com/AukW6Mv.png)](http://mattdesl.github.io/google-panorama-equirectangular/demo/)

## Description
Package to bring https://github.com/mattdesl/google-panorama-equirectangular to node

## Install

```sh
#npm
npm install node-google-panorama-equirectangular --save

#yarn
yarn add node-google-panorama-equirectangular
```

### Basic use

```js
const load = require('node-google-equirectangular')

// Use an id
load('dXZfBMex9_L7jO2JW3FTdA', { zoom: 3 } )
  .on('complete', function () {
    // everything's finished
  })
  .on('progress', function (progress) {
    console.log(progress + '%')
  })
  .on('imageready', function (image) {
    image.jimpImage.write(image.id + '.jpg')
  })

// ...

//use an array of id
load(['dXZfBMex9_L7jO2JW3FTdA', 'dXZfBMex9_L7jO2JW3FTdA'], { zoom: 4 })
  .on('complete', function () {
    // everything's finished
  })
  .on('progress', function (progress) {
    console.log(progress + '%')
  })
  .on('imageready', function (image) {
    image.jimpImage.write(image.id + '.jpg')
  })

```