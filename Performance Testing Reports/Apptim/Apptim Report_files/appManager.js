// Returns the device's app name
function getAppName() {
  return state.appInfo.app_name;
}

// Returns the app package name
function getAppPackageName() {
  return state.appInfo.package_name;
}

// Returns the app version name
function getAppVersionName() {
  return state.appInfo.app_version;
}

function getAppImg() {
  return TWO_DIR_BACKWARDS_PATH + "app_icon.png";
}

function getDefaultAppImg() {
  if (platformIsAndroid()) {
    return IMAGES_FOLDER_PATH + "default_android_icon.png";
  }
  return IMAGES_FOLDER_PATH + "default_ios_icon.png";
}
