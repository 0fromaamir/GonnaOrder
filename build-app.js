const inquirer = require('inquirer');
const buildAppUtils = require('./build-app-utils')

var questions = [
  {
      type: 'list',
      name: 'appMode',
      message: "Choose the App Mode: ",
      choices: ['godev', 'goadmindev', 'go', 'gotemplate', 'goadmin']
  },
  {
      type: 'list',
      name: 'platform',
      message: "Choose the Platform: ",
      choices: ['android', 'ios']
  },
  {
    type: 'list',
    name: 'template',
    message: "Choose the Template: ",
    choices: buildAppUtils.getTemplateNames(),
    when: (answers) => answers.appMode === 'gotemplate'
  }
]

inquirer.prompt(questions).then(async answers => {
  console.log(answers);

  const appMode = answers.appMode;
  const platform = answers.platform;
  const isGoApp = appMode === 'godev' || appMode === 'go';
  const isTemplateApp = appMode === 'gotemplatedev' || appMode === 'gotemplate';
  const isAdminApp = !isGoApp && !isTemplateApp;
  const isAndroid = platform === 'android';
  const appType = appMode === 'godev' || appMode === 'go' ? 'customer' : (appMode === 'gotemplatedev' || appMode === 'gotemplate' ? 'template' : 'admin');
  const template = buildAppUtils.generateTemplate(appMode, answers.template);
  const storeAlias = buildAppUtils.getStoreAlias(appType, template);

  try {
    buildAppUtils.generateTraslationFiles();
    buildAppUtils.setupConfigs(platform, appType, appMode, template);
    buildAppUtils.removeInstalledPlugins(appType, template);

    if (isGoApp) {
      buildAppUtils.installPlugins(appType, template);
    }

    if (isTemplateApp) {
      buildAppUtils.installTemplatePlugins(appType, template);
    }

    if (isAdminApp) {
      buildAppUtils.installAdminPlugins(appType, template);
    }

    buildAppUtils.reinstallPlatform(platform);

    if (isAndroid) {
      await buildAppUtils.updatePlatformInfo(platform, appType, appMode, template);      
    }

    buildAppUtils.buildApp(platform, appMode, appType, template);

  } catch (err) {
    console.error('Error while building app: ', err);
    process.exit(1);
  }
}).catch(err => {
  console.error(err);
  console.error("terminating...")
  process.exit(1);
})
