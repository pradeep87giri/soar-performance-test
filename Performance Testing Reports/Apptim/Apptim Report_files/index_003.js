window.tippyInstances = [];
const NOT_APPLICABLE = "N/A";
var isAnyModerateOrWarningSummaryItemToShow = false;
var videoPlayer = null;
var videoPlayerInterval = null;

window.addEventListener('keydown', (e) => {
  if (e.keyCode === 32 && e.target === document.body) {
    e.preventDefault();
  }
});

$(window).on("load", async function () {
  await waitForFilesReady();
  // General in tabs
  setupContextualHelp();
  setupSidebarAppInfo();
  // Summary tab
  await showSummaryTab();
  // Environment tab
  showEnvironmentTab();
  // Errors tab
  showErrorsTab();
  // Show video (Summary tab)
  setupVideo();

  if (isDesktop()) {
    // Correctness tab
    showCorrectnessTab();
    // Bugs tab
    showBugsTab();
  }

  // Logs tab
  showLogsTab();
  // Show all page content
  showPageContent();
});


function setupSidebarAppInfo() {
  try {
    let appName = getAppName();
    const appVersionName = getAppVersionName();
    const appPackageName = getAppPackageName();
    appName = appName ? `${appName} v${appVersionName}` : appPackageName;
    const appImg = getAppImg();
    const defaultAppImage = getDefaultAppImg();
    $("#sidebar-app-info").text(appName);
    showLoadingOverlay();
    $.get(appImg)
        .done(function() {
            $("#test-session-app-logo").attr("src", appImg);
            hideLoadingOverlay();
        }).fail(function() {
            $("#test-session-app-logo").attr("src", defaultAppImage);
            hideLoadingOverlay();
        })
  } catch (error) {
    catchException("rendering app name", error);
  }
}

async function showSummaryTab() {
  try {
    showLoadingOverlay();
    // Cards & Large section
    setupSummaryIndicators();
    setupSummaryInfo();
    // SQL & Address list
    await setupMoreInformationSection();
    hideLoadingOverlay();
  } catch (error) {
    catchException("rendering summary tab", error);
  }
}

function showEnvironmentTab() {
  try {
    setupDeviceInfo();
    setupAppInfo();
    setupScreenInfo();
    if (!isDesktop()) {
      if(state.crashInfo) {
        setupErrors();
      }
      setupEnvironmentInfo();
    }
    setupAppCompatibility();
    if (platformIsAndroid()) {
      setupAppPermissions();
      $("#extra-information-container").parent().remove();
    }
    else {
      setupExtraInformation();
    }
  } catch (error) {
    catchException("rendering environment tab", error);
  }
}

function showCorrectnessTab() {
  try {
    // Setup correctness tab
    if (platformIsAndroid()) {
      $(`<li id='nav_correctness' class="nav-item">
          <a class="link-icon" href="#correctness">
            <img class="icon-menu" src="./images/menu/correctness-icon.png">
            <span class="nav-text">CORRECTNESS</span>
            <div id="nav-correctness-badge-container"></div>
          </a>
        </li>`).insertAfter("#nav_environment");
    }
    // Setup correctness badge
    setNavItemBadgeStatus("correctness");
  } catch (error) {
    catchException("rendering correctness tab", error);
  }
}

function showErrorsTab() {
  try {
    // Setup navigation bar item badges.
    setNavItemBadgeStatus("crash");
  } catch (error) {
    catchException("rendering errors tab", error);
  }
}

function showBugsTab() {
  try {
    loadBugDates(state.output.bugs);
  } catch (error) {
    catchException("rendering bugs tab", error);
  }
}

function showLogsTab() {
  try {
    setupLogsInfo();
  } catch (error) {
    catchException("rendering logs tab", error);
  }
}

// Append a single pass item to the "Pass/Skipped" collapser.
function appendPassFailSummaryItem(testResultKey, item) {
  $(`#${testResultKey}-summary-items-content`)
    .append(`<div class="list_item_gunmetal list_item_grey_bg">
  <span class="bs-callout-1-no-hover pl-3">
  ${item.metadata.title}: ${item.value} ${item.metadata.displayUnit}
  </span></div>`);
}

// Append a single summary item (moderate/warning) to the large summary section.
function appendSummaryItem(status, item) {
  $("#summary-items").append(`
  <div class="list_item_gunmetal list_item_grey_bg">
  <span class="label-icon icon-${status} vertical-align-top">
    <i class="fa ${status == "moderate" ? "fa-exclamation-triangle" : "fa-exclamation-circle"
    } fa-fw"></i>
  </span>
  <strong>${item.metadata.title}</strong>&nbsp;
  <span class="label badge-${status}">${item.value}&nbsp;${item.metadata.displayUnit
    }</span>&nbsp;
  <em class="small">(<strong>${capitalizeFirstLetter(
      status
    )} limit exceeded: </strong> ${item.indicatorThresholdsOperator} ${item.indicatorThresholdsValue} ${item.metadata.displayUnit
    })</em></div>`);
}

