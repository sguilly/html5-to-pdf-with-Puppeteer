const http = require('http');

const options = {
  method: 'GET',
  host: 'localhost',
  port: '3000',
  path: '/metrics',
};

const request = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', function(err) {
  console.log('ERROR: ', err);
  process.exit(1);
});

request.end();
