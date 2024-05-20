const fs = require("fs");
const fsPromise = require("fs").promises;
const path = require('path');
const { execSync } = require('child_process');
const editConfigFiles = require('./edit-config-files');

function getTemplateNames() {
    const dir = 'apps-meta/template';
    
    try {
      let files = fs.readdirSync(dir);
      let templates = files.filter(file => fs.statSync(path.join(dir, file)).isFile());
      let templatesNames = templates.map(file => path.parse(file).name);
      
      return Object.values(templatesNames);
    } catch (err) {
      console.error(`Fail read file in ${dir}: ${err}`);
      return [];
    }
}

function getMetaData(metaType, metaName) {
    let rawTemplateData = fs.readFileSync(`apps-meta/${metaType}/${metaName}.json`);
    return JSON.parse(rawTemplateData);
}

function getMetaBundleID(metaType, metaName) {
    let templateData = getMetaData(metaType, metaName);
    const segments = templateData.bundleId.split('.');
    return segments[segments.length-1];
}

// async function editFacebookPluginManifest(template) {
//     var xmlPluginData = await fsPromise.readFile('plugins/cordova-plugin-facebook-connect/plugin.xml', 'utf-8');
//     xmlPluginData = xmlPluginData.replace(/<provider[^>]*\sandroid:authorities="([^"]*)"[^>]*>/, (match, idValue) => {
//         return `<provider android:authorities="com.gonnaorder.${template}.com.facebook.app.FacebookContentProvider$APP_ID"
//                 android:name="com.facebook.FacebookContentProvider"
//                 android:exported="true" />`
//     });
//     await fsPromise.writeFile(path.join(__dirname, 'plugins/cordova-plugin-facebook-connect/plugin.xml'), xmlPluginData);
//     console.log(`Updated AndroidManifest file to avoid duplicate Facebook authorities.`);
// }
  
async function editGradleBuild(appMode) {
    const gradleConfigPath = 'platforms/android/cdv-gradle-config.json';
    try {
        // Reading and updating cdv-gradle-config.json
        let cgcData = await fsPromise.readFile(gradleConfigPath, 'utf-8');
        let cgcDataJson = JSON.parse(cgcData);
        cgcDataJson.MIN_SDK_VERSION = 21;
        await fsPromise.writeFile(gradleConfigPath, JSON.stringify(cgcDataJson));
        console.log(`Updated Cordova Gradle Properties.`);
        
        // Reading and updating phonegap-plugin-barcodescanner gradle file
        const barcodeScannerGradlePath = `platforms/android/phonegap-plugin-barcodescanner/${appMode}-barcodescanner.gradle`;
        let qrData = await fsPromise.readFile(barcodeScannerGradlePath, 'utf-8');
        qrData = qrData.replace(new RegExp('compile', 'g'), 'implementation');
        await fsPromise.writeFile(barcodeScannerGradlePath, qrData);
        console.log(`Updated ${appMode}-barcodescanner.gradle file to avoid 'compile() method not found' issue due to phonegap-plugin-barcodescanner.`);
        
        // Reading and updating app/build.gradle to avoid duplicate class issues
        const appBuildGradlePath = 'platforms/android/app/build.gradle';
        let appBuildData = await fsPromise.readFile(appBuildGradlePath, 'utf-8');
        if (!appBuildData.includes('com.google.zxing')) {
            appBuildData += "\nconfigurations {\n\timplementation.exclude group: 'com.google.zxing'\n}\n";
            await fsPromise.writeFile(appBuildGradlePath, appBuildData);
            console.log(`Updated App build.gradle file to avoid 'Duplicate class com.google.zxing' issue due to cordova-plugin-qrscanner.`);
        }
        
        // Reading and updating build.gradle to avoid duplicate class issues
        const buildGradlePath = 'platforms/android/build.gradle';
        let buildData = await fsPromise.readFile(buildGradlePath, 'utf-8');
        if (!buildData.includes('com.google.zxing')) {
            buildData += "\nconfigurations {\n\timplementation.exclude group: 'com.google.zxing'\n}\n";
            await fsPromise.writeFile(buildGradlePath, buildData);
            console.log(`Updated build.gradle file to avoid 'Duplicate class com.google.zxing' issue due to cordova-plugin-qrscanner.`);
        }
    } catch (error) {
        console.error('Error modifying gradle files:', error);
    }
}

function generateTraslationFiles() {
    execSync("node node_modules/angular-translate-csv-to-json angular-translate-csv-to-json-admin.config.json", {stdio: 'inherit'});
    execSync("node node_modules/angular-translate-csv-to-json angular-translate-csv-to-json-public.config.json", {stdio: 'inherit'});
}

