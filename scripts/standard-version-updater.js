const exec = require('child_process').exec;

module.exports.readVersion = function(contents) {
  return '¯\\_(ツ)_/¯';
};

module.exports.writeVersion = function(contents, version) {
  // Check if we are releasing in PROD or not
  const regex = /\d+.\d+.\d+-.+/;
  if (regex.test(version)) {
    // Not PROD
    exec(`sed s/IMAGE_TAG/${version}/g docker-compose-PREPROD-TEMPLATE.yml > docker-compose-PREPROD.yml`);
  } else {
    // PROD
    exec(`sed s/IMAGE_TAG/${version}/g docker-compose-TEMPLATE.yaml > docker-compose.yaml`);
  }

  exec(`sed s/IMAGE_TAG/${version}/g sonar-project-TEMPLATE.properties > sonar-project.properties`);
  return contents;
};