// Returns whether the pass fail key is moderate or warning
function passFailIsModerateOrWarning(testResultKey) {
  return testResultKey == "moderate" || testResultKey == "warning";
}

// Check if there is at least one item before appending pass/skipped collapses
function setupSummaryCollapses() {
  if (state.testResult["pass"].length > 1 || state.testResult["pass"].filter(i=>i.hasOwnProperty("events"))[0]["events"].length > 0) {
    $(`#pass-summary-items`).show();
  }
  if (state.testResult["skipped"].length > 0) {
    $(`#skipped-summary-items`).show();
  }
}

// Append a single summary card to the cards section.
function appendSummaryCard(status, item, shouldPrepend = false) {
  // shouldPrepend on true inserts the specified content as the first child
  const cardElement = `
  <div class="bs-callout-wrapper px-xs-0 col-lg-2 col-md-4 col-sm-6" style='order: ${item.metadata.cardPosition}'>
  <div class='summary_small_container bs-callout card-${status}'>
    <div class="summary_value">
        <span class="d-inline-block mr-2">${item.value}</span>
        ${item.metadata.displayUnit ? `<span class="value_unit">${item.metadata.displayUnit}</span>` : ""}
    </div>
    <span class="summary_small_title">${item.metadata.title}</span>
  </div></div>`;
  if(shouldPrepend) {
    $("#summary-card-items").prepend(cardElement);
  }
  else {
    $("#summary-card-items").append(cardElement);
  }
}

// Get the amount and type of errors found.
function getErrors(errorType) {
  const result = {
    status: "",
    amount: 0,
  };
  /**
   * For Desktop we still checking output json report defects object.
   * The new agent just needs to check the crashinfo.tsv length.
   */
  if (isDesktop()) {
    const error = state.output["report_defects"]["counters"][errorType];
    const moderateError = error["2"];
    const warningError = error["3"];
    const getErrorStatus = () => {
      if (warningError > 0) return "warning";
      if (moderateError > 0) return "moderate";
      return "pass";
    };

    result.status = getErrorStatus();
    result.amount = moderateError + warningError;
  } else {
    if(state.crashInfo) {
      result.status = "warning";
      result.amount = state.crashInfo.quantity;
    }
  }

  return result;
}

// Append badge with color & amount to an specific navigation item.
function setNavItemBadgeStatus(label) {
  const navItem = getErrors(label);
  if (navItem.amount > 0) {
    $(`#nav-${label}-badge-container`).append(
      `<b class="badge bg-${navItem.status} pull-right">${navItem.amount}</b>`
    );
  }
}

function renderIndicatorElement(testResultKey, indicatorResultDict) {
  if(testResultKey == "pass" || testResultKey == "skipped") {
    appendPassFailSummaryItem(testResultKey, indicatorResultDict);
  } else if(passFailIsModerateOrWarning(testResultKey)) {
    isAnyModerateOrWarningSummaryItemToShow = true;
    appendSummaryItem(testResultKey, indicatorResultDict);
  }
}

// Evaluate passed/moderate/warning & append summary items.
function appendSummaryIndicatorItems() {
  let testResultFilter = [];
  // Iterate over test result keys
  for(let testResultKey in state.testResult) {
    // Get all indicators for a specific test result key.
    const testResultKeyList = state.testResult[testResultKey];
    for(let indicatorElement of testResultKeyList) {
      const indicatorKey = Object.keys(indicatorElement)[0];
      const indicatorResult = indicatorElement[indicatorKey];

      if (indicatorKey == "events") {
        indicatorResult.map(eventResult => {
          const eventKey = Object.keys(eventResult)[0];
          const eventResultDict = {
            metadata: {
              title: `Event: ${eventKey}`,
              displayUnit: "ms",
              isCard: false,
            },
            value: eventResult[eventKey].obtained,
            indicatorThresholdsOperator: passFailIsModerateOrWarning(testResultKey) ? eventResult[eventKey]["thresholds"][testResultKey]["operator"] : null,
            indicatorThresholdsValue: passFailIsModerateOrWarning(testResultKey) ? eventResult[eventKey]["thresholds"][testResultKey]["value"] : null
          };
          renderIndicatorElement(testResultKey, eventResultDict);
        });
        continue;
      }

      const indicatorMetadata = getIndicatorMetadata(indicatorKey);
      if (indicatorMetadata == undefined) {
        console.log(`Can't find metadata for ${indicatorKey}`);
        continue;
      }
      if (!(indicatorMetadata.platform == "all" || indicatorMetadata.platform == getDeviceOs())) {
        continue;
      }

      const indicatorObtained = indicatorResult["obtained"] != null ? indicatorResult["obtained"] : NOT_APPLICABLE;
      const indicatorObtainedDivided = indicatorObtained / indicatorMetadata.divideFactor;
      const indicatorObtainedFixed = indicatorMetadata.decimalPoint ? parseFloat(indicatorObtainedDivided).toFixed(1) : Math.ceil(indicatorObtainedDivided);

      const indicatorThresholds = indicatorResult["thresholds"];
      const indicatorThresholdsOperator = passFailIsModerateOrWarning(testResultKey) ? indicatorThresholds[testResultKey]["operator"] : null;
      const indicatorThresholdsValue = passFailIsModerateOrWarning(testResultKey) ? indicatorThresholds[testResultKey]["value"] : null;


      const indicatorResultDict = {
        key: indicatorKey,
        value: indicatorObtainedFixed,
        metadata: indicatorMetadata,
        indicatorThresholdsOperator: indicatorThresholdsOperator,
        indicatorThresholdsValue: indicatorThresholdsValue,
      };

      // Append indicator as summary card if (isCard == true) and pass fail key is Pass, Moderate or Warning.
      if(testResultKey == "pass" || passFailIsModerateOrWarning(testResultKey) || testResultKey == "skipped") {
        testResultFilter.push(indicatorResultDict)
        if(indicatorResultDict.metadata.isCard && indicatorResultDict.metadata.cardPosition) {
          appendSummaryCard(testResultKey, indicatorResultDict);
        }
      }
      renderIndicatorElement(testResultKey, indicatorResultDict);
    }

    // Only take those indicators that will be used in the single chart mode filter.
    const filteredTestResult = testResultFilter.filter(metric => metric.key && metric.key != "app_size" && metric.key != "crash_count" && !metric.key.includes("startup"))
    commitToState("testResultFilter", filteredTestResult);
  }

  // Setup summary card: error/exceptions.
  if(isDesktop()) {
    setupErrorCard();
  }
}

function setupErrorCard() {
  const errors = getErrors("crash");
  appendSummaryCard(
    errors.status,
    (indicatorResultDict = {
      metadata: {
        title: "Errors/Exceptions",
        displayUnit: "",
        isCard: true,
      },
      value: errors.amount == 0 ? "None" : errors.amount,
    }),
    shouldPrepend = true
  );
};

/*
  First call to setup summary items (cards, badges & large panels)
  based on metadata.json & test_result.json.
*/
function setupSummaryIndicators() {
  if(state.metadata && state.testResult) {
    // Create pass/skipped collapses.
    setupSummaryCollapses();
    appendSummaryIndicatorItems();
  } else {
    catchException("metadata and test result not found in state.");
  }
}

function setupContextualHelp() {
  initContextualInfoPopups(state.contextualInfoPopup, getDeviceOs());
}

async function setupMoreInformationSection() {
  let showSQLData = false;
  const showNetworkAddressList = await loadNetworkAddressList();
  if (showNetworkAddressList) $("#address-list-category").show();

  if (platformIsAndroid()) {
    showSQLData = await loadSQLData();
    if (showSQLData) $("#sql-category").show();
  }

  if (showNetworkAddressList || showSQLData) {
    $("#more-information-section").show();
  } else {
    $("#video-section").removeClass("col-lg-4").addClass("col-lg-12");
  }
}

function labelIPList(entry) {
  return (
    "<tr><td>" +
    entry["address"] +
    "</td><td style='text-align:center!important;'>" +
    entry["connections"] +
    '</td><td><a href="https://ipinfo.io/' +
    entry["address"].split(":")[0] +
    '" target="_blank" class="link-icon link-libraries"><img src="images/link-icon-hover.png"></a></td></tr>'
  );
}

function appendAddressListTable() {
  if (arguments[0] && arguments[0].data) var argumentResult = arguments[0].data;

  const addressListTableContainer = $("#address-list-table-container");

  let divTable = "";
  divTable += '<div class="col-lg-12">';
  divTable += '<table class="table table-striped table-bordered table-hover">';
  divTable +=
    '<thead><tr><th><h3 class="tables-title tables-title-label">Address</h3></th><th><h3 class="tables-title tables-title-label">Connections</h3></th><th style="text-align:right!important"><h3 class="tables-title tables-title-label">Whois</h3></th></tr></thead>';
  divTable += "<tbody>";

  if (argumentResult) {
    argumentResult.forEach(function (entry) {
      divTable += labelIPList(entry);
    });
  }

  divTable += "</tbody></table></div>";
  addressListTableContainer.html(divTable);
}

function labelTestList(entry, index) {
  if (entry["error_msg"] || entry["error_trace"]) {
    line =
      '<tr data-toggle="collapse" data-target="#innerCollapsableTest' +
      index +
      '" class="clickable collapse-row collapsed"><td>' +
      (entry["status"] == "PASSED"
        ? '<img id="ride_apk" class="ride-pass-icon" src="images/ride-pass-icon.png">'
        : entry["status"] == "FAILED"
          ? '<img id="ride_apk" class="ride-pass-icon" src="images/ride-nopass-icon.png">'
          : '<img id="ride_apk" class="ride-pass-icon" src="images/ride-nopass-icon-grey.png">') +
      "</td><td class='error-collapsable collapsed'>" +
      entry["name"] +
      "</td><td>" +
      msToTimeStr(entry["duration"]) +
      '</td></tr><tr class="error-description"><td colspan="3"><div style="padding: 0 25px;" id="innerCollapsableTest' +
      index +
      '" class="collapse"><b>' +
      messageToHTML(entry["error_msg"]) +
      "</b><br/>" +
      messageToHTML(entry["error_trace"]) +
      '</div></td></tr><tr style="display:none"></tr>';
  } else {
    let statusClass = "";
    if (entry["status"] == "PASSED")
      statusClass = "fa-check-circle label-icon icon-pass";
    else if (entry["status"] == "FAILED")
      statusClass = "fa-times-circle label-icon icon-warning";
    else if (entry["status"] == "SKIPPED")
      statusClass = "fa-times-circle label-icon label-icon-limited";
    line =
      '<tr><td><i class="fa test-result ' +
      statusClass +
      '"></i></td><td>' +
      entry["name"] +
      "</td><td>" +
      msToTimeStr(entry["duration"]) +
      "</td></tr>";
  }
  return line;
}