function setupConfigs(platform, appType, appMode, template) {
    editConfigFiles.overwriteConfigFiles(platform, appMode);

    const metaData = getMetaData(appType, template);
    
    setupAppImages(platform, metaData, appMode);
    updateConfigFileTags(metaData);

    if (appType == 'template') {
        updateEnvFile(appMode, metaData);
    }

    if (platform === 'ios') {
        updatePlistFile(metaData);
    }
}

function setupAppImages(platform, metaData, appMode) {
    fs.copyFileSync(metaData.iconBackgroundUrl, `resources/${platform}/icon-background.png`);
    fs.copyFileSync(metaData.iconForegroundUrl, `resources/${platform}/icon-foreground.png`);
    fs.copyFileSync(metaData.iconUrl, `resources/${platform}/icon.png`);

    let splashUrl = replaceSplash(metaData.splashUrl, platform);

    fs.copyFileSync(splashUrl, `resources/${platform}/splash.png`);

    execSync(`cordova-res ${platform}`, {stdio: 'inherit'});

    console.log(`Updated icons and splash.`);
}

function replaceSplash(splashUrl, platform) {
    let filePath = splashUrl.replace('splash', 'splash-'+platform);
    
    try {
        fs.accessSync(filePath, fs.constants.F_OK);
        return filePath;
    } catch (err) {
        return splashUrl;
    }
}

function updateConfigFileTags(metaData) {
    var xmlData = fs.readFileSync(path.join(__dirname, 'config.xml'), 'utf-8');
    
    xmlData = xmlData.replace(/<widget[^>]*\sid="([^"]*)"[^>]*>/, (match, idValue) => {
        return `<widget android-versionCode="10000" id="${metaData.bundleId}" ios-CFBundleVersion="1.0.0" version="1.0.0" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">`;
    });

    xmlData = xmlData.replace(/\s*<name>(.*?)<\/name>/s, (match, nameValue) => {
        return `<name>${metaData.appName}</name>`;
    });

    xmlData = xmlData.replace(/\s*<description>(.*?)<\/description>/s, (match, nameValue) => {
        return `<description>${metaData.appDescription}</description>`;
    });

    xmlData = xmlData.replace('<preference name="AndroidWindowSplashScreenBackground" value="color" />', (match, nameValue) => {
        return `<preference name="AndroidWindowSplashScreenBackground" value="${metaData.splashBackgroundColor}" />`;
    });
    
    fs.writeFileSync(path.join(__dirname, 'config.xml'), xmlData);
    console.log(`Updated config file tags.`);
}

function updateEnvFile(appMode, metaData) {
    let templateEnvFile = '';

    switch (appMode) {
        case 'go':            
        templateEnvFile = `src/environments/environment.go.prod.ts`;
        break;
        case 'godev':         
        templateEnvFile = `src/environments/environment.go.ts`;
        break;
        case 'gotemplate':    
        templateEnvFile = `src/environments/environment.gotemplate.prod.ts`;
        break;
    }

    if (appMode === 'gotemplate' && metaData.tag === 'DEV') {
        templateEnvFile = `src/environments/environment.gotemplate.ts`;
    }

    var envFile = fs.readFileSync(path.join(__dirname, templateEnvFile), 'utf-8');

    envFile = envFile.replace(/templateStoreAlias:\s*['"][^'"]*['"]/i, `templateStoreAlias: '${metaData.storeAlias}'`);
    envFile = envFile.replace(/defaultDeeplinkAppId:\s*['"][^'"]*['"]/i, `defaultDeeplinkAppId: '${metaData.bundleId}'`);
    envFile = envFile.replace(/defaultDeeplinkAppAndroidUrl:\s*['"][^'"]*['"]/i, `defaultDeeplinkAppAndroidUrl: '${metaData.defaultDeeplinkAppAndroidUrl}'`);
    envFile = envFile.replace(/defaultDeeplinkAppIOSUrl:\s*['"][^'"]*['"]/i, `defaultDeeplinkAppIOSUrl: '${metaData.defaultDeeplinkAppIOSUrl}'`);
    envFile = envFile.replace(/appleClientId:\s*['"][^'"]*['"]/i, `appleClientId: '${metaData.bundleId}'`);
    envFile = envFile.replace(/(^|\s)appId:\s*['"][^'"]*['"]/i, `$1appId: '${metaData.bundleId}'`);

    fs.writeFileSync(templateEnvFile, envFile, 'utf8');
    console.log(`Updated environment file.`);
}

