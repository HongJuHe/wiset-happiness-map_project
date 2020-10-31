var express = require('express');
var router = express.Router();
const Nodegeocoder = require('node-geocoder');
const options = { provider: 'openstreetmap' };
const geocoder = Nodegeocoder(options);
const querystring = require('querystring');
const load = require('node-google-panorama-equirectangular');
const request = require('request');

router.get('/', function (req, res, next) {
  res.render('layout', { title: 'map' });
})

router.get('/search', function (req, res, next) {
  res.render('form', { title: 'searchmap' });
});

router.post('/search', function (req, res, next) {
  var starta;
  var starto;
  var enda;
  var endo;

  geocoder.geocode(req.body.start).then((resp) => {
    starta = resp[0].latitude;
    starto = resp[0].longitude;

    geocoder.geocode(req.body.final).then((respond) => {
      enda = respond[0].latitude;
      endo = respond[0].longitude;
      var query = querystring.stringify({
        "starta": starta,
        "starto": starto,
        "enda": enda,
        "endo": endo,
      });
      res.redirect('/staticview/?' + query);
    }).catch((err) => {
      console.log(err);
    });
  }).catch((err) => {
    console.log(err);
  });
});

/* GET staticview page. */
router.get('/staticview/', function (req, res, next) {
  var output = [];
  //console.log(req.query);
  output[0] = req.query.starta;
  output[1] = req.query.starto;
  output[2] = req.query.enda;
  output[3] = req.query.endo;
  //console.log(output[0]);

  res.render('staticview2', { title: 'StaticView', result: output });
});

router.get('/roadview', function (req, res, next) {
  res.render('form', { title: 'street view' });
});

router.post('/roadview', function (req, res, next) {
  var starta;
  var starto;
  var enda;
  var endo;

  geocoder.geocode(req.body.start).then((resp) => {
    starta = resp[0].latitude;
    starto = resp[0].longitude;

    geocoder.geocode(req.body.final).then((respond) => {
      enda = respond[0].latitude;
      endo = respond[0].longitude;
      var query = querystring.stringify({
        "starta": starta,
        "starto": starto,
        "enda": enda,
        "endo": endo,
      });
      res.redirect('/roadview/capture/?' + query);
    }).catch((err) => {
      console.log(err);
    });
  }).catch((err) => {
    console.log(err);
  });
});

/* GET roadview page. */
router.get('/roadview/capture/', function (req, res, next) {
  var output = [];
  console.log(req.query);
  output[0] = req.query.starta;
  output[1] = req.query.starto;
  output[2] = '';
  output[3] = 1;

  var cnta = Math.abs(req.query.enda - req.query.starta) / 0.001;
  var cntb = Math.abs(req.query.endo - req.query.starto) / 0.001;
  var cnt = 0;
  if (cnta > cntb) {
    cnt = cntb;
  }
  else {
    cnt = cnta;
  }
  var id = "";
  async function readyimage(id) {
    load(id, { zoom: 1 }).on('complete', function () {
      console.log("finish");
    }).on('progress', function (progress) {
      //console.log(progress+'%')
    }).on('imageready', function (image) {
      image.jimpImage.write('./data/' + id + '.jpg')
    })
  }

  async function imagecapture(starta, starto, i) {
    console.log(i);
    let url = "https://maps.googleapis.com/maps/api/streetview/metadata?size=600x300&location=" + starta + "," + starto + "&pitch=42&fov=110&key=AIzaSyC9IdFMHYXFORRXqac0rnZnPfAhMfY0MpA";
    request(url, function (error, response, body) {
      var n = body.search("pano_id");
      var e = body.search("status");
      for (var i = n + 12; i < e - 7; i++) {
        id += body[i].toString();
      };
      console.log(id);
      try {
        readyimage(id);
      } catch (error) {
        console.log(error);
      }
    });
  }

  const firstrunpy = function () {
    const { spawn } = require('child_process');
    //const childPython = spawn('python', ['--version']);
    const childPython = spawn('python', ['C:/Users/347/wiset/map/routes/erect2cubig.py', id]);

    childPython.stdout.on('data', (data) => {
      console.log('stdout:' + data);
    });

    childPython.stderr.on('data', (data) => {
      console.log('stderr:' + data);
    });

    childPython.on('close', (code) => {
      console.log('child process exited with code : ' + code);
    });
  }
  var id_cube = id + "Out";
  var temp_str = '/images/' + id_cube + '.jpg';
  output[2] = temp_str;
  const serunpy = function () {
    const { spawn } = require('child_process');
    const childPython = spawn('python', ['C:/Users/347/wiset/map/routes/erect2cubig.py', id_cube]);

    childPython.stdout.on('data', (data) => {
      console.log('stdout:' + data);
    });

    childPython.stderr.on('data', (data) => {
      console.log('stderr:' + data);
    });

    childPython.on('close', (code) => {
      console.log('child process exited with code : ' + code);
    });
  }

  for (let i = 0; i < cnt; i++) {
    var a = req.query.starta * 1 + i * 0.001;
    var o = req.query.starto * 1 + i * 0.001;
    console.log(a);
    console.log(o);
    imagecapture(a, o, i);
  }
  firstrunpy();
  res.render('roadview', { title: 'RoadView', result: output });

  serunpy();
});

module.exports = router;