async function loadNetworkAddressList() {
  let showSection = false;
  const path = getLogFilePath("netiplist.tsv");
  const netIPListTsv = await getTsvAsJson(path);

  if (arrayExistsAndHasLength(netIPListTsv)) {
    Papa.parse(path,
      buildConfig(appendAddressListTable)
    );
    showSection = true;
  }
  return showSection;
}

async function loadSQLData() {
  let showSection = false;
  const SQLiteDatabaseTsvPath = getLogFilePath("sqlite_database.tsv");
  const SQLiteDatabaseTsv = await getTsvAsJson(SQLiteDatabaseTsvPath);

  if (arrayExistsAndHasLength(SQLiteDatabaseTsv)) {
    const table = $('<table class="table table-striped table-bordered table-hover"></table>').append('<thead><tr><th>Query</th><th style="text-align: center!important;">Time Taken (ms)</th></tr></thead>');
    const tbody = $('<tbody></tbody>');

    // Filter and sort data
    const filteredData = SQLiteDatabaseTsv.filter(data => parseInt(data.time_taken, 10) > 0).sort((a, b) => parseInt(b.time_taken, 10) - parseInt(a.time_taken, 10));

    filteredData.forEach(data => {
      const row = $('<tr></tr>');
      row.append($('<td style="width: 90%"></td>').text(data.query));
      row.append($('<td style="text-align: center!important;"></td>').text(data.time_taken + " ms"));
      tbody.append(row);
    });

    if (tbody.children().length > 0) {
      table.append(tbody);
      $('#sqlite-table-container').append(table);
      showSection = true;
    }
  }

  return showSection;
}

function initContextualInfoPopups(contextPopupInfo, os) {
  let infoIcons = $(".info-icon");
  $(infoIcons).each(function (index) {
    let infoId = $(this).attr("data-info-id");
    let contextInfo = contextPopupInfo.find(
      (i) => i.id == infoId && (i.os == os || i.os == "all")
    );
    if (contextInfo && contextInfo.title.trim() && contextInfo.content.trim()) {
      $(this).click((e) => {
        e.stopPropagation();
        showContextInfoModal(contextInfo);
      });
    }
//    else {
//      $(this).hide();
//    }
  });
}

function showContextInfoModal(contextInfo) {
  $("#modalContextInfo .modal-title").html(contextInfo.title);
  $("#modalContextInfo .modal-body").html(contextInfo.content);
  $("#modalContextInfo").modal("show");
}

function setupAppPermissions() {
  let shouldAddColorRowClass = false;
  const usesPermissions = state.appInfo.uses_permission;
  const optionalPermissions = state.appInfo.optional_permission;
  if (arrayExistsAndHasLength(usesPermissions)) {
    $("#permissions-container").append(`
    <div class="panel panel-default">
    <div class="panel-heading column-tab">
        <h3 class="title-tab">Permissions</h3>
    </div>
    <div class="panel-body column-tab libraries">
         <div class="col-md-12 p-0 mb-3" id="permissions-items">

         </div>
    </div>
    </div>
    `);
    for (let up of usesPermissions) {
      $("#permissions-items").append(`<p class="${shouldAddColorRowClass ? "" : "color-row"
        }" id="optional-permissions-container">${up}<br/>
     <span style="float: none !important;">
         ${state.appInfo.uses_permission_description[up].description}
     </span>
     </p>`);
      if (shouldAddColorRowClass) shouldAddColorRowClass = false;
      else shouldAddColorRowClass = true;
      if (arrayExistsAndHasLength(optionalPermissions)) {
        for (let op in optionalPermissions) {
          if (op == up) {
            $("#optional-permissions-container").append(
              `<strong>(Optional)</strong>`
            );
          }
        }
      }
    }
  }
}

function appendAppCompatibilityItem(listOfData, itemKey) {
  if (arrayExistsAndHasLength(listOfData)) {
    for (const item of listOfData) {
      $(`#${itemKey}-container`).append(`<span>${item}&nbsp;</span>`);
    }
  }
}

function setupAppCompatibility() {
  if (platformIsAndroid()) {
    const compiledNative = state.appInfo.native_code;
    const supportedScreens = state.appInfo.supports_screens;
    const densities = state.appInfo.densities;
    const locales = state.appInfo.locales;
    let nativeCPUArch = "";

    if (arrayExists(compiledNative)) {
      const appIsNative = compiledNative.length != 0;
      if (appIsNative) {
        for (let cn in compiledNative) {
          switch (cn) {
            case "armeabi-v7a":
              nativeCPUArch = `${cn}:ARMv7&nbsp;`;
              break;

            case "armeabi":
              nativeCPUArch = `${cn}:ARMv5&nbsp;`;
              break;

            case "x86":
              nativeCPUArch = `${cn}:Intel x86&nbsp;`;
              break;

            case "mips":
              nativeCPUArch = `${cn}:MIPS&nbsp;`;
              break;

            default:
              nativeCPUArch = "No&nbsp;";
              break;
          }
        }
      } else {
        nativeCPUArch = "No&nbsp;";
      }
    }

    $("#app-compatibility-container").append(`
    <p class="no-border">Min API Level: <span>${state.appInfo.sdkVersion ? state.appInfo.sdkVersion : "None"}</span></p>
    <p>Target API Level: <span>${state.appInfo.targetSdkVersion ? state.appInfo.targetSdkVersion : "None"}</span></p>
    <p>Native CPU architectures: <span>${nativeCPUArch ? nativeCPUArch : "None"}</span>
    <p>Screens: <span id="supported-screens-container"></span></p>
    <p>Support Any Density: <span>${state.appInfo.supports_any_density ? state.appInfo.supports_any_density : "None"}</span></p>
    <p>Densities: <span id="densities-container"></span></p>
    <p>Locale: <span id="locales-container"></span></p>`);

    appendAppCompatibilityItem(supportedScreens, "supported-screens");
    appendAppCompatibilityItem(densities, "densities");
    appendAppCompatibilityItem(locales, "locales");
  } else {
    const supportIphone = state.appInfo.support_iphone;
    const supportIpod = state.appInfo.support_ipod;
    const interfaceOrientations = state.appInfo.interface_orientations;
    const interfaceOrientationsIpad = state.appInfo.interface_orientations_ipad;

    $("#app-compatibility-container").append(`
    <p class="no-border">Min iOS Version: <span>${state.appInfo.minimum_os
      }</span></p>
    <p>Device Family: <span> ${supportIphone ? "iPhone&nbsp;&nbsp;&nbsp;iPod touch&nbsp;&nbsp;" : ""
      } ${supportIpod ? "iPad" : ""} </span></p>`);

    let orientations = [];
    let supportedOrientations = "";
    if (supportIphone) {
      orientations = interfaceOrientations;
    }
    if (supportIpod) {
      orientations = interfaceOrientationsIpad;
    }

    if (arrayExistsAndHasLength(orientations)) {
      for (let orientation of orientations) {
        switch (orientation) {
          case "UIInterfaceOrientationPortrait":
            supportedOrientations = "Portrait&nbsp;&nbsp;";
            break;

          case "UIInterfaceOrientationPortraitUpsideDown":
            supportedOrientations = "Upside Down&nbsp;&nbsp;";
            break;

          case "UIInterfaceOrientationLandscapeLeft":
            supportedOrientations = "Landscape Left&nbsp;&nbsp;";
            break;

          case "UIInterfaceOrientationLandscapeRight":
            supportedOrientations = "Landscape Right&nbsp;&nbsp;";
            break;

          default:
            break;
        }
      }
    }

    $("#app-compatibility-container").append(
      `<p>Supported Orientations ${supportIpod ? "iPad" : ""
      }: <span>${supportedOrientations}</span></p>`
    );
  }
}

const setupExtraInformation = () => {
  if(!platformIsAndroid()) {
    $("#extra-information-container").append(`
      <p class="no-border">Battery Capacity: <span>${state.deviceInfo.battery_capacity}</span></p>
      <p>Camera Photo: <span>${state.deviceInfo.camera.photo}</span></p>
      <p>Camera Video: <span>${state.deviceInfo.camera.video}</span></p>
      <p>Network: <span>${state.deviceInfo.network.technology}</span></p>
     `);
  }
}


function setupAppInfo() {
  const appName = getAppName();
  const appVersionName = getAppVersionName();
  if (platformIsAndroid()) {
    $("#app-information-container").append(`
    <div class="col-md-6 column-tab libraries">
        <h3 class="title-tab no-border"><span>App Information</span></h3>
        <p class="color-row">Name: <span>${appName ? appName : "None"}</span></p>
        <p>Version: <span>${appVersionName ? appVersionName : "None"}</span></p>
        <p class="color-row">Package Name: <span>${state.appInfo.package_name ? state.appInfo.package_name : "None"}</span></p>
        <p>Launch Activity: <span>${state.appInfo.launch_activity ? state.appInfo.launch_activity : "None"}</span></p>
        <p class="color-row">Use large heap: <span>${state.appInfo.large_heap ? "Yes" : "No"}</span></p>
        <p>Debuggable: <span>${state.appInfo.application_debuggable ? "Yes" : "No"}</span></p>
    </div>
  </div>`);
  } else {
    $("#app-information-container").append(`
    <div class="col-lg-6 col-md-6 column-tab libraries">
        <h3 class="title-tab no-border" style="height: 22px;"><span>App Information</span></h3>
        <p class="color-row">Name: <span>${appName ? appName : "None"}</span></p>
        <p>Version: <span>${appVersionName ? appVersionName : "None"}</span></p>
        <p class="color-row">Package Name: <span>${state.appInfo.bundle_identifier ? state.appInfo.bundle_identifier : "None"}</span></p>
    </div>
  </div>`);
  }
}

function setupScreenInfo() {
  if (platformIsAndroid()) {
    $("#screen-information-container").append(`
    <p class="no-border">Screen orientation: <span id='device-screen-orientation'></span></p>
    <p>Screen resolution:<span id='device-screen-resolution'></span></p>
    <p>Layout size:<span id='device-layout-size'></span></p>
    <p>Display density:<span id='device-pixel-density'></span></p>
    <p>LOpenGL ES:<span id='device-opengl-version'></span></p>`);

    const screenResolution =
      state.deviceInfo["configuration"]["displayWidth"] +
      "x" +
      state.deviceInfo["configuration"]["displayHeight"];

    const lcdDensityNames = {
      120: "ldpi",
      160: "mdpi",
      213: "tvdpi",
      240: "hdpi",
      280: "280dpi",
      320: "xhdpi",
      360: "360dpi",
      400: "400dpi",
      420: "420dpi",
      480: "xxhdpi",
      560: "560dpi",
      640: "xxxhdpi",
      65535: "any",
    };
    const lcdDensity = state.deviceInfo["graphics"]["lcd_density"];
    const lcdDensityDevName =
      lcdDensity in lcdDensityNames
        ? lcdDensityNames[lcdDensity]
        : lcdDensity + "?";
    const lcdDensityName = lcdDensity + "dpi" + " (" + lcdDensityDevName + ")";

    const layoutSizeNames = {
      smll: "Small",
      nrml: "Normal",
      lrg: "Large",
      xlrg: "XLarge",
    };
    const layoutSize = state.deviceInfo["configuration"]["layoutSize"];
    const layoutSizeName = layoutSizeNames[layoutSize];
    $("#device-screen-resolution").text(screenResolution);
    if ("default_orientation" in state.deviceInfo["configuration"]) {
      $("#device-screen-orientation").text(
        state.deviceInfo["configuration"]["default_orientation"]
      );
    } else {
      $("#device-screen-orientation").text(
        state.deviceInfo["configuration"]["default_orientation"]
      );
    }

    $("#device-layout-size").text(layoutSizeName);
    $("#device-pixel-density").text(lcdDensityName);
    $("#device-opengl-version").text(
      state.deviceInfo["graphics"]["opengles_version"]
    );
  } else {
    $("#screen-information-container").append(`
    <p class="no-border">Screen resolution: <span id='device-screen-resolution'></span></p>
    <p>Size: <span id='device-display-size'></span></p>
    <p>Type: <span id='device-display-type'></span></p>`);
    if ("display" in state.deviceInfo) {
      const deviceDisplay = state.deviceInfo["display"];
      const screenResolution =
        deviceDisplay["widthResolution"] +
        "x" +
        deviceDisplay["heightResolution"];
      $("#device-screen-resolution").text(state.deviceInfo["display"]["resolution"] || screenResolution);
      $("#device-display-size").text(deviceDisplay["size"]);
      $("#device-display-type").text(deviceDisplay["type"]);
    }
  }
}

function setupEnvironmentInfo() {
  Object.keys(state.environment).forEach(function(environmentKey, index) {
    $("#environment-container").append(`
    <p class="${index ? "" : "no-border"
      }">${titleCase(environmentKey)}: <span>${state.environment[environmentKey]}</span></p>`);
  });
}