function removeInstalledPlugins(appType, template) {
    const templateData = getMetaData(appType, template);

    try {
        execSync(`ionic cordova plugin remove ionic-plugin-deeplinks --variable URL_SCHEME=${templateData.bundleId} --variable DEEPLINK_HOST=stripe.com`, {stdio: 'inherit'});
    } catch (err) {
        console.error(err);
    }

    try {
        execSync("ionic cordova plugin remove phonegap-plugin-barcodescanner", {stdio: 'inherit'});
    } catch (err) {
        console.error(err);
    }

    try {
        execSync("ionic cordova plugin remove cordova-plugin-statusbar", {stdio: 'inherit'});
    } catch (err) {
        console.error(err);
    }

    try {
        execSync("ionic cordova plugin remove cordova-plugin-bluetooth-serial --save-dev", {stdio: 'inherit'});
    } catch (err) {
        console.error(err);
    }

    try {
        execSync("npm remove file:./external-packages/stores-go-printer-app-plugin --save-dev", {stdio: 'inherit'});
    } catch (err) {
        console.error(err);
    }

    try {
        execSync("npm remove file:./external-packages/stores-go-printer-app-plugin/wrapper --save-dev", {stdio: 'inherit'});
    } catch (err) {
        console.error(err);
    }
}

function getStoreAlias(appType, template) {
    const templateData = getMetaData(appType, template);
    let storeAlias = templateData.storeAlias;

    if (storeAlias !== '') {
        storeAlias = `${storeAlias}.`;
    }

    if (storeAlias == '') {
        storeAlias = `*.`;
    }

    return storeAlias;
}

function installPlugins(appType, template) {
    const templateData = getMetaData(appType, template);

    installDeepLinksPlugin(templateData);
    installStatusbarPlugin();
    execSync("ionic cordova plugin add @starley/barcodescanner-sdk31", {stdio: 'inherit'});
}


function installTemplatePlugins(appType, template) {
    const templateData = getMetaData(appType, template);
    installDeepLinksPlugin(templateData);
    installStatusbarPlugin();
}

function installAdminPlugins(appType, template) {
    const templateData = getMetaData(appType, template);
    installDeepLinksPlugin(templateData);
    installStatusbarPlugin();

    execSync("npm install file:./external-packages/stores-go-printer-app-plugin --save-dev", {stdio: 'inherit'});
    execSync("npm install file:./external-packages/stores-go-printer-app-plugin/wrapper --save-dev", {stdio: 'inherit'});

    execSync("ionic cordova plugin add cordova-plugin-bluetooth-serial", {stdio: 'inherit'});
}

function installDeepLinksPlugin(templateData) {
    execSync(`ionic cordova plugin add ionic-plugin-deeplinks --variable URL_SCHEME=${templateData.bundleId} --variable DEEPLINK_HOST=stripe.com`, {stdio: 'inherit'});
}

function installStatusbarPlugin() {
    execSync(`ionic cordova plugin add cordova-plugin-statusbar`, {stdio: 'inherit'});
}

function reinstallPlatform(platform) {
    execSync(`ionic cordova platform remove ${platform}`, {stdio: 'inherit'});
    execSync(`ionic cordova platform add ${(platform === "android") ? "android@latest" : platform}`, {stdio: 'inherit'});
}

async function updatePlatformInfo(platform, appType, appMode, template) {
    var bundleId = getMetaBundleID(appType, template);
    if (appType == 'admin') {
        bundleId = appMode;
    }

    if (appType !== 'admin') {
        await editGradleBuild(bundleId);
    }

    execSync(`ionic cordova platform remove ${platform}`, {stdio: 'inherit'});
    
    
    // await editFacebookPluginManifest(bundleId);
    // execSync(`ionic cordova platform add ${(platform === "android") ? "android@latest" : platform}`, {stdio: 'inherit'});
    
    if (appType !== 'admin') {
        await editGradleBuild(bundleId);
    }
}

function buildApp(platform, appMode, appType, template) {
    const templateData = getMetaData(appType, template);

    if (appMode === 'gotemplate' && templateData.tag === 'DEV') {
        appMode = 'gotemplatedev';
    }

    execSync(`ionic cordova build ${platform} --configuration ${appMode}`, {stdio: 'inherit'});
}

function generateTemplate(appMode, template) {
    if (template) {
      return template;
    }
  
    switch (appMode) {
      case 'godev': 
        template = 'GonnaOrderDev';
        break;
    
      case 'go':
        template = 'GonnaOrder';
        break;
  
      case 'goadmindev':
        template = 'GoAdminDev';
        break;
  
      case 'goadmin':
        template = 'GoAdmin';
        break;
    }
  
    return template;
}

function updatePlistFile(metaData) {
    try {
        fs.copyFileSync(metaData.googleServiceInfoUrl, 'GoogleService-Info.plist');
    } catch (err) {
        console.log("GoogleService-Info.plist File not found. Skipping...", err);
    }
}

module.exports = {
    getTemplateNames,
    // editFacebookPluginManifest,
    getMetaBundleID,
    editGradleBuild,
    generateTraslationFiles,
    setupConfigs,
    removeInstalledPlugins,
    getStoreAlias,
    installPlugins,
    reinstallPlatform,
    updatePlatformInfo,
    buildApp,
    generateTemplate,
    installAdminPlugins,
    installTemplatePlugins
}