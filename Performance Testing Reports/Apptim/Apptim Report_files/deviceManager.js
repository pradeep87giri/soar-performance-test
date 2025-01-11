// Returns the device's platform (android or ios)
function getDeviceOs() {
  return state.testInfo["platform"];
}

// Returns the device's name
function getDeviceName() {
  return state.deviceInfo["name"] || state.deviceInfo["commercial_name"] || state.deviceInfo["comercial_name"];
}

// Returns the device's OS version
function getDeviceOSVersion() {
  return state.deviceInfo["os"]["version"];
}

// Returns the device's image
function getDeviceImg() {
  return getDeviceImageDirectory() + state.deviceInfo["id"] + ".png";
}

function getDefaultDeviceImg() {
  if (platformIsAndroid()) {
    return IMAGES_FOLDER_PATH + "default_android_device.jpg";
  }
  return IMAGES_FOLDER_PATH + "default_ios_device.png";
}

// Returns if the device is android
function platformIsAndroid() {
  return getDeviceOs() == "android";
}

// Returns the fontawesome icon to use depending on the device's OS
function getDeviceOsIcon() {
  return platformIsAndroid() ? "fab fa-android" : "fab fa-apple";
}