function setupErrors() {
  const crashInfoTsv = state.crashInfo.tsv;
  crashInfoTsv.map((item, index) => {
    /*
      Errors will be appended only when severity, time and file data are present.
      This is to prevent empty collapsable items!
    */
    const shouldAppend = item.severity != '' && item.time != '' && item.file_path != '' && item.file_name != '';
    if (shouldAppend) {
      $(`#errors-container`).append(`
      <div class="panel panel-issue panel-logs">
        <div data-toggle="collapse" data-target="#collapse-crash-${index}" data-parent-x="#accordion_crash_CRASH" class="panel-heading monkop-collapser collapsed">
            <h4 class="panel-title">
              <span class="label-icon ${item.severity == 'error' || item.severity == 'user' ? 'label-icon-3': 'label-icon-2'}">
              <i class="fa fa-exclamation-triangle fa-fw"></i>
              </span>
              <strong>${item.severity == 'error' ? 'Warning Exception' : item.severity == 'user' ? 'Warning Exception (User)' : item.severity == 'kernel' ? 'Exception (Kernel)': 'Exception'}</strong>&nbsp;
            </h4>
        </div>
        <div id="collapse-crash-${index}" class="panel-collapse collapse" style="width: 100%; height: auto;">
           <div class="panel-body" style="background-color: #fdfdfe;">
            ${platformIsAndroid() ? `
            <div style="display: table-cell;">
                  <p> Error time: ${msToTimeStr(item.time)} </p>
                  <ul class="list-group" style="margin-bottom:0px;">
                    <li class="list-group-item">
                      ${item.stack_trace}
                    </li>
                  </ul>
              </div>` : ''}
              <br>
              <div class="table-responsive">
                <table class="table-striped table-bordered table-hover">
                    <thead>
                      <tr>
                          <th style="min-width:105px;">
                            <h3 class="tables-title tables-title-label">File</h3>
                          </th>
                          <th style="min-width:80px;">
                            <h3 class="tables-title tables-title-label">Time</h3>
                          </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                          <td style="word-break:normal !important;"><a href="${item.file_path}" download="${item.file_name}">${item.file_name}</a></td>
                          <td style="word-break:normal !important;">${msToTimeStr(item.time)}</td>
                      </tr>
                    </tbody>
                </table>
              </div>
          </div>
        </div>
      </div>`);
    }
  });
}

function setupSummaryInfo() {
  const mission = state.testInfo;
  const name = mission["name"];
  const duration = sToTimeStr(mission.time_elapsed);
  const started = formatDate(mission.real_start, true);
  const ended = formatDate(mission.end, true);
  const deviceName = getDeviceName();
  const iconToUse = getDeviceOsIcon();
  const osVersion = getDeviceOSVersion();
  $("#test-session-duration").html(duration);
  $("#test-session-started-date").html(started);
  $("#test-session-ended-date").html(ended);

  $("#test-session-name").html(name);
  $("#device-os-icon").append(
    `<span class="session-info-value"> ${deviceName} <i class="${iconToUse}"></i> ${osVersion} </span>`
  );
}

function setupDeviceInfo() {
  const deviceName = getDeviceName();
  const deviceOSVersion = getDeviceOSVersion();
  if (platformIsAndroid()) {
    $("#app-information-container").append(`
    <div class="col-md-4 column-tab libraries">
        <h3 class="title-tab no-border"><span>${deviceName}</span></h3>
        <p class="color-row">Android version:<span>${deviceOSVersion}</span></p>
        <p>Manufacturer:<span id='device-manufacturer'></span></p>
        <p class="color-row">Model:<span id='device-model'></span></p>
        <p>CPU:<span id='device-cpu'></span></p>
        <p class="color-row">CPU Arch: <span id='device-cpu-arch'></span></p>
        <p>CPU Cores: <span id='device-cores'></span></p>
        <p class="color-row">RAM: <span id='device-ram'></span></p>
    </div>`);
  } else {
    $("#app-information-container").append(`
    <div class="col-lg-4 col-md-4 column-tab libraries">
        <h3 class="title-tab no-border" style="height: 22px;"><span>${deviceName}</span></h3>
        <p class="color-row">iOS version:<span>${deviceOSVersion}</span></p>
        <p>CPU:<span id='device-cpu'></span></p>
        <p class="color-row">CPU Arch: <span id='device-cpu-arch'></span></p>
        <p>CPU Cores: <span id='device-cores'></span></p>
        <p class="color-row">RAM: <span id='device-ram'></span></p>
    </div>`);
  }
  const deviceImageUrl = getDeviceImg();
  const defaultDeviceImageUrl = getDefaultDeviceImg();
  showLoadingOverlay();
  $.get(deviceImageUrl)
    .done(function() {
        $("#device-image").attr("src", deviceImageUrl);
        hideLoadingOverlay();
    }).fail(function() {
        $("#device-image").attr("src", defaultDeviceImageUrl);
        hideLoadingOverlay();
  })

  if (platformIsAndroid()) {
    $("#device-manufacturer").text(capitalizeFirstLetter(state.deviceInfo["product"]["manufacturer"]));
    $("#device-model").text(state.deviceInfo["product"]["model"]);
    $("#device-cpu").text(state.deviceInfo["product"]["cpu_abi"] || state.deviceInfo["cpu"]["chipset"]);
    $("#device-cpu-arch").text(state.deviceInfo["cpu"]["architecture"]);
    $("#device-cores").text(state.deviceInfo["cores"] || state.deviceInfo["cpu"]["cores"]);

    const ram = state.deviceInfo["ram_size"] || state.deviceInfo["memory"]["ram"]
    $("#device-ram").text(ram + "GB");
  } else {
    // CPU & Cores.
    $("#device-cpu").text(
      `${state.deviceInfo["chipset"] || state.deviceInfo["cpu"]["chipset"]}`
    );
    $("#device-cpu-arch").text(state.deviceInfo["cpu"]["architecture"]);
    $("#device-cores").text(state.deviceInfo["cores"] || state.deviceInfo["cpu"]["cores"]);
    // Amount of Memory.
    $("#device-ram").text(state.deviceInfo["memory"]["ram"]);
  }
}
function setupLogsInfo() {
  const logCategories = state.logs["categories"].sort();
  const logFiles = state.logs["files"];
  let logDownloadHtml =
    '<div class="table-responsive"><table class="table table-striped table-bordered table-hover">';
  logDownloadHtml +=
    '<thead><tr><th><h3 class="tables-title tables-title-label">Category</h3></th><th><h3 class=" tables-title tables-title-label">Title</h3></th><th><h3 class=" tables-title tables-title-label">File</h3></th><th style="width: 40px;"></th></tr></thead>';
  logDownloadHtml += "<tbody>";

  logCategories.forEach(function (logCategory) {
    for (var logFile in logFiles) {
      if (logFiles[logFile]["category"] == logCategory) {
        logDownloadHtml +=
          "<tr><td>" +
          logCategory.split(":")[1] +
          "</td><td>" +
          logFiles[logFile]["title"] +
          "</td><td>" +
          logFile +
          "</td>";
        if (
          logFiles[logFile]["exist"] &&
          logFiles[logFile]["len"] > 0
        ) {
          logDownloadHtml +=
          // If file is tsv or log: look at the /logs folder, else look at the root.
          `<td><a href="${logFile.includes("tsv") || logFile.includes("log") || logFile.includes("zip")? getLogFilePath(logFile) : getFilePath(logFile)}" 
          download="${getSimpleFormattedDate()}_${logFile}">
          <i style="font-size: 20px;" class="fas fa-download"></i></a></td>`;
        } else {
          logDownloadHtml += "<td>NA</td>";
        }
        logDownloadHtml += "</tr>";
      }
    }
  });

  logDownloadHtml += "</tbody></table></div>";

  $("#logs_download").html(logDownloadHtml);
}

