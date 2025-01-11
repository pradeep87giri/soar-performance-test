const MIN_DESKTOP_WIDTH_SIZE_IN_PX = 1024;
const MAX_SCREEN_WIDTH_SIZE_IN_PX = 1920;

function isDesktop(){
  return outputFileExists;
}

function capitalizeFirstLetter(text) {
  return text[0].toUpperCase() + text.substring(1);
}

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results == null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getSimpleFormattedDate() {
  // Format hh-mm_dd-mm-yyyy
  let d = new Date();
  return (
    [addLeadingZero(d.getHours()), addLeadingZero(d.getMinutes())].join("-") +
    "_" +
    [
      addLeadingZero(d.getMonth() + 1),
      addLeadingZero(d.getDate()),
      d.getFullYear(),
    ].join("-")
  );
}

function addLeadingZero(num) {
  var s = num + "";
  if (s.length < 2) s = "0" + s;
  return s;
}

function messageToHTML(message) {
  return message
    .split("\\n")
    .join("<br/>")
    .split("\\t")
    .join("&nbsp;&nbsp;&nbsp;&nbsp;");
}

function msToTimeStr(duration) {
  if (isNaN(duration) || typeof duration == "undefined") {
    return "";
  } else {
    var milliseconds = parseInt(duration % 1000),
      seconds = parseInt(Math.trunc(duration / 1000) % 60),
      minutes = parseInt(Math.trunc(duration / (1000 * 60)) % 60),
      hours = parseInt(Math.trunc(duration / (1000 * 60 * 60)) % 24);

    let str_minutes = minutes < 10 && hours > 0 ? "0" + minutes : minutes;
    let str_seconds = seconds < 10 && minutes > 0 ? "0" + seconds : seconds;

    str_hours = hours + "h";
    str_minutes = str_minutes + "m";
    str_seconds = str_seconds + "s";
    let str_milliseconds = milliseconds + "ms";

    if (hours == 0) {
      if (minutes == 0) {
        return str_seconds + " " + str_milliseconds;
      } else {
        return str_minutes + " " + str_seconds;
      }
    } else {
      return str_hours + " " + str_minutes;
    }
  }
}

function sToTimeStr(duration) {
  if (isNaN(duration) || typeof duration == "undefined") {
    return "";
  } else {
    let separator = ", ";
    let seconds = parseInt(duration % 60),
      minutes = parseInt((duration / 60) % 60),
      hours = parseInt((duration / (60 * 60)) % 24);

    let str_hours =
      hours > 0 ? (hours > 1 ? hours + " hours" : hours + " hour") : "";
    let str_minutes =
      minutes > 0
        ? minutes > 1
          ? minutes + " minutes"
          : minutes + " minute"
        : "";
    let str_seconds =
      seconds > 0
        ? seconds > 1
          ? seconds + " seconds"
          : seconds + " second"
        : "";

    let units;
    if (hours == 0) {
      if (minutes == 0) {
        units = [str_seconds];
      } else {
        units = [str_minutes, str_seconds];
      }
    } else {
      units = [str_hours, str_minutes, str_seconds];
    }
    return units.filter((u) => u != "").join(separator);
  }
}

function msToTime(duration) {
  if (isNaN(duration) || typeof duration == "undefined") {
    return "";
  } else {
    var milliseconds = parseInt(duration % 1000),
      seconds = parseInt((duration / 1000) % 60),
      minutes = parseInt((duration / (1000 * 60)) % 60),
      hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds; // + "." + milliseconds
  }
}

function msToStr(duration) {
  if (isNaN(duration) || typeof duration == "undefined" || duration == null) {
    return "";
  } else {
    return duration + " ms";
  }
}

function plural(number) {
  if (number > 1) {
    return "s";
  }
  return "";
}

function formatDate(
  dateString,
  local = true,
  format = "MMM DD, YYYY HH:mm:ss"
) {
  if (dateString) {
    try {
      let utc = moment.utc(dateString);
      return local ? utc.local().format(format) : utc.format(format);
    } catch (error) {
      catchException(`parsing date ${dateString}`, error);
      return "";
    }
  }
}

