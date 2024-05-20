const fs = require('fs');
const path = require('path');

const defaultAngularJson = 'angular.json';
const webAngularJson = 'angular-web.json';
const mobileAngularJson = 'angular-mobile.json';
const defaultConfigXml = 'config.xml';
const goConfigXml = 'config-gonnaorder-app.xml';
const goTemplateConfigXml = 'config-template-app.xml';
const goadminConfigXml = 'config-goadmin-app.xml';

const args = process.argv.slice(2);
if (args.length > 0) {
  if (!((args.length === 1 && 'web' === args[0]) ||
    (args.length === 2 && 'mobile' === args[0] && ['godev', 'go', 'goadmindev', 'goadmin'].includes(args[1])))) {
    console.log('Usage: node edit-config-files.js web/mobile go/goadmin ');
    process.exit(1);
  }
  overwriteConfigFiles(args[0], args[1]);
}

function overwriteConfigFiles(platform, appMode) {

  try {
    if (platform === 'web') {
      fs.writeFileSync(path.join(__dirname, defaultAngularJson),
        fs.readFileSync(path.join(__dirname, webAngularJson), 'utf8'));
      console.log(`Overwritten ${defaultAngularJson} with ${webAngularJson}`);
    } else {
      fs.writeFileSync(path.join(__dirname, defaultAngularJson),
        fs.readFileSync(path.join(__dirname, mobileAngularJson), 'utf8'));
      console.log(`Overwritten ${defaultAngularJson} with ${mobileAngularJson}`);

      if (appMode === 'godev' || appMode === 'go') {
        fs.writeFileSync(path.join(__dirname, defaultConfigXml),
          fs.readFileSync(path.join(__dirname, goConfigXml), 'utf8').replace('godev', appMode));
        console.log(`Overwritten ${defaultConfigXml} with ${goConfigXml}`);
      } else if (appMode === 'gotemplatedev' || appMode === 'gotemplate') {
        fs.writeFileSync(path.join(__dirname, defaultConfigXml),
          fs.readFileSync(path.join(__dirname, goTemplateConfigXml), 'utf8').replace('gotemplatedev', appMode));
        console.log(`Overwritten ${defaultConfigXml} with ${goTemplateConfigXml}`);
      } else {
        fs.writeFileSync(path.join(__dirname, defaultConfigXml), 
          fs.readFileSync(path.join(__dirname, goadminConfigXml), 'utf8').replace('goadmindev', appMode));
        console.log(`Overwritten ${defaultConfigXml} with ${goadminConfigXml}`);
      }
    }
  } catch (err) {
    console.error('Error overwriting configuration:', err);
    process.exit(1);
  }
}

module.exports = {
  overwriteConfigFiles
};