function getVideoFormattedClock(seconds) {
  return Math.floor(moment.duration(seconds,'seconds').asHours()) + ':' + moment.duration(seconds,'seconds').minutes() + ':' + moment.duration(seconds,'seconds').seconds() + ':' + parseInt(moment.duration(seconds, 'seconds').milliseconds());
}

function setupVideo() {
  const videoFilePath = getVideoFilePath();
  fetch(videoFilePath, {
    method: "HEAD"
  })
  .then((res) => {
    if (res.ok) {
      const videoContainer = $("#video-container");
      videoContainer.empty();

      $("<video/>", {
        id: "video-player",
        style: "",
        class: "video-js vjs-default-skin",
        controls: ""
      })
        .append(
          $("<source>", {
            src: videoFilePath,
            type: "video/mp4"
          })
        )
        .appendTo(videoContainer);

        if(!isAnyModerateOrWarningSummaryItemToShow) {
          $("#collapse_summary_skipped").removeClass("collapse").addClass("collapse in")
        }

        videoPlayer = videojs("video-player", {
          playbackRates: [0.5, 1, 1.5, 2]
        });

        videoPlayerInterval = setInterval(() => {
          /*
            Returns the current time
            currentTime() => 1.340 (1 second - 340 ms)
    
            Returns the total duration
            duration() => 24.345 (24 seconds - 345 ms)
          */
          const currentTime = parseFloat(videoPlayer.currentTime());
          const durationTime = parseFloat(videoPlayer.duration());

          // Format seconds.milliseconds to Hours:minutes:seconds:milliseconds
    
          const formattedCurrentTime = getVideoFormattedClock(currentTime);
          const formattedDurationTime = getVideoFormattedClock(durationTime);
    
    
          $(".vjs-current-time-display").html(formattedCurrentTime);
          $(".vjs-duration-display").html(formattedDurationTime);
    
          document.body.onkeyup = function (e) {
            if (e.key == " " || e.code == "Space" || e.keyCode == 32) {
              e.preventDefault();
              if (!videoPlayer.paused()) {
                videoPlayer.pause();
              } else {
                videoPlayer.play();
              }
            }
          };
        }, 0);

    } 
    else {
      console.debug("No video file found");
      $("#video-section").remove();
      // Summary section will use all the space available
      $("#summary-section").removeClass("col-lg-7 col-md-7").addClass("col-lg-12 col-md-12");
      // Remove fixed height
      $("div").removeClass("small-fixed-container");
      $("div").removeClass("summary-items-fixed-body");
      clearInterval(videoPlayerInterval);
    }
  })
  .catch(error => {
    console.error(error);
    clearInterval(videoPlayerInterval);
  });
}

function buildConfig(completeCall) {
  return {
    delimiter: "\t",
    header: true,
    dynamicTyping: false,
    preview: 0,
    step: undefined,
    encoding: "",
    worker: false,
    comments: "",
    complete: completeCall,
    download: true,
    keepEmptyRows: false,
    chunk: undefined,
  };
}

function loadBugDates(bugs) {
  if (!$.isEmptyObject(bugs)) {
    $.each(bugs, function (key, bug_data) {
      const relativeTime = sToTimeStr(bug_data["relative_bug_start_time"]);
      $(`#bug_description_${key} .found-at`).html(relativeTime);
    });
  }
}