function csvToJson(csvString, delimiter = "\t", removeFirstChar = isDesktop()) {
  if (removeFirstChar) csvString = csvString.slice(1);
  return csv({ output: "json", delimiter }).fromString(csvString);
}

async function fetchFile(filePath, parseAsJson = true) {
  try {
    const res = await fetch(filePath);
    if(res.status == 200) {
      return parseAsJson ? res.json() : res.text();
    }
    return null;
  } catch (error) {
    catchException(`fetching ${filePath}`, error);
  }  
}

function loadTsv(filePath) {
  return fetchFile(filePath, (parseAsJson = false));
}

function sanitizeJsonLog(jsonLog) {
  return jsonLog.filter((row) => {
    if (typeof row["time"] == "undefined" || row["time"].trim() == "")
      return false;
    return true;
  });
}

function getTsvAsJson(url, shouldSanitize = false) {
  return new Promise(function (resolve, reject) {
    loadTsv(url).then((loadResponse) => {
      if(loadResponse) {
        if (shouldSanitize) csvToJson(loadResponse).then((jsonLog) => resolve(sanitizeJsonLog(jsonLog)));
        else resolve(csvToJson(loadResponse));
      } 
      else resolve(loadResponse);
    });
  });
}

function validateTsvFile(string) {
  let lines = string.split("\n");
  return lines.find((line) => !line.startsWith("#") && line.trim() !== "");
}

function scrollToElementById(id, headerOffset) {
  var element = document.getElementById(id);
  var elementPosition = element.getBoundingClientRect().top;
  var offsetPosition = elementPosition - headerOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });
}

function scrollToAnchor(aid) {
  var aTag = $("a[name='" + aid + "']");
  if (aTag && aTag.length > 0)
    $("html,body").animate({ scrollTop: aTag.offset().top }, "slow");
}

function catchException(action, error) {
  console.error(`Error ${action}`, error);
  hideLoadingOverlay();
}

function showLoadingOverlay() {
 $('#overlay').fadeIn();
}

function hideLoadingOverlay() {
  $('#overlay').fadeOut();
}

function showPageContent() {
    // It's time to show the hidden content
    $("#wrapper").show();
    $("#sidebar").show();
}

function getScreenSize() {
  const screenSizeDetector = new ScreenSizeDetector();
  return screenSizeDetector.width;
}

function screenIsBigEnough() {
  return getScreenSize() > MAX_SCREEN_WIDTH_SIZE_IN_PX;
}

function screenIsDesktopSizeOrLess() {
  return getScreenSize() <= MIN_DESKTOP_WIDTH_SIZE_IN_PX;
}

function arrayExistsAndHasLength(array) {
  return array && array.length > 0;
}

function arrayExists(array) {
  return array && array instanceof Array;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForCondition(condition, timeout = 15000, interval = 50) {
  return new Promise((resolve, reject) => {
    let totalTime = 0;
    const wait = () => {
      if (condition()) resolve();
      else {
        if (totalTime >= timeout) reject("Timeout");
        else {
          totalTime += interval;
          return sleep(interval).then(wait);
        }
      }
    };
    wait();
  });
}

function partial(func, ...argsBound) {
  return function (...args) {
    return func.call(this, ...argsBound, ...args);
  };
}

function getReportIdFromUrl() {
  const url = window.location.href;
  const array = url.split("/");
  return array[array.length - 4].substr(37, 36);
}

function getObjectKeyBasedOnValue(obj, val) {
  for (let keys in obj) {
    if (obj[keys].includes(val)) {
      return keys;
    }
  }
}

// Converts snake_case string to normal space separated string.
function titleCase(str) {
  return str
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');  
}

function camelToSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/* Fix Desktop Highcharts hover. We need to implement our custom replaceAll function
because the native one is not available using Electron v6 (Chromium version is too old).
*/
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceAll(str, match, replacement) {
  return str.replace(new RegExp(escapeRegExp(match), "g"), () => replacement);
}
