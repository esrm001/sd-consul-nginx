const express = require('express');
let   app     = express();
const port = process.env.PORT || 3000;
const rq   = require('request-promise');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const svcDefinition = {
  "ID": "svc-1",
  "Name": "svc",
  "Tags": [
    "primary",
    "v1"
  ],
  "Address": "svc",
  "Port": 3000,
  "Meta": {
    "svc_version": "1.0"
  },
  "EnableTagOverride": false,
  "Check": {
    "DeregisterCriticalServiceAfter": "90m",
    "HTTP": "http://svc:3000/api/health",
    "Interval": "10s",
    "Timeout": "2s",
  }
}

let options = {
  uri: 'http://consul:8500/v1/agent/service/register',
  method: 'PUT',
  json: true,
  body: svcDefinition,
};

const PAUSE = 3000;

console.log('starting...');
Promise.resolve()
.then(() => {
  return new Promise(function(resolve) {
    setTimeout(function() { resolve() }, PAUSE);
  });
})
.then( () => {
  console.log('initialise with consul');
  return rq(options);
})
.then(() => {
  let router = express.Router()
  router.route('/').get(function(req, res) {
    res.status(200).json({message: "Welcome to Svc API"});
  });
  router.route('/shutdown').get(function(req, res) {
    let opts = {
      uri: 'http://consul:8500/v1/agent/service/deregister/svc-1',
      method: 'PUT',
      json: true,
      body: {},
    };
    rq(opts)
    .then(() => {
      res.status(200).json({message: "Shutdown (deregister success)"});
      process.exit(0);
    })
    .catch((e) => {
      console.error(e.message);
      res.status(200).json({message: "Shutdown (deregister failed)"});
      process.exit(1);
    });
  });
  router.route('/health').get(function(req, res) {
    res.status(200).end();
  });
  app.use(bodyParser.json());
  app.use(morgan('combined'));
  app.use('/api', router);
  app.listen(port, () => {
    console.log('http: ', port);
    process.on('SIGTERM', function() {
      console.log('SIGTERM detected');
      process.exit(0);
    });
  })
})
.catch((e) => {
  console.log(e.message);
  process.exit(1);
});

