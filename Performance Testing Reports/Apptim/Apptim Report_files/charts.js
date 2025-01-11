const RENDER_INFO_ALERT =
  "For more information about how to understand this data, definitions and your goals as an App Developer read more <a style='color: var(--lightish-blue);' target='_blank' href='https://docs.apptim.com/guides/understanding-render'>here</a>.";

$(window).on("load", async function () {
  await waitForFilesReady();
  var eventsInfo = [];
  var singleChartResourceController = null;
  var multipleChartsResourceControllers = [];
  var chartMetrics = [];
  var eventSearchTimeout = null;
  var eventSearchValue = "";
  const CHART_BOOST_THRESHOLD = 2000;
  //   const MULTICHARTS_VIEW_MODE_MAX_SCREEN_SIZE = 1920;
  const CHART_IS_TALL_DEFAULT = true;
  const CHART_SET_EXTREMES_DEFAULT = true; // Event that handles drag & drop / reset zoom events.
  const CHART_IS_LINE_DEFAULT = true;
  const CHART_LEGENDS_ENABLED_DEFAULT = false;
  const SEARCH_WAIT_TIMEOUT = 500;
  const BASE_FACTOR = 1000;
  const B_TO_MIB = 1024 * 1024;
  // Charts mode: Single/Multiple
  let singleChartModeIsOn = true;
  let metricHasSurpassedThreshold = false;
  let lastFilter = null;

  // to-do: remove all metadata from here and get it from test_result.json
  const marks = {
    unit: "",
    title: "Marks",
    logFile: "events.tsv",
    logFileKey: "event_name",
    parseValue: (value) => {
      return parseInt(value);
    }
  };

  const appCpu = {
    unit: "%",
    title: "App CPU",
    logFile: "cpuinfo.tsv",
    logFileKey: "app_cpu",
    parseValue: (value) => {
      return parseInt(value);
    }
  };

  const deviceCpu = {
    unit: "%",
    title: "Device CPU",
    logFile: "cpuinfo.tsv",
    logFileKey: "device_cpu",
    parseValue: (value) => {
      return parseInt(value);
    }
  };

  const threadsCount = {
    unit: "",
    title: "Threads",
    logFile: "cpuinfo.tsv",
    logFileKey: "threads",
    parseValue: (value) => {
      return parseInt(value);
    }
  };

  const netDownload = {
    unit: isDesktop() ? "KB" : "MB",
    title: "Network Download",
    logFile: "netinfo.tsv",
    logFileKey: "rec_b",
    parseValue: (value) => {
      return parseInt(value) / (isDesktop() ? BASE_FACTOR : B_TO_MIB);
    }
  };

  const netUpload = {
    unit: isDesktop() ? "KB" : "MB",
    title: "Network Upload",
    logFile: "netinfo.tsv",
    logFileKey: "tra_b",
    parseValue: (value) => {
      return parseInt(value) / (isDesktop() ? BASE_FACTOR : B_TO_MIB);
    }
  };

  const renderFps = {
    unit: "FPS",
    title: "FPS",
    logFile: "renderinfo.tsv",
    logFileKey: "fps",
    parseValue: (value) => {
      return parseInt(value);
    }
  };

  const renderJanks = {
    unit: "Janks",
    title: "Janks",
    logFile: "renderinfo.tsv",
    logFileKey: "janks",
    parseValue: (value) => {
      return parseInt(value);
    }
  };

  const renderLayoutMeasureTime = {
    unit: "ms",
    title: "Layout Measure Time",
    logFile: "renderinfo.tsv",
    logFileKey: "layout_measure_time",
    parseValue: (value) => {
      return parseInt(value);
    }
  };

  const renderDrawTime = {
    unit: "ms",
    title: "Draw Time",
    logFile: "renderinfo.tsv",
    logFileKey: "draw_time",
    parseValue: (value) => {
      return parseInt(value);
    }
  };

  const renderInputEvents = {
    unit: "ms",
    title: "Input Events",
    logFile: "renderinfo.tsv",
    logFileKey: "input_events",
    parseValue: (value) => {
      return parseInt(value);
    }
  };

  const renderAnimations = {
    unit: "ms",
    title: "Animations",
    logFile: "renderinfo.tsv",
    logFileKey: "animations",
    parseValue: (value) => {
      return parseInt(value);
    }
  };

  const energyScore = {
    unit: "pts",
    title: "Energy Score",
    logFile: "energy.tsv",
    logFileKey: "score",
    parseValue: (value) => {
      return parseInt(value);
    }
  };

  const cpuEnergy = {
    unit: "",
    title: "CPU Energy",
    logFile: "energy.tsv",
    logFileKey: "cpu_cost",
    parseValue: (value) => {
      return parseInt(value);
    }
  };

  const gpuEnergy = {
    unit: "",
    title: "GPU Energy",
    logFile: "energy.tsv",
    logFileKey: "gpu_cost",
    parseValue: (value) => {
      return parseInt(value);
    }
  };

  const networkEnergy = {
    unit: "",
    title: "Network Energy",
    logFile: "energy.tsv",
    logFileKey: "networking_cost",
    parseValue: (value) => {
      return parseInt(value);
    }
  };

  const locationEnergy = {
    unit: "",
    title: "Location Energy",
    logFile: "energy.tsv",
    logFileKey: "location_cost",
    parseValue: (value) => {
      return parseInt(value);
    }
  };

  const displayEnergy = {
    unit: "",
    title: "Display Energy",
    logFile: "energy.tsv",
    logFileKey: "display_cost",
    parseValue: (value) => {
      return parseInt(value);
    }
  };

  const overheadEnergy = {
    unit: "",
    title: "Overhead Energy",
    logFile: "energy.tsv",
    logFileKey: "overhead",
    parseValue: (value) => {
      return parseInt(value);
    }
  };

  const appMemory = {
    unit: platformIsAndroid() ? "MB" : "MiB",
    title: "App Memory",
    logFile: "meminfo.tsv",
    logFileKey: "",
    parseValue: (value) => {
      return platformIsAndroid() ? parseInt(value) / BASE_FACTOR : parseInt(value) / B_TO_MIB;
    }
  };

  // This is because the meminfo.tsv file has different column names for Android and iOS
  var appMemoryAndroid = { ...appMemory }; // shallow copy
  appMemoryAndroid.logFileKey = "memory_pss";

  var appMemoryiOS = { ...appMemory };
  appMemoryiOS.logFileKey = "memory_footprint";

   const deviceMemory = {
    unit: platformIsAndroid() ? "MB" : "MiB",
    title: "Device Memory",
    logFile: "meminfo.tsv",
    logFileKey: "device_memory",
    parseValue: (value) => {
      return platformIsAndroid() ? parseInt(value) / BASE_FACTOR : parseInt(value) / B_TO_MIB;
    }
  };

  const appMemoryResidentSize = {
    unit: "MiB",
    title: "App Memory Resident Size",
    logFile: "meminfo.tsv",
    logFileKey: "resident_size",
    parseValue: (value) => {
      return parseInt(value) / B_TO_MIB;
    }
  };

  const appMemoryDalvik = {
    unit: "MB",
    title: "App Memory Dalvik",
    logFile: "meminfo.tsv",
    logFileKey: "dalvik_pss",
    parseValue: (value) => {
      return parseInt(value) / BASE_FACTOR;
    }
  };

  const appMemoryNative = {
    unit: "MB",
    title: "App Memory Native",
    logFile: "meminfo.tsv",
    logFileKey: "native_pss",
    parseValue: (value) => {
      return parseInt(value) / BASE_FACTOR;
    }
  };

  const metrics = {
    android: {
      marks: marks,
      appCpu: appCpu,
      deviceCpu: deviceCpu,
      threadsCount: threadsCount,
      appMemory: appMemoryAndroid,
      deviceMemory: deviceMemory,
      appMemoryDalvik: appMemoryDalvik,
      appMemoryNative: appMemoryNative,
      netDownload: netDownload,
      netUpload: netUpload,
      renderFps: renderFps,
      renderJanks: renderJanks,
      renderLayoutMeasureTime: renderLayoutMeasureTime,
      renderDrawTime: renderDrawTime,
      renderInputEvents: renderInputEvents,
      energyScore: energyScore,
      renderAnimations: renderAnimations
    },
    ios: {
      marks: marks,
      appCpu: appCpu,
      deviceCpu: deviceCpu,
      threadsCount: threadsCount,
      appMemory: appMemoryiOS,
      deviceMemory: deviceMemory,
      appMemoryResidentSize: appMemoryResidentSize,
      netDownload: netDownload,
      netUpload: netUpload,
      renderFps: renderFps,
      energyScore: energyScore,
      cpuEnergy: cpuEnergy,
      gpuEnergy: gpuEnergy,
      networkEnergy: networkEnergy,
      locationEnergy: locationEnergy,
      displayEnergy: displayEnergy,
      overheadEnergy: overheadEnergy
    }
  };
  const categories = {
    marks: ["eventSingle", "eventTimeTaken"],
    cpu: ["appCpu", "deviceCpu", "threadsCount"],
    memory: ["appMemory", "deviceMemory", "appMemoryResidentSize", "appMemoryDalvik", "appMemoryNative"],
    render: ["renderFPS", "renderJanks", "renderLayoutMeasureTime", "renderDrawTime", "renderInputEvents", "renderAnimations"],
    network: ["netUpload", "netDownload"],
    energy: ["energyScore", "cpuEnergy", "gpuEnergy", "networkEnergy", "locationEnergy", "displayEnergy", "overheadEnergy"]
  };
  const colors = {
    ultraMarine: "#1400a1",
    brightPurple: "#A371ED",
    turquoiseBlue: "#00aed6",
    justBlue: "#49AFF8",
    slimeGreen: "#16A34A",
    redTomato: "#ea4335",
    dark: "#28263a",
    yellowOrange: "#ea9009",
    brownie: "#d89e6b",
    apptimPurple: "#535ff9"
  };

  // Returns the message to show inside the alert-apptim element.
  const getChartFilterAlert = () => {
    return `<span id="span-time-filtered"> Click and drag to ${singleChartModeIsOn ? "filter" : "zoom"}${eventsInfo.length > 0 && singleChartModeIsOn ? " | Click a mark to filter by <b>Start - End</b> events" : ""}.</span>`;
  };

  // Removes all the indicator labels that were previously filtered.
  const clearChartFilter = () => {
    $("#single-chart-filtered-container").html("");
  };

  Highcharts.setOptions({
    lang: {
      decimalPoint: ".",
      thousandsSep: ","
    }
  });

  async function loadScriptEvents() {
    try {
      initChartsModeSwitch();
      await getMetricsData();
      hideSidepanelCategoriesWithoutData();
      initSingleChart();
      initMultipleCharts();
      sidePanelSwitchPlatform(getDeviceOs());
      setSidepanelCollapserState();
      bindSidePanelEvents();
      initEventPanel();
      setChartsBoostBadge((singleModeIsOn = true));
      setChartsBoostSpanStatus();
    } catch (error) {
      catchException(`rendering chart.js script`, error);
    }
  }

  function getSessionDurationInMs() {
    return new Date(state.testInfo.end) - new Date(state.testInfo.real_start);
  }

  async function getMetricsData() {
    let osMetrics = metrics[getDeviceOs().toLowerCase()];
    let metricKeys = Object.keys(osMetrics);
    let uniqueLogFiles = metricKeys.reduce((logs, metricKey) => {
      let logFile = osMetrics[metricKey].logFile;
      if (logs.indexOf(logFile) == -1) logs.push(logFile);
      return logs;
    }, []);
    let logsData = await getLogs(getLogFilesDirectory(), uniqueLogFiles);
    let metricData = {};
    // Parse each log row, and sort by time
    metricKeys.forEach((metricKey) => {
      let metric = osMetrics[metricKey];
      let logFile = logsData[metric.logFile];
      if (logFile) {
        // Avoid processing columns that not exists on tsv data (logFile)
        if (logFile.length > 0 && logFile[0][metric.logFileKey] != undefined) {
          metricData[metricKey] = logFile
            .map((logRow) => {
              if (anyMetricHasSurpassedThreshold(logFile.length)) {
                metricHasSurpassedThreshold = true;
              }
              let value = parseFloat(Number(metric.parseValue(logRow[metric.logFileKey]).toFixed(2)));

              return [parseInt(logRow["time"]), !isNaN(value) ? value : null];
            })
            .sort((a, b) => {
              return a[0] - b[0];
            });
        }
      }
    });
    const path = getLogFilePath("events.tsv");
    let eventsJson = await getTsvAsJson(path, (shouldSanitize = true));
    eventsInfo = parseEvents(eventsJson);

    // Events are parsed at this point, now we can build the alert-apptim message
    $("#alert-apptim-container").html(`<div class="alert alert-apptim" role="alert"><i class="fa fa-info-circle"/> ${getChartFilterAlert()}</div>`);

    chartMetrics = [
      {
        id: "appCpu",
        name: appCpu.title,
        data: metricData.appCpu,
        type: "percent",
        unit: appCpu.unit,
        visible: true,
        color: colors.justBlue,
        category: "CPU"
      },
      {
        id: "deviceCpu",
        name: deviceCpu.title,
        data: metricData.deviceCpu,
        type: "percent",
        unit: deviceCpu.unit,
        visible: true,
        color: colors.justBlue,
        category: "CPU"
      },
      {
        id: "threadsCount",
        name: threadsCount.title,
        data: metricData.threadsCount,
        type: "linear",
        unit: threadsCount.unit,
        visible: true,
        color: colors.justBlue,
        category: "CPU"
      },
      {
        id: "appMemory",
        name: appMemory.title,
        data: metricData.appMemory,
        type: "linear",
        unit: appMemory.unit,
        visible: true,
        color: colors.brownie,
        category: "Memory"
      },
      {
        id: "deviceMemory",
        name: deviceMemory.title,
        data: metricData.deviceMemory,
        type: "linear",
        unit: deviceMemory.unit,
        visible: true,
        color: colors.brownie,
        category: "Memory"
      },
      {
        id: "appMemoryResidentSize",
        name: appMemoryResidentSize.title,
        data: metricData.appMemoryResidentSize,
        type: "linear",
        unit: appMemoryResidentSize.unit,
        visible: true,
        color: colors.brownie,
        category: "Memory"
      },
      {
        id: "appMemoryDalvik",
        name: appMemoryDalvik.title,
        data: metricData.appMemoryDalvik,
        type: "linear",
        unit: appMemoryDalvik.unit,
        visible: true,
        color: colors.brownie,
        category: "Memory"
      },
      {
        id: "appMemoryNative",
        name: appMemoryNative.title,
        data: metricData.appMemoryNative,
        type: "linear",
        unit: appMemoryNative.unit,
        visible: true,
        color: colors.brownie,
        category: "Memory"
      },
      {
        id: "netDownload",
        name: netDownload.title,
        data: metricData.netDownload,
        type: "linear",
        unit: netDownload.unit,
        visible: true,
        color: colors.redTomato,
        category: "Network"
      },
      {
        id: "netUpload",
        name: netUpload.title,
        data: metricData.netUpload,
        type: "linear",
        unit: netUpload.unit,
        visible: true,
        color: colors.redTomato,
        category: "Network"
      },
      {
        id: "renderFPS",
        name: renderFps.title,
        data: metricData.renderFps,
        type: "linear",
        unit: renderFps.unit,
        visible: true,
        color: colors.brightPurple,
        category: "Render"
      },
      {
        id: "renderJanks",
        name: renderJanks.title,
        data: metricData.renderJanks,
        type: "linear",
        unit: renderJanks.unit,
        visible: true,
        color: colors.brightPurple,
        category: "Render"
      },
      {
        id: "renderLayoutMeasureTime",
        name: renderLayoutMeasureTime.title,
        data: metricData.renderLayoutMeasureTime,
        type: "linear",
        unit: renderLayoutMeasureTime.unit,
        visible: true,
        color: colors.brightPurple,
        category: "Render"
      },
      {
        id: "renderDrawTime",
        name: renderDrawTime.title,
        data: metricData.renderDrawTime,
        type: "linear",
        unit: renderDrawTime.unit,
        visible: true,
        color: colors.brightPurple,
        category: "Render"
      },
      {
        id: "renderInputEvents",
        name: renderInputEvents.title,
        data: metricData.renderInputEvents,
        type: "linear",
        unit: renderInputEvents.unit,
        visible: true,
        color: colors.brightPurple,
        category: "Render"
      },
      {
        id: "renderAnimations",
        name: renderAnimations.title,
        data: metricData.renderAnimations,
        type: "linear",
        unit: renderAnimations.unit,
        visible: true,
        color: colors.brightPurple,
        category: "Render"
      },
      {
        id: "energyScore",
        name: energyScore.title,
        data: metricData.energyScore,
        type: "linear",
        unit: "pts",
        visible: true,
        color: colors.slimeGreen,
        category: "Energy"
      },
      {
        id: "cpuEnergy",
        name: cpuEnergy.title,
        data: metricData.cpuEnergy,
        type: "linear",
        unit: cpuEnergy.unit,
        visible: true,
        color: colors.slimeGreen,
        category: "Energy"
      },
      {
        id: "gpuEnergy",
        name: gpuEnergy.title,
        data: metricData.gpuEnergy,
        type: "linear",
        unit: gpuEnergy.unit,
        visible: true,
        color: colors.slimeGreen,
        category: "Energy"
      },
      {
        id: "networkEnergy",
        name: networkEnergy.title,
        data: metricData.networkEnergy,
        type: "linear",
        unit: networkEnergy.unit,
        visible: true,
        color: colors.slimeGreen,
        category: "Energy"
      },
      {
        id: "locationEnergy",
        name: locationEnergy.title,
        data: metricData.locationEnergy,
        type: "linear",
        unit: locationEnergy.unit,
        visible: true,
        color: colors.slimeGreen,
        category: "Energy"
      },
      {
        id: "displayEnergy",
        name: displayEnergy.title,
        data: metricData.displayEnergy,
        type: "linear",
        unit: displayEnergy.unit,
        visible: true,
        color: colors.slimeGreen,
        category: "Energy"
      },
      {
        id: "overheadEnergy",
        name: overheadEnergy.title,
        data: metricData.overheadEnergy,
        type: "linear",
        unit: overheadEnergy.unit,
        visible: true,
        color: colors.slimeGreen,
        category: "Energy"
      },
      {
        id: "marks",
        name: marks.title,
        data: metricData.marks,
        type: "percent",
        unit: marks.unit,
        visible: true,
        color: colors.apptimPurple,
        category: "Marks"
      }
    ].filter((m) => m.data != undefined);
  }

  // Returns true if metric (array of data) has a bigger length than CHART_BOOST_THRESHOLD.
  function anyMetricHasSurpassedThreshold(metricDataLength) {
    return metricDataLength > CHART_BOOST_THRESHOLD;
  }

  // Render charts boost badge with options to toggle status.
  function setChartsBoostBadge(singleModeIsOn) {
    if (metricHasSurpassedThreshold) {
      const chartsBoostContainer = $(`.charts-boost-container[data-chart-mode='${singleModeIsOn ? "single" : "multiple"}']`);
      $(".charts-boost-alert").remove();
      chartsBoostContainer.append(`<div class="alert alert-very-light charts-boost-alert" role="alert" title="Toggle GPU Translations and rendering engine (WebGL/SVG).">
		<span class="charts-boost-option-container"></span>
		</div>`);
    }
  }

  // Render Disable/Enable option based on current status.
  function setChartsBoostSpanStatus() {
    if (getChartsBoostSavedStatus()) {
      $(".charts-boost-option-container").html("<button class='btn-apptim btn-disable-charts-boost'>Disable boost</button> <span class='charts-boost-span'>Improve chart quality reducing performance.</span>");
    } else {
      $(".charts-boost-option-container").html("<button class='btn-apptim btn-enable-charts-boost'>Enable boost</button> <span class='charts-boost-span'>Improve chart performance reducing quality.</span>");
    }
  }

  // Returns saved boost status.
  function getChartsBoostSavedStatus() {
    return chartsBoostKeyExists() ? JSON.parse(localStorage.getItem("CHARTS_BOOST_IS_ENABLED")) : false;
  }

  // Returns true if there is a saved boost status.
  function chartsBoostKeyExists() {
    return JSON.parse(localStorage.getItem("CHARTS_BOOST_IS_ENABLED")) != null;
  }

  // Save boost status, redraw single/multiple charts and set span text based on new state.
  function toggleChartsBoostStatus(currentStatus) {
    localStorage.setItem("CHARTS_BOOST_IS_ENABLED", currentStatus);
    redrawSingleChart();
    setChartsBoostSpanStatus();
    if (!singleChartModeIsOn) redrawAllCharts();
  }

  $(document).on("click", ".btn-enable-charts-boost", function () {
    toggleChartsBoostStatus((currentStatus = true));
  });

  $(document).on("click", ".btn-disable-charts-boost", function () {
    toggleChartsBoostStatus((currentStatus = false));
  });

  function getMetricsWithData() {
    return chartMetrics.filter((metric) => metric.data.length > 0);
  }

  /*
	The sidepanel is not being created from scratch by script,
	all the categories are harcoded on the HTML file so we are missing
	that previous step to only filter metrics with data.
	That's why we need to use this function to hide sidepanel categories specifically.
	TO-DO: Remove sidepanel categories from index.html and create using js.
*/
  function hideSidepanelCategoriesWithoutData() {
    const metricsWithoutData = chartMetrics.filter((metric) => metric.data.length == 0);
    for (let met of metricsWithoutData) {
      $(`[data-category='${met.category.toLowerCase()}']`).parent().hide();
    }
  }

  function clearMultiCharts() {
    $("#multiple-chart-container").empty();
  }

  function clearSingleChart() {
    $("#single-chart-container").empty();
  }

  function redrawSingleChart() {
    clearSingleChart();
    initSingleChart();
  }

  function redrawAllCharts() {
    try {
      clearMultiCharts();
      initMultipleCharts();
      sidePanelSwitchPlatform(getDeviceOs());
      bindSidePanelEvents();
    } catch (error) {
      console.log(error)
    }
  }

  $(window).resize(function() {
    redrawAllCharts();
  });

  function initSingleChart() {
    $(".zoom-info[data-chart-mode='single']").show();
    if (singleChartResourceController) {
      singleChartResourceController.chart.destroy();
      singleChartResourceController = null;
    }
    singleChartResourceController = new ResourceGraphController("single-chart-container", chartMetrics, eventsInfo, {
      xAxisMax: getSessionDurationInMs(),
      boostIsEnabled: getChartsBoostSavedStatus()
    });
  }

  function initMultipleCharts() {
    const chartOptions = {
      isTall: false,
      isLine: false,
      legendsEnabled: true,
      xAxisMax: getSessionDurationInMs(),
      boostIsEnabled: getChartsBoostSavedStatus()
    };
    const metricsWithData = getMetricsWithData();
    let categoriesUsed = [];
    for (let metric of metricsWithData) {
      const metricCategory = metric.category.toLowerCase();
      const chartCategory = `<div data-toggle="collapse" data-target=".${metricCategory}-category"
    data-caret="fixed" data-category="${metricCategory.toLowerCase()}"
    class="monkop-collapser collapsed col-lg-12 col-md-12 col-sm-12 col-xs-12" id="${metricCategory}-category">
    <span class='panel-header-title ml-3'>${metricCategory == "cpu" ? metricCategory.toUpperCase() : capitalizeFirstLetter(metricCategory)}</span><hr>
    ${
      metricCategory == "render" && state.renderInfoInsights && state.renderInfoInsights.length > 0
        ? `<div class="alert alert-apptim"><i class="fa fa-info-circle"></i> ${RENDER_INFO_ALERT}</div><div class="alert alert-warning"><b><i class="fa fa-exclamation-triangle"></i> Insights during the test (not critical)</b>${state.renderInfoInsights
            .map((insight) => `<p>• ${insight}</p>`)
            .join("")}</div>`
        : ""
    }

      ${
        metricCategory == "cpu"
          ? `<div class="alert alert-apptim"><i class="fa fa-info-circle"></i> Starting from <b>Apptim Desktop v1.6.9</b>, the CPU usage metric values will now take into account multi-core CPUs.<br/>
          <b>Explanation</b>: Modern CPUs often have multiple cores, which allow them to execute multiple tasks simultaneously. Each core can handle its own workload independently. As of now, when monitoring CPU usage you might encounter CPU percentages that appear to exceed 100%. This indicates that the total CPU utilization across all cores is higher than the capacity of a single core. </div>`
          : ""
      }

      ${
        metricCategory == "energy" && getDeviceOs() == "android"
          ? `<div class="alert alert-apptim"><i class="fa fa-info-circle"></i> Apptim profiles the use of the CPU and GPS sensor, and it displays a visualization of how much energy each of these components uses. This Energy Score also shows you occurrences of system events (wake locks, alarms, jobs, and location requests) that can affect energy consumption. Read more about how this works <a style='color: var(--lightish-blue);' target='_blank' href="https://docs.apptim.com/guides/android-energy-foundation">here</a>.</div>`
          : ""
      }

      </div>`;
      const categoryWasNotAddedYet = !categoriesUsed.includes(metricCategory);
      if (categoryWasNotAddedYet && metricCategory == "marks") {
        $("#multiple-chart-container").prepend(chartCategory);
        categoriesUsed.push(metricCategory);
      } else if (categoryWasNotAddedYet) {
        $("#multiple-chart-container").append(chartCategory);
        categoriesUsed.push(metricCategory);
      }
    }
    metricsWithData.map((chartSettings) => {
      const chartId = chartSettings.id;
      const metricCategory = chartSettings.category.toLowerCase();
      const highchartId = `${chartId}-chart`;
      const chartDiv = `<div class="col-lg-6 col-md-6 col-sm-6 col-xs-6 ${metricCategory}-category chart-category-container panel-collapse collapse in" id='${chartId}-container'><div id='${highchartId}'></div></div>`;
      if (categoriesUsed.includes(metricCategory)) {
        $(`#${metricCategory}-category`).append(chartDiv);
        const resourceController = new ResourceGraphController(highchartId, [chartSettings], eventsInfo, chartOptions);
        multipleChartsResourceControllers.push(resourceController);
      }
      bindSyncronizationEvent(highchartId);
    });
  }
  // Initialize bootstrap switch checkbox (Option to pick Single or Multiple).
  function initChartsModeSwitch() {
    $("#chk-charts-mode").bootstrapSwitch();
    $("#chk-multicharts-mode").bootstrapSwitch();
  }

  function clearTippyInstances() {
    window.tippyInstances.forEach((instance) => {
      instance.destroy();
    });
    window.tippyInstances.length = 0;
  }

  // Toggle Single/Multiple charts.
  $(document).on("switchChange.bootstrapSwitch", "#chk-charts-mode", function (event, state) {
    // ! Do not remove event parameter.
    if (state == true) {
      // SINGLE CHART MODE
      singleChartModeIsOn = true;
      // Change switch label
      $(".bootstrap-switch-label").html("Multiple");
      // Hide multiple chart elements
      $("#multiple-chart-container").hide();
      // Hide multiple chart mode tippy
      $("#multicharts-mode").hide();
      setSidepanelCollapserState();
      // Show category collapser arrows
      $(".fa.fa-chevron-down.chart-item-collapser").show();
      clearTippyInstances();
      setupSidepanelView((singleModeIsOn = true));
      // Set charts boost badge
      setChartsBoostBadge((singleModeIsOn = true));
      setChartsBoostSpanStatus();
      // Show zoom info label
      $(".zoom-info[data-chart-mode='multiple']").hide();
      $(".zoom-info[data-chart-mode='single']").show();
      // Adapt alert apptim element to multiple charts mode
      if (lastFilter) {
        $("#span-time-filtered").html(lastFilter);
      } else {
        // MULTIPLE CHARTS MODE
        singleChartModeIsOn = false;
        // Change switch label
        $(".bootstrap-switch-label").html("Single");
        // Show multiple chart elements
        $("#multiple-chart-container").show();
        // Hide sidepanel collapser
        setSidepanelCollapserState((show = false));
        // Hide category collapser arrows but keep the events collapser.
        $(".fa.fa-chevron-down.chart-item-collapser").hide();
        $("#events-collapser").show();
        setupSidepanelView((singleModeIsOn = false));
        // Set charts boost badge
        setChartsBoostBadge((singleModeIsOn = false));
        setChartsBoostSpanStatus();
        // Show zoom info label
        $(".zoom-info[data-chart-mode='multiple']").show();
        $(".zoom-info[data-chart-mode='single']").hide();
        $("#span-time-filtered").html(getChartFilterAlert());
      }
    } else {
      // MULTIPLE CHARTS MODE
      singleChartModeIsOn = false;
      // Change switch label
      $(".bootstrap-switch-label").html("Single");
      // Show multiple chart elements
      $("#multiple-chart-container").show();
      // Hide sidepanel collapser
      setSidepanelCollapserState((show = false));
      // Hide category collapser arrows but keep the events collapser.
      $(".fa.fa-chevron-down.chart-item-collapser").hide();
      $("#events-collapser").show();
      setupSidepanelView((singleModeIsOn = false));
      // Set charts boost badge
      setChartsBoostBadge((singleModeIsOn = false));
      setChartsBoostSpanStatus();
      // If screen is not small: allow multicharts grid mode.
      if (screenIsBigEnough()) {
        $("#multicharts-mode").show();
        setMultichartsOptions();
      }
      // Save default panel state to use if mode has changed (full/grid)
      setDefaultLargePanelState();
      // Show zoom info label
      $(".zoom-info[data-chart-mode='multiple']").show();
      $(".zoom-info[data-chart-mode='single']").hide();
      $("#span-time-filtered").html(getChartFilterAlert());
    }
  });

  function setupSidepanelView(singleModeIsOn = true) {
    const categories = $(".category");
    if (singleModeIsOn) {
      // Hide large sidepanel
      $("#large-charts-panel").hide();
      // Show short sidepanel
      $("#short-charts-panel").show();
      // Collapse category metrics again
      $(".category-metrics").removeClass("collapsed").addClass("collapse");
    } else {
      // Hide short sidepanel
      $("#short-charts-panel").hide();
      // Show large sidepanel
      $("#large-charts-panel").show();
      // Sort large sidepanel on 3 columns view
      for (let c = 0; c < categories.length; c++) {
        const categoryElement = categories[c];
        const categoryChildren = categoryElement.children[0];
        const categoryMetricChildren = categoryElement.children[1];
        const categoryName = $(categoryChildren).data("category");
        if (categoryName == "cpu" || categoryName == "memory" || categoryName == "render") {
          $(categoryMetricChildren).removeClass("collapse").addClass("collapsed");
          $(categoryElement).detach().appendTo("#first-panel-container");
        } else if (categoryName == "marks") {
          $(categoryElement).detach().appendTo("#marks-panel-container");
        } else {
          $(categoryMetricChildren).removeClass("collapse").addClass("collapsed");
          $(categoryElement).detach().appendTo("#second-panel-container");
        }
      }
    }
  }

  function bindSyncronizationEvent(highchartId) {
    ["mousemove", "touchmove", "touchstart"].forEach(function (eventType) {
      document.getElementById(highchartId).addEventListener(eventType, function (e) {
        var chart,
          points,
          i,
          secSeriesIndex = 1;
        let currentChart = Highcharts.charts.filter((c) => c != undefined).find((chart) => chart.renderTo == e.currentTarget);
        en = currentChart.pointer.normalize(e); // Find coordinates within the chart
        let coord = currentChart.pointer.getCoordinates(en);
        let xValue = parseInt(coord.xAxis[0].value);
        let xOffset = 1000;
        let selectedPoints = [];
        currentChart.series.forEach((s) => {
          let pointsInRange = s.points.filter((p) => "series" in p && p.series.visible && p.x >= xValue - xOffset && p.x <= xValue + xOffset);
          if (pointsInRange.length) {
            let min = Math.min(...pointsInRange.map((p) => Math.abs(p.x - xValue)));
            let closestPointIndex = pointsInRange.findIndex((p) => Math.abs(p.x - xValue) == min);
            let closestPoint = s.getPoint(pointsInRange[closestPointIndex]);
            selectedPoints.push(closestPoint);
          }
        });
        if (currentChart.hoverPoints && currentChart.hoverPoints.length && selectedPoints.length) {
          currentChart.xAxis[0].drawCrosshair(en, selectedPoints[0]); // Show the crosshair
          for (i = 0; i < Highcharts.charts.length; i++) {
            chart = Highcharts.charts[i];
            if (!chart || chart == currentChart) continue;
            // let xValue = selectedPoints[0].x;
            let xValue = parseInt(coord.xAxis[0].value);
            let points = [];
            chart.series.forEach((s) => {
              let pointsInRange = s.points.filter((p) => "series" in p && p.series.visible && p.x >= xValue - xOffset && p.x <= xValue + xOffset);
              if (pointsInRange.length) {
                let min = Math.min(...pointsInRange.map((p) => Math.abs(p.x - xValue)));
                let closestPointIndex = pointsInRange.findIndex((p) => Math.abs(p.x - xValue) == min);
                let closestPoint = s.getPoint(pointsInRange[closestPointIndex]);
                points.push(closestPoint);
              }
            });
            if (points.length) {
              chart.tooltip.refresh(points); // Show the tooltip
              chart.xAxis[0].drawCrosshair(e, points[0]); // Show the crosshair
            }
          }
        }
      });
    });
  }

  function bindSidePanelEvents() {
    $("[data-category] > .custom-checkbox > input[type=checkbox]").change(function (e) {
      let categoryId = $(this).closest("[data-category]").attr("data-category");
      if ($(this).prop("checked") || $(this).prop("indeterminate") == true) enableCategory(categoryId);
      else disableCategory(categoryId);
      singleChartResourceController.redraw(false);
      return false;
    });
    $(".category > .category-title").hover(function (e) {
      let categoryCheckbox = $(this).find("input[type='checkbox']");
      if ($(categoryCheckbox).prop("checked") || $(categoryCheckbox).prop("indeterminate")) {
        let categoryId = $(this).closest("[data-category]").attr("data-category");
        if (categoryId != "marks") singleChartResourceController.highlightMetrics(categories[categoryId]);
      }
    });
    $(".category > .category-title").on("mouseout", function (e) {
      singleChartResourceController.removeHighlightMetrics();
    });
    $("[data-metric] > .custom-checkbox").hover(function (e) {
      let metricCheckbox = $(this).find("input[type='checkbox']");
      let metricId = $(this).closest("[data-metric]").attr("data-metric");
      if ($(metricCheckbox).prop("checked")) {
        singleChartResourceController.highlightMetrics([metricId]);
        toggleSpecificChart(metricId, (show = true));
      } else {
        toggleSpecificChart(metricId, (show = false));
      }
    });
    $("[data-metric] > .custom-checkbox").on("mouseout", function (e) {
      singleChartResourceController.removeHighlightMetrics();
    });
    $("[data-metric] > .custom-checkbox > input[type=checkbox]").change(function (e) {
      let metricId = $(this).closest("[data-metric]").attr("data-metric");
      if ($(this).prop("checked")) enableMetric(metricId);
      else disableMetric(metricId);
      singleChartResourceController.redraw(false);
    });
    $("#txt-search-events").on("input", function (e) {
      eventSearchValue = e.target.value;
      updateEventSearch(eventSearchValue);
    });
    $(document).on("click", ".paginated-items-list .pagination-nav .pagination-prev", function (e) {
      let rootElem = $(this).closest(".paginated-items-list");
      let counterElem = $(rootElem).find(".current-page .current-page-counter");
      let currentPageIndex = parseInt($(counterElem).html());
      let targetPageIndex = currentPageIndex - 1;
      let targetPage = $(rootElem).find(`.paginated-items [data-page='${targetPageIndex}']`);
      if (targetPage.length) {
        $(rootElem).find(".paginated-page.active").removeClass("active");
        $(targetPage).addClass("active");
        $(counterElem).html(targetPageIndex);
      }
    });
    $(document).on("click", ".paginated-items-list .pagination-nav .pagination-next", function (e) {
      let rootElem = $(this).closest(".paginated-items-list");
      let counterElem = $(rootElem).find(".current-page .current-page-counter");
      let currentPageIndex = parseInt($(counterElem).html());
      let targetPageIndex = currentPageIndex + 1;
      let targetPage = $(rootElem).find(`.paginated-items [data-page='${targetPageIndex}']`);
      if (targetPage.length) {
        $(rootElem).find(".paginated-page.active").removeClass("active");
        $(targetPage).addClass("active");
        $(counterElem).html(targetPageIndex);
      }
    });
    $(document).on("change", "#event-search-results [data-event-id] input[type='checkbox']", function (e) {
      let rootElem = $(this).closest("[data-event-id]");
      let eventId = $(rootElem).attr("data-event-id");
      if ($(this).prop("checked")) {
        showEvent(eventId);
      } else {
        hideEvent(eventId);
      }
    });
    $(document).on("change", "#search-events-active-list [data-event-id] input[type='checkbox']", function (e) {
      let rootElem = $(this).closest("[data-event-id]");
      let eventId = $(rootElem).attr("data-event-id");
      hideEvent(eventId);
      updateEventSearch(eventSearchValue);
    });
  }

  function updateEventSearch(sValue = eventSearchValue) {
    if (sValue) {
      $("#event-search-results .paginated-items").addClass("hidden");
      $("#event-search-results .pagination-nav").addClass("hidden");
      $("#event-search-results .paginated-loader").addClass("show");
      $("#search-event-error").hide();
      if (eventSearchTimeout) {
        clearTimeout(eventSearchTimeout);
        eventSearchTimeout = null;
      }
      eventSearchTimeout = setTimeout(() => {
        let searchEvents = eventsInfo.filter((event) => event.eventName.toLowerCase().includes(sValue.toLowerCase()));
        if (searchEvents.length) {
          $("#search-event-error").hide();
        } else {
          $("#search-event-error").html("No events found").show();
        }
        updateEventSearchResults(searchEvents);
        $("#event-search-results .paginated-loader").removeClass("show");
        $("#event-search-results .paginated-items").removeClass("hidden");
        $("#event-search-results .pagination-nav").removeClass("hidden");
      }, SEARCH_WAIT_TIMEOUT);
    } else {
      $("#search-event-error").hide();
      clearTimeout(eventSearchTimeout);
      eventSearchTimeout = null;
      $("#event-search-results .paginated-loader").removeClass("show");
      // Show inactive events
      updateEventSearchResults(getUnselectedEvents());
      $("#event-search-results .paginated-items").removeClass("hidden");
      $("#event-search-results .pagination-nav").removeClass("hidden");
    }
  }

  function setSidepanelCollapserState(show = true) {
    if (show) $("#btn-toggle-panel").show();
    else $("#btn-toggle-panel").hide();
  }

  function sidePanelSwitchPlatform(platform) {
    if (platform.toLowerCase() == "android") {
      $('[data-metric="appMemory"] .unit').html("MB");
      $('[data-metric="deviceMemory"] .unit').html("MB");
      disableMetric("appMemoryDalvik");
      disableMetric("appMemoryNative");
      disableMetric("renderJanks");
      disableMetric("renderLayoutMeasureTime");
      disableMetric("renderDrawTime");
      disableMetric("renderInputEvents");
      disableMetric("renderAnimations");
      $('[data-metric="cpuEnergy"]').remove();
      $('[data-metric="gpuEnergy"]').remove();
      $('[data-metric="networkEnergy"]').remove();
      $('[data-metric="locationEnergy"]').remove();
      $('[data-metric="displayEnergy"]').remove();
      $('[data-metric="overheadEnergy"]').remove();
      $('[data-metric="appMemoryResidentSize"]').remove();
    } else {
      $('[data-metric="appMemory"] .unit').html("MiB");
      $('[data-metric="deviceMemory"] .unit').html("MiB");
      disableMetric("appMemoryResidentSize");
      $('[data-metric="appMemoryDalvik"]').remove();
      $('[data-metric="appMemoryNative"]').remove();
      $('[data-metric="renderJanks"]').remove();
      $('[data-metric="renderDrawTime"]').remove();
      $('[data-metric="renderLayoutMeasureTime"]').remove();
      $('[data-metric="renderInputEvents"]').remove();
      $('[data-metric="renderAnimations"]').remove();

      const networkParent = $('[data-category="network"]').parent();
      networkParent.remove();

      disableMetric("cpuEnergy");
      disableMetric("gpuEnergy");
      disableMetric("networkEnergy");
      disableMetric("locationEnergy");
      disableMetric("displayEnergy");
      disableMetric("overheadEnergy");
    }
    singleChartResourceController.redraw(false);
  }

  function initEventPanel() {
    let categoryMarkRoot = $("[data-category='marks']");
    if (!eventsInfo.length) {
      $("#search-event-no-marks").show().html("No marks found for this session.");
      $("#txt-search-events").hide();
      $(categoryMarkRoot).find("[data-toggle='collapse']").click();
      $(categoryMarkRoot).find("input[type='checkbox']").prop("checked", false);
      $(categoryMarkRoot).find("input[type='checkbox']").attr("disabled", "true");
    } else if (singleChartResourceController.eventsEnabled) {
      eventsInfo.forEach((e) => (e.isSelected = true));
      $(categoryMarkRoot).find("input[type='checkbox']").prop("checked", singleChartResourceController.eventsEnabled);
      $(categoryMarkRoot).find("[data-toggle='collapse']").click();
    } else {
      $(categoryMarkRoot).find("input[type='checkbox']").attr("disabled", "true");
      tippy("[data-category=marks] .custom-checkbox", {
        content: "Too many marks.<br/>Try enabling them one by one.",
        allowHTML: true
      });
      $(categoryMarkRoot).find("input[type='checkbox']").prop("checked", singleChartResourceController.eventsEnabled);
    }
    updateActiveSearchEvents();
    updateEventSearch();
  }

  function getEventById(id) {
    return eventsInfo.find((e) => e.id == id);
  }

  function getSelectedEvents() {
    return eventsInfo.filter((e) => e.isSelected);
  }

  function getUnselectedEvents() {
    return eventsInfo.filter((e) => !e.isSelected);
  }

  function atLeastOneMarkIsChecked() {
    return $(".event-checkbox > .custom-checkbox > input[type=checkbox]:checked").length > 0;
  }

  // Fix marks tooltip display issue by calculating if axis is near to the end.
  function getCalculatedEventAxis(thisElement) {
    const xAxisWidth = thisElement.axis.width;
    const labelX = thisElement.label.alignAttr.x;
    const labelY = thisElement.label.alignAttr.y;
    const isNear = xAxisWidth - labelX <= 100;
    const labelXCalculated = isNear ? labelX - 220 : labelX;
    const labelYCalculated = labelY + 25;
    return { XAxis: labelXCalculated, YAxis: labelYCalculated };
  }

  function showEvent(eventId) {
    let event = getEventById(eventId);
    event.isSelected = true;
    singleChartResourceController.showEvent(event);
    for (let resource of multipleChartsResourceControllers) {
      resource.showEvent(event);
    }
    updateActiveSearchEvents();
    toggleEventCheckboxes(eventId, true);
    if (atLeastOneMarkIsChecked()) {
      $("#marks-category").show();
    }
  }

  function hideEvent(eventId) {
    let event = getEventById(eventId);
    event.isSelected = false;
    singleChartResourceController.hideEvent(event);
    for (let resource of multipleChartsResourceControllers) {
      resource.hideEvent(event);
    }
    updateActiveSearchEvents();
    toggleEventCheckboxes(eventId, false);
    if (!atLeastOneMarkIsChecked()) {
      $("#marks-category").hide();
    }
  }

  function toggleEventCheckboxes(eventId, selected) {
    $(`[data-event-id=${eventId}] input[type='checkbox']`).prop("checked", selected);
    let selectedEventsLength = getSelectedEvents().length;
    let marksCategoryCheckbox = $(`[data-category='marks'] input[type='checkbox']`);
    $(marksCategoryCheckbox).prop("indeterminate", false);
    if (selectedEventsLength == eventsInfo.length) $(marksCategoryCheckbox).prop("checked", true);
    else if (selectedEventsLength == 0) $(marksCategoryCheckbox).prop("checked", false);
    else {
      $(marksCategoryCheckbox).prop("checked", false);
      $(marksCategoryCheckbox).prop("indeterminate", true);
    }
    $(`#event-search-results .event-checkbox[data-event-id=${eventId}]`).hide();
  }

  function buildEventCheckbox(event, checked = false) {
    return `
  <div class="event-checkbox" data-event-result data-event-id="${event.id}">
      <label class="custom-checkbox" title="${event.eventName}">
          <span class="checkbox-content">
            <span class="event-name">${event.eventName}</span>
            <span class="event-duration">${event.isSingleEvent() ? msToTime(event.startTime) : `${msToTime(event.startTime)} - ${msToTime(event.stopTime)}`}</span>
          </span>
          <input type="checkbox" ${checked ? "checked='true'" : ""}/>
          <span class="checkmark fa"></span>
      </label>
  </div>`;
  }

  function updateEventSearchResults(events) {
    renderPaginationItems(
      "#event-search-results",
      events.map((event) => buildEventCheckbox(event, event.isSelected)),
      8
    );
  }

  function renderPaginationItems(paginationRootSelector, items = [], pageSize = 5) {
    let paginationRootElem = $(paginationRootSelector);
    let paginationItems = $(paginationRootElem).find(".paginated-items");
    let paginationNav = $(paginationRootElem).find(".pagination-nav");
    let totalPagesCounter = $(paginationNav).find(".total-pages-counter");
    let currentPageCounter = $(paginationNav).find(".current-page-counter");
    $(currentPageCounter).html("1");
    let pagedItems = items.reduce((pages, item, index) => {
      let i = parseInt(index / pageSize);
      if (typeof pages[i] == "undefined") pages[i] = [];
      pages[i].push(item);
      return pages;
    }, []);
    if (pagedItems.length > 1) {
      $(paginationNav).addClass("show");
      $(totalPagesCounter).html(pagedItems.length);
    } else {
      $(paginationNav).removeClass("show");
      $(totalPagesCounter).html(pagedItems.length);
    }
    let htmlContent = pagedItems
      .map((page, pageIndex) => {
        return `
      <div class="paginated-page ${pageIndex == 0 ? "active" : ""}" data-page="${pageIndex + 1}">
          ${page.join("")}
      </div>`;
      })
      .join("");
    $(paginationItems).html(htmlContent);
  }

  function updateActiveSearchEvents(events = getSelectedEvents()) {
    if (events.length) {
      $("#search-events-active").addClass("show");
    } else {
      $("#search-events-active").removeClass("show");
    }
    renderPaginationItems(
      "#search-events-active-list",
      events.map((event) => buildEventCheckbox(event, true)),
      5
    );
    $("#search-events-active-count").html(events.length);
  }

  function toggleMetricCheckbox(metricId, checked) {
    let metricElem = $(`[data-metric="${metricId}"`);
    $(metricElem).find("input[type=checkbox]").prop("checked", checked);
    let categoryCheckbox = $(metricElem).closest(".category").find(".category-title input[type=checkbox]");
    let metricsChecked = $(metricElem).closest(".category-metrics").find("input[type=checkbox]:checked");
    let metricsUnChecked = $(metricElem).closest(".category-metrics").find("input[type=checkbox]:not(:checked)");
    if (metricsChecked.length) {
      if (metricsUnChecked.length) $(categoryCheckbox).prop("checked", false).prop("indeterminate", true);
      else $(categoryCheckbox).prop("indeterminate", false).prop("checked", true);
    } else $(categoryCheckbox).prop("indeterminate", false).prop("checked", false);
  }

  function enableMetric(id) {
    toggleMetricCheckbox(id, true);
    if (id == "eventSingle" || id == "eventTimeTaken") {
      eventsInfo.forEach((e) => (e.isSelected = true));
      updateActiveSearchEvents();
      updateEventSearch();
      singleChartResourceController.showEvents();
      for (let resource of multipleChartsResourceControllers) {
        resource.showEvents();
      }
    } else {
      singleChartResourceController.showMetric(id, true);
      toggleSpecificChart(id, (show = true));
    }
  }

  function isAnyChartBeingDisplayedForThisCategory(categoryKey) {
    const charts = categories[categoryKey];
    let isAnyChartDisplayed = [];
    for (let c of charts) {
      const thisChart = $(`#${c}-chart`);
      if (thisChart.length > 0 && thisChart.css("display") != "none") {
        return true;
      } else {
        isAnyChartDisplayed.push(false);
      }
    }
    if (!isAnyChartDisplayed.includes(true)) return false;
  }

  function toggleSpecificChart(categoryId, show = true) {
    if (show) $(`#${categoryId}-chart`).show();
    else $(`#${categoryId}-chart`).hide();
    const categoryKey = getObjectKeyBasedOnValue(categories, categoryId);
    const result = isAnyChartBeingDisplayedForThisCategory(categoryKey);
    // If there's no metric checked, hide entire category.
    if (!result) {
      $(`#${categoryKey}-category`).hide();
    } else {
      $(`#${categoryKey}-category`).show();
    }
  }

  function disableMetric(id) {
    toggleMetricCheckbox(id, false);
    if (id == "eventSingle" || id == "eventTimeTaken") {
      eventsInfo.forEach((e) => (e.isSelected = false));
      updateActiveSearchEvents();
      updateEventSearch();
      singleChartResourceController.hideEvents();
      for (let resource of multipleChartsResourceControllers) {
        resource.hideEvents();
      }
    } else {
      singleChartResourceController.hideMetric(id, false);
      toggleSpecificChart(id, (show = false));
    }
  }

  function categoryIsEnabledOrIndeterminate(indicator, indeterminate = false) {
    return $(`[data-category="${indicator.filterCategory}"`).find(`input[type=checkbox]:${indeterminate ? "indeterminate" : "checked"}`)[0];
  }

  function enableCategory(id) {
    let categoryMetrics = categories[id];
    categoryMetrics.forEach((metricId) => {
      enableMetric(metricId);
    });
    $(`[data-category="${id}"`).find("input[type=checkbox]").prop("checked", true);
    $(`.label-filtered-indicator[data-category="${id}"`).show();
    $(`.monkop-collapser[data-category="${id}"`).show();
  }

  function disableCategory(id) {
    let categoryMetrics = categories[id];
    categoryMetrics.forEach((metricId) => {
      disableMetric(metricId);
    });
    $(`[data-category="${id}"`).find("input[type=checkbox]").prop("checked", false);
    $(`.label-filtered-indicator[data-category="${id}"`).hide();
    $(`.monkop-collapser[data-category="${id}"`).hide();
  }
  // Toggle sidepanel event
  $("#btn-toggle-panel").on("click", function () {
    if (!$("#resources-sidepanel").is(":visible")) {
      $("#resources-sidepanel").show();
      $("#btn-toggle-panel > i").removeClass("fa-chevron-left").addClass("fa-chevron-right");
      $("#short-charts-panel").removeClass("col-lg-12").addClass("col-lg-9");
      $(".graph-sidepanel .category").css("padding", "6px 12px");
      $("#btn-toggle-panel").removeClass("btn-toggle-panel-hide").addClass("btn-toggle-panel-show");
      $(".graph-sidepanel").css("overflow-y", "scroll");
      $("#btn-toggle-panel > i").css("left", "1px");
      $("#alert-apptim-container").removeClass("col-lg-12").addClass("col-lg-9");
      singleChartResourceController.redraw(false);
    } else {
      $("#btn-toggle-panel > i").removeClass("fa-chevron-right").addClass("fa-chevron-left");
      $("#resources-sidepanel").hide();
      $("#short-charts-panel").removeClass("col-lg-9").addClass("col-lg-12");
      $(".graph-sidepanel .category").css("padding", "15px");
      $("#btn-toggle-panel").removeClass("btn-toggle-panel-show").addClass("btn-toggle-panel-hide");
      $(".graph-sidepanel").css("overflow-y", "hidden");
      $("#btn-toggle-panel > i").css("left", "-1px");
      $("#alert-apptim-container").removeClass("col-lg-9").addClass("col-lg-12");
      singleChartResourceController.redraw(false);
    }
  });
  async function getLogs(logFolder, logFiles) {
    logsData = await Promise.all(
      logFiles.map((logFile) => {
        return new Promise((resolve, reject) => {
          getTsvAsJson(`${logFolder}${logFile}`, (shouldSanitize = true))
            .then(resolve)
            .catch((error) => {
              catchException(`getting log ${logFile}`, error);
              resolve([]);
            });
        });
      })
    );
    return logFiles.reduce((data, logFile, i) => {
      data[logFile] = logsData[i];
      return data;
    }, {});
  }

  // Fix "click and drag zoom" propagation that makes container to toggle collapse property.
  $(document).on("click", ".chart-category-container", function (event) {
    event.stopPropagation();
  });

  function getMaxAxisY(unit) {
    // Set Axis Y max value to 1000 for Android Score Points unit
    return unit == "pts" && platformIsAndroid() ? 1000 : null;
  }

  function getPlotLines(unit) {
    // Set Dashed PlotLines for Android Score Points unit
    return unit == "pts" && platformIsAndroid()
      ? [{
        color: colors["redTomato"],
        width: 2,
        value: 1000,
        dashStyle: "dash",
        label: {
          rotation: 270,
          style: {
            fontSize: 11,
            color: colors["redTomato"]
          },
          allowOverlap: false,
          text: 'Heavy',
          x: -2,
          y: 42
        },
        zIndex: 5
      },
      {
        color: colors["yellowOrange"],
        width: 1.5,
        value: 500,
        dashStyle: "dash",
        label: {
          rotation: 270,
          style: {
            fontSize: 11,
            color: colors["yellowOrange"]
          },
          allowOverlap: false,
          text: 'Medium',
          x: -2,
          y: 22
        },
        zIndex: 5
      },
      {
        color: colors["slimeGreen"],
        width: 1,
        value: 250,
        dashStyle: "dash",
        label: {
          rotation: 270,
          style: {
            fontSize: 11,
            color: colors["slimeGreen"]
          },
          allowOverlap: false,
          text: 'Light',
          x: -2,
          y: 35
        },
        zIndex: 5
      }] : [];
  }

  class ResourceGraphController {
    constructor(container, metrics, events = {}, customOptions = {}) {
      /*
		  ResourceGraphController API
		  setExtremes -> Set extremes event availability
		  isTall -> Set a bigger height. Default value: true (500px)
		  isLine -> Chart is line or area?
		  legendsEnabled -> Set if legends will be shown.
		*/
      this.customOptions = {
        ...customOptions,
        setExtremes: typeof customOptions.setExtremes != "undefined" ? customOptions.setExtremes : CHART_SET_EXTREMES_DEFAULT,
        isTall: typeof customOptions.isTall != "undefined" ? customOptions.isTall : CHART_IS_TALL_DEFAULT,
        isLine: typeof customOptions.isLine != "undefined" ? customOptions.isLine : CHART_IS_LINE_DEFAULT,
        legendsEnabled: typeof customOptions.legendsEnabled != "undefined" ? customOptions.legendsEnabled : CHART_LEGENDS_ENABLED_DEFAULT,
        boostIsEnabled: typeof customOptions.boostIsEnabled != "undefined" ? getChartsBoostSavedStatus() : false
      };
      this.plotLineHoverOffsetPixels = 3;
      this.plotLineWidth = 1;
      this.container = container;
      this.metrics = metrics;
      this.events = events;
      this.eventsEnabled = true;
      this.xAxisMin = 0;
      this.xAxisMax = this.customOptions.xAxisMax ? this.customOptions.xAxisMax : this.getMaxTime();
      // To first plot size
      this.chart = new Highcharts.chart(this.container, {});
      this.XAxisPixelValue = this.getXAxisMaxPixelValue();
      this.eventsEnabled = !(this.calculatePlotLinesFillRatio() > 0.3 || this.calculatePlotBandsFillRatio() > 1.5 || this.events.length > 200);
      this.chart = new Highcharts.chart(this.container, this.getOptions(this.customOptions));
    }
    update(animation = true) {
      if (!this.chart) this.chart = new Highcharts.chart(this.container, this.getOptions());
      else this.chart.update(this.getOptions(), true, true, animation);
      this.getXAxisMaxPixelValue();
    }
    redraw(animation = false) {
      this.chart.redraw(animation);
      // Adapt to potential container size.
      this.chart.reflow();
    }
    hideMetric(id, redraw = true) {
      try {
        let metricIndex = this.metrics.findIndex((m) => m.id == id);
        if (metricIndex >= 0) this.chart.series[metricIndex].setVisible(false, redraw);
      } catch (error) {
        catchException(`trying to hide metric`, error);
      }
    }
    showMetric(id, redraw = true) {
      let metricIndex = this.metrics.findIndex((m) => m.id == id);
      if (metricIndex >= 0) this.chart.series[metricIndex].setVisible(true, redraw);
    }
    hideEvents() {
      this.events.forEach((e) => {
        this.hideEvent(e);
      });
    }
    showEvents() {
      this.events.forEach((e) => {
        this.showEvent(e);
      });
    }
    showSingleEvents() {
      this.events.forEach((e) => {
        if (e.isSingleEvent()) this.showEvent(e);
      });
    }
    hideSingleEvents() {
      this.events.forEach((e) => {
        if (e.isSingleEvent()) this.hideEvent(e);
      });
    }
    showTimeTakenEvents() {
      this.events.forEach((e) => {
        if (!e.isSingleEvent()) this.showEvent(e);
      });
    }
    hideTimeTakenEvents() {
      this.events.forEach((e) => {
        if (!e.isSingleEvent()) this.hideEvent(e);
      });
    }
    showEvent(eventOrId) {
      let event = null;
      if (typeof eventOrId == "object") event = eventOrId;
      else event = this.events.find((e) => e.id == eventOrId);
      if (event == null || event == undefined || this.chart.xAxis[0].plotLinesAndBands.find((p) => p.id == event.id)) return;
      if (event.isSingleEvent()) this.chart.xAxis[0].addPlotLine(this.buildPlotLineFromEvent(event));
      else this.chart.xAxis[0].addPlotBand(this.buildPlotBandFromEvent(event));
    }
    hideEvent(eventOrId) {
      let id = eventOrId;
      if (typeof eventOrId == "object") id = eventOrId.id;
      this.chart.xAxis[0].removePlotBandOrLine(id);
    }
    getMaxTime() {
      return Math.max(
        ...this.metrics.map((m) => {
          let data = m.data;
          if (data.length > 0) {
            for (let i = data.length - 1; i >= 0; i--) {
              return data[i][0];
            }
          }
          return 0;
        })
      );
    }
    getXAxisMaxPixelValue() {
      return this.xAxisMax / this.chart.plotWidth;
    }
    getCurrentXAxisPixelValue() {
      return (this.chart.xAxis[0].max - this.chart.xAxis[0].min) / this.chart.plotWidth;
    }
    highlightMetrics(metricsId) {
      this.chart.series.forEach((s) => {
        if (metricsId.indexOf(s.userOptions.id) != -1) s.setState("hover");
        else s.setState("inactive");
      });
    }
    removeHighlightMetrics() {
      this.chart.series.forEach((s) => {
        s.setState();
      });
    }
    setSerieState(index, state) {
      this.chart.series[index].setState(state);
    }
    setAllSeriesState(state) {
      this.chart.series.forEach((s) => {
        s.setState(state);
      });
    }
    chartOnRedrawHandler() {
      this.getXAxisMaxPixelValue();
    }
    calculatePlotBandsFillRatio() {
      let timeTakenEvents = this.events.filter((e) => !e.isSingleEvent());
      let plotBandsTimeCombined = timeTakenEvents.reduce((total, event) => {
        let d = event.getDuration();
        if (d) total += d;
        return total;
      }, 0);
      let fillPixels = plotBandsTimeCombined / this.XAxisPixelValue;
      return fillPixels / this.chart.plotWidth;
    }
    calculatePlotLinesFillRatio() {
      let uniquePixelEvents = {};
      let singleEvents = this.events.filter((e) => e.isSingleEvent());
      singleEvents.forEach((e) => {
        let eIndex = parseInt(e.startTime / this.XAxisPixelValue);
        if (typeof uniquePixelEvents[eIndex] == "undefined") uniquePixelEvents[eIndex] = e;
      });
      let fillPixels = 0;
      let lineWidth = this.plotLineWidth;
      let lastKey = null;
      Object.keys(uniquePixelEvents).forEach((key, index) => {
        let fill = lastKey ? Math.min(key - lastKey, lineWidth) : lineWidth;
        fillPixels += fill;
        lastKey = key;
      });
      return fillPixels / this.chart.plotWidth;
    }
    getYAxisOptions() {
      let baseYAxis = function (name, unit, opposite = false) {
        return {
          max: getMaxAxisY(unit),
          plotLines: getPlotLines(unit),
          labels: {
            format: `{value}${unit}`
          },
          title: {
            text: name
          },
          unit: unit,
          opposite,
          showEmpty: false
        };
      };
      let yAxisType = {
        percent: function (name, color, unit, opposite) {
          return {
            ...baseYAxis(name, color, unit, opposite),
            min: 0,
            endOnTick: false
          };
        },
        linear: function (name, color, unit, opposite) {
          return baseYAxis(name, color, unit, opposite);
        }
      };
      let defaultAxises = [
        yAxisType.percent("", "%", false),
        yAxisType.linear("", "", true),
        yAxisType.linear("", "FPS", false),
        yAxisType.linear("", "Janks", false),
        yAxisType.linear("", "MB", true),
        yAxisType.linear("", "MiB", true),
        yAxisType.linear("", "KB", true),
        yAxisType.linear("", "ms", true),
        yAxisType.linear("", "pts", false)
      ];
      let axises = defaultAxises.filter((axis) => {
        return this.metrics.find((m) => axis.unit == m.unit);
      });
      axises.forEach((axis, index) => {
        axis.opposite = index != 0;
      });
      return axises;
    }
    getSeriesOptions(customOptions) {
      let axis = this.getYAxisOptions();
      return this.metrics.map((m) => {
        return {
          name: m.name,
          type: customOptions.isLine ? "line" : "area",
          yAxis: axis.findIndex((a) => a.unit == m.unit),
          data: m.data,
          tooltip: {
            valueDecimals: 2,
            valueSuffix: ` ${m.unit}`
          },
          color: m.color,
          stickyTracking: false,
          findNearestPointBy: "x",
          fillOpacity: getChartsBoostSavedStatus() ? 1 : 0.1,
          allowPointSelect: true,
          lineWidth: 1,
          id: m.id
        };
      });
    }

    getOptions(customOptions) {
      return {
        chart: {
          zoomType: "x",
          panning: true,
          panKey: "shift",
          events: {
            redraw: this.chartOnRedrawHandler.bind(this)
          },
          plotBackgroundColor: "#F8FAFC",
          plotBorderColor: "#C8D8E2",
          plotBorderWidth: 1,
          height: customOptions.isTall ? 500 : 250,
          spacingRight: 25,
          spacingLeft: 25
        },
        credits: {
          enabled: false
        },
        boost: {
          useGPUTranslations: true,
          enabled: customOptions.boostIsEnabled
        },
        title: null,
        xAxis: {
          type: "datetime",
          dateTimeLabelFormats: {
            millisecond: "%H:%M:%S.%L",
            second: "%H:%M:%S",
            minute: "%H:%M",
            hour: "%H:%M",
            day: "",
            week: "",
            month: "",
            year: ""
          },
          ...this.getPlotLinesAndBandsOptions(),
          events: {
            setExtremes: function (e) {
              if (customOptions.setExtremes) {
                // Reset zoom button was clicked
                if (typeof e.min == "undefined" && typeof e.max == "undefined") {
                  clearChartFilter();
                  lastFilter = null;
                  // Reset alert apptim element to default value
                  $("#span-time-filtered").html(getChartFilterAlert());
                }
                // Drag & Drop detected
                else {
                  clearChartFilter();
                  const times = $(".highcharts-xaxis-labels")[0].children;
                  const timesLength = times.length;
                  if (timesLength >= 2) {
                    const t0 = e.min;
                    const t1 = e.max;
                    const totalTime = t1 - t0;
                    // Build alert apptim message using t0 & t1.
                    const timeFiltered = `Test session filtered from <b>${msToTimeStr(t0)}</b> to <b>${msToTimeStr(t1)}</b> (${msToTimeStr(totalTime)})`;
                    $("#span-time-filtered").html(timeFiltered);
                    // Save the last filtered time in case the user moves to the multi-chart view
                    lastFilter = timeFiltered;
                    // Call the function to calculate indicators based on metadata, t0 & t1
                    const calculatedIndicators = calculateIndicators(t0, t1);
                    calculatedIndicators.map((indicator) => {
                      if (indicator.factorized >= 0) {
                        // Do not show the label if there is no factorized value
                        $("#single-chart-filtered-container").append(`
											<button class="label-filtered-indicator" data-category='${indicator.filterCategory}' style="background-color: ${indicator.color}; border-color: ${indicator.color}; margin-bottom: 5px;" 
												type="button"> ${indicator.title} <span class="badge" style="color: ${indicator.color}">${indicator.factorized >= 0 ? indicator.factorized + " " + indicator.displayUnit : "None"}</span>
											</button>`);
                        // Adapt which labels are going to be displayed based on right sidepanel checkboxes
                        const labelIndicator = $(`.label-filtered-indicator[data-category="${indicator.seriesName}"`);
                        const categoryShouldBeDisplayed = categoryIsEnabledOrIndeterminate(indicator) || categoryIsEnabledOrIndeterminate(indicator, true);
                        categoryShouldBeDisplayed ? labelIndicator.show() : labelIndicator.hide();
                      }
                    });
                  }
                }
              }
            }
          },
          min: this.xAxisMin,
          max: this.xAxisMax
        },
        yAxis: this.getYAxisOptions(),
        mapNavigation: {
          enabled: true,
          enableDoubleClickZoomTo: true
        },
        series: this.getSeriesOptions(customOptions),
        plotOptions: {
          series: {
            marker: {
              enabled: false
            },
            findNearestPointBy: "x",
            stickyTracking: false,
            boostThreshold: CHART_BOOST_THRESHOLD,
            label: {
              enabled: customOptions.isLine ? true : false,
              style: {
                fontFamily: "Sofia-Regular",
                fontSize: "1.2em"
              }
            },
            point: {
              events: {
                mouseOut: function (e) {
                  if (this.series.chart.customHoverPoints) {
                    this.series.chart.customHoverPoints.forEach((p) => {
                      if (typeof p.series != "undefined") {
                        p.series.setState();
                        p.setState();
                      }
                    });
                    this.series.chart.customHoverPoints = undefined;
                  }
                }
              }
            }
          }
        },
        tooltip: {
          shared: false,
          dateTimeLabelFormats: {
            millisecond: "%H:%M:%S.%L"
          },
          enabled: true,
          snap: 2,
          crosshairs: true,
          useHTML: true,
          formatter: function (e) {
            let xValue = this.x;
            let xOffset = 1000;
            let nearPoints = [];
            e.chart.series.forEach((s) => {
              if (!s.visible) return;
              let pointsInRange = s.points.filter((p) => p.x >= xValue - xOffset && p.x <= xValue + xOffset);
              if (pointsInRange.length) {
                let min = Math.min(...pointsInRange.map((p) => Math.abs(p.x - xValue)));
                let closestPointIndex = pointsInRange.findIndex((p) => Math.abs(p.x - xValue) == min);
                let closestPoint = s.getPoint(pointsInRange[closestPointIndex]);
                if (typeof s.alteredByBoost == "undefined") {
                  s.setState("hover");
                  closestPoint.setState("hover");
                }
                nearPoints.push(closestPoint);
              }
            });
            e.chart.customHoverPoints = nearPoints;
            let hoverPoints = nearPoints.map((p) => p.series.getPoint(p).getLabelConfig());
            let tooltipBody = hoverPoints.map(function (item) {
              return item.point.tooltipFormatter.call(item.point, `<span style="color:{point.color}">●</span> {series.name} - {point.x:%H:%M:%S.%L}: <b>{point.y}</b><br/>`);
            });
            let res = Highcharts.format(["", tooltipBody, ""]);
            res = replaceAll(res, ",", "");
            return res;
          }
        },
        legend: {
          enabled: customOptions.legendsEnabled ? true : false,
          layout: "horizontal",
          align: "center",
          verticalAlign: "bottom",
          floating: false,
          backgroundColor:
            Highcharts.defaultOptions.legend.backgroundColor || // theme
            "rgba(255,255,255,0.25)"
        },
        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 500
              },
              chartOptions: {
                legend: {
                  floating: false,
                  layout: "horizontal",
                  align: "center",
                  verticalAlign: "bottom",
                  x: 0,
                  y: 0
                },
                yAxis: [
                  {
                    labels: {
                      align: "right",
                      x: 0,
                      y: -6
                    },
                    showLastLabel: false
                  },
                  {
                    labels: {
                      align: "left",
                      x: 0,
                      y: -6
                    },
                    showLastLabel: false
                  },
                  {
                    visible: false
                  }
                ]
              }
            }
          ]
        }
      };
    }
    plotLineMouseOverHandler(self, e) {
      var chart = self.chart;
      const xValue = parseInt(this.options.value);
      const xOffset = self.getCurrentXAxisPixelValue() * self.plotLineHoverOffsetPixels;
      const leftXOffset = xValue - xOffset;
      const rightXOffset = xValue + xOffset;
      const nearEvents = chart.xAxis[0].plotLinesAndBands.filter((p) => {
        if (typeof p.options.value != "undefined") {
          let eventXValue = parseInt(p.options.value);
          return eventXValue >= leftXOffset && eventXValue <= rightXOffset;
        }
        return false;
      });
      if (nearEvents.length) {
        let labelText = "";
        nearEvents.forEach((e) => {
          let event = eventsInfo.find((event) => event.id == e.id);
          labelText += `<b>Event:</b> ${event.eventName} <br/> <b>Time:</b> ${msToTimeStr(event.startTime)}`;
        });
        chart.customTooltip = chart.renderer.label(labelText, getCalculatedEventAxis(this)["XAxis"], getCalculatedEventAxis(this)["YAxis"], undefined, undefined, undefined, true, undefined, "label-custom-plot").attr({}).add();
        singleChartResourceController.setAllSeriesState("inactive");
      }
    }
    plotLineMouseOutHandler(e) {
      var chart = this.axis.chart;
      if (chart.customTooltip) {
        chart.customTooltip.destroy();
        delete chart.customTooltip;
      }
      singleChartResourceController.setAllSeriesState("normal");
    }
    buildPlotLineFromEvent(event) {
      return {
        color: colors.apptimPurple,
        dashStyle: "solid",
        value: event.startTime,
        width: this.plotLineWidth,
        className: "plot-line-custom",
        zIndex: 2,
        label: {
          text: event.eventName,
          formatter: function () {
            return null;
          }
        },
        id: event.id,
        events: {
          mouseover: partial(this.plotLineMouseOverHandler, this),
          mouseout: this.plotLineMouseOutHandler
        }
      };
    }
    plotBandMouseOverHandler(e) {
      var chart = this.axis.chart;
      const event = eventsInfo.filter((ev) => ev.id == this.id)[0];
      if (event) {
        let labelText = `Event: ${event.eventName} <br/>Start: ${msToTimeStr(event.startTime)} | End: ${msToTimeStr(event.stopTime)} <br/>Duration: ${msToTimeStr(event.getDuration())}`;
        chart.customTooltip = chart.renderer.label(labelText, getCalculatedEventAxis(this)["XAxis"], getCalculatedEventAxis(this)["YAxis"], undefined, undefined, undefined, true, undefined, "label-custom-plot").attr({}).add();
      }
    }
    plotBandMouseOutHandler(e) {
      var chart = this.axis.chart;
      if (chart.customTooltip) {
        chart.customTooltip.destroy();
        delete chart.customTooltip;
      }
      singleChartResourceController.setAllSeriesState("normal");
    }
    buildPlotBandFromEvent(event) {
      return {
        color: "rgba(83, 95, 249, 0.2)",
        from: event.startTime,
        to: event.stopTime,
        id: event.id,
        zIndex: 1,
        label: {
          text: event.eventName,
          align: "left",
          x: +10,
          formatter: function (e) {
            return null;
          }
        },
        events: {
          click: function (ev) {
            /** Filter by marks
             *  A click event on a plot band will trigger
             *  a zoom taking start & end values of that event.
             */
            const chart = this.axis.chart;
            const event = eventsInfo.filter((ev) => ev.id == this.id)[0];
            if (event) {
              const t0 = event.startTime;
              const t1 = event.stopTime;
              chart.xAxis[0].setExtremes(t0, t1);
              if (!chart.resetZoomButton) {
                chart.showResetZoom();
              }
            }
          },
          mouseover: this.plotBandMouseOverHandler,
          mouseout: this.plotBandMouseOutHandler
        }
      };
    }
    getPlotLinesAndBandsOptions() {
      let plotBands = [];
      let plotLines = [];
      if (this.eventsEnabled) {
        this.events.forEach((event) => {
          if (event.isSingleEvent()) {
            plotLines.push(this.buildPlotLineFromEvent(event));
          } else {
            plotBands.push(this.buildPlotBandFromEvent(event));
          }
        });
      }
      return {
        plotLines,
        plotBands
      };
    }
  }
  class LogEvent {
    constructor(id, eventName, eventStart, stopTime = null) {
      this.id = id;
      this.eventName = eventName;
      this.startTime = eventStart;
      this.stopTime = stopTime;
      this.isSelected = false;
    }
    // int: duration, null: no duration (single event), -1: no end
    getDuration() {
      if (this.startTime && this.stopTime) {
        if (this.stopTime == -1) return -1;
        else return this.stopTime - this.startTime;
      }
      return null;
    }
    isSingleEvent() {
      return this.stopTime == null;
    }
  }

  /*
   * Parses both single and time-taken marks from JSON data.
   * If some event has a START mark but no STOP (or viceversa)
   * the mark is discarded.
   */
  function parseEvents(eventsInfo) {
    let events = [];
    let processedStops = [];
    if (eventsInfo) {
      eventsInfo.forEach((event, eventIndex) => {
        if (shouldSkipEvent(event)) return;
        let eventName = event[marks.logFileKey].trim();
        let eventStart = parseInt(event["time"].trim());
        if (event.value == "STOP") return;
        if (event.value == "START") {
          let stopEvent = findNextStopEvent(eventsInfo, eventName, eventIndex, processedStops);
          if (stopEvent) {
            // Save STOP index on array to skip processing next time
            processedStops[eventName] = eventsInfo.indexOf(stopEvent);
            let eventStop = parseInt(stopEvent["time"].trim()) || -1;
            events.push(new LogEvent(eventIndex, eventName, eventStart, eventStop));
          }
        } else {
          events.push(new LogEvent(eventIndex, eventName, eventStart));
        }
      });
    }
    return events;
  }

  function findNextStopEvent(eventsInfo, eventName, eventIndex, processedStops) {
    // Choose the last index (between current and last Stop):
    let startFrom = Math.max(processedStops[eventName] || eventIndex, eventIndex);
    // Find the next STOP mark that is after START and latest STOP found:
    return eventsInfo.find((e, i) => i > startFrom && e[marks.logFileKey] === eventName && e["value"] === "STOP");
  }

  /*
   * Skip events without time or name.
   * Events with "" as value means that are single-mark events, unlike time-taken events
   * which has START | STOP value.
   */
  function shouldSkipEvent(event) {
    return typeof event["time"] == "undefined" || event["time"].trim() == "" || typeof event[marks.logFileKey] == "undefined" || event[marks.logFileKey].trim() == "" || typeof event["value"] == "undefined";
  }


  // Clean old appended stuff before redrawing
  //   function cleanSummary() {
  //     $("#summary-card-items").empty();
  //     $("#summary-items").empty();
  //     $("#nav-correctness-badge-container").empty();
  //     $("#nav-crash-badge-container").empty();
  //     $("#summary-pass-items").empty();
  //   }

  await loadScriptEvents();
  hideLoadingOverlay();
});
