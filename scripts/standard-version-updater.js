const exec = require('child_process').exec;

//defined Regex with comment containing link to regex101
export const regexProdVersion = /^\d+\.\d+\.\d+$/; // https://regex101.com/r/rmmhOx/1
export const regexPreprodVersion = /^\d+\.\d+\.\d+-[a-zA-Z0-9]+$/; // https://regex101.com/r/70tA3X/1
export const regexSonarVersion = /^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?$/;  //https://regex101.com/r/BtreAE/1

//Function to read version 
module.exports.readVersion = function (contents) {
  return '¯\\_(ツ)_/¯';
};

//Function to write version
module.exports.writeVersion = function (contents, version) {
  exec(`sed s/IMAGE_TAG/${version}/g docker-compose-PREPROD-TEMPLATE.yml > docker-compose-PREPROD.yml`);
  exec(`sed s/IMAGE_TAG/${version}/g docker-compose-TEMPLATE.yaml > docker-compose.yaml`);
  exec(`sed s/IMAGE_TAG/${version}/g sonar-project-TEMPLATE.properties > sonar-project.properties`);

  return contents;
};

