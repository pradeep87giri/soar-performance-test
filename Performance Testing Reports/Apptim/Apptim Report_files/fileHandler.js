var filesAreReady = false;
var outputFileExists = true;
// File paths
const ROOT = "./";
const TWO_DIR_BACKWARDS_PATH = "../../";

const CONFIG_PATH = "config/";
const CONTEXTUAL_HELP_MENU_JSON_PATH = CONFIG_PATH + "contextual_help_menu.json";
const CONTEXTUAL_INFO_POPUP_JSON_PATH = CONFIG_PATH + "contextual_info_popup.json";

const IMAGES_FOLDER_PATH = "images/";

const PROFILER_DATA_FOLDER_PATH = "profiler_data/";
const THRESHOLDS_FOLDER_PATH = "thresholds/";
const TEST_INFO_JSON = "test_info.json";
const MISSION_JSON = "mission.json";
const APP_JSON = "app.json";
const ENVIRONMENT_JSON = "environment.json";
const DEVICE_INFO_JSON = "device_info.json";
const OUTPUT_JSON_PATH = TWO_DIR_BACKWARDS_PATH + "output.json";
const LOGS_JSON = "logs.json";
const THRESHOLDS_YML_FILE = "thresholds.yml"
const TEST_RESULT_JSON = "test_result.json";
const METADATA_JSON = "metadata_v2.json";

// TSVs
const STARTUP_TIME_TSV = "startup_time.tsv";
const CRASH_INFO_TSV = "crashinfo.tsv";

// Used for single chart mode filter
const CPU_INFO_TSV = "cpuinfo.tsv";
const MEM_INFO_TSV = "meminfo.tsv";
const RENDER_INFO_TSV = "renderinfo.tsv";
const RENDER_INFO_INSIGHTS = "renderinfo_insights.json";
const NETWORK_INFO_TSV = "netinfo.tsv";
// iOS only
const ENERGY_INFO_TSV = "energy.tsv";

// OLD PATHS
const DEVICE_INFO_FOLDER_PATH = TWO_DIR_BACKWARDS_PATH + "device_info/"; // Device image path
const LOGS_FOLDER_PATH = "logs/"; // TSVs path
let FILES = [];


document.addEventListener("DOMContentLoaded", function () {
    showLoadingOverlay();
    setupRootDirectories()
    .then(async() => {
        await storeAllFiles();
        await commitStartupTime();
        await commitErrorsTsv();
        await setupLogsDirectory();
        await storeAllFiles(storingLogFiles = true);
        filesAreReady = true;
        console.log("Files are ready!", filesAreReady);
    });
});

async function commitErrorsTsv() {
    const path = getLogFilePath(CRASH_INFO_TSV);
    const res = await getTsvAsJson(path);
    if(res) {
        const errors = res.filter(item =>  item.severity == 'error' || item.severity == 'user')
        commitToState("crashInfo", 
        {
            tsv: res, 
            quantity: errors.length
        });
    }
}

// Commit startup time after fetching & parsing tsv to json
async function commitStartupTime() {
    const path = getLogFilePath(STARTUP_TIME_TSV);
    const res = await getTsvAsJson(path);
    if (res) {
        commitToState("startupTime", platformIsAndroid() ? res[0] : res);
    }
}

// Loop through all files and store them
async function storeAllFiles(storingLogFiles = false) {
    return await Promise.allSettled(FILES.map(async(file) => { 
        const fileName = file.name;
        const filePath = file.path;
        if(storingLogFiles) {
            if(filePath.includes("tsv")) {
                const res = await getTsvAsJson(filePath);
                if(res) {
                    commitToState(fileName, res, isTsvFile = true);
                }
            }
        }
        else {
            await fetchFile(filePath)
            .then(fileData => {    
                if(fileName == "deviceInfo") {
                    fileData = getDeviceInfoFirstKey(fileData);
                }
                commitToState(fileName, fileData)
            })  
            .catch(error => {
                catchException(`storing ${fileName} file`, error);
            });
        }
    }));
}

function getDeviceInfoFirstKey(json) {
    const selectedDevice = Object.keys(json)[0]; // Device name
    return json[selectedDevice]; // Device object by name
}

// Setup root directories before fetching files
function setupRootDirectories() {
    return new Promise(async (resolve) => {
        const output = await outputExists();
        if(!output) {
            outputFileExists = false;
        }
        FILES = 
        [{name: "testInfo", path: outputFileExists ? getTwoDirBackwardsPath(MISSION_JSON) : getTwoDirBackwardsPath(TEST_INFO_JSON)},
        {name: "appInfo", path: getTwoDirBackwardsPath(APP_JSON)},
        {name: "environment", path: getTwoDirBackwardsPath(ENVIRONMENT_JSON)},
        {name: "deviceInfo", path: getTwoDirBackwardsPath(DEVICE_INFO_JSON)},
        {name: "logs", path: getTwoDirBackwardsPath(LOGS_JSON)},
        {name: "contextualInfoPopup", path: CONTEXTUAL_INFO_POPUP_JSON_PATH},
        {name: "testResult", path: getTwoDirBackwardsPath(TEST_RESULT_JSON)},
        {name: "metadata", path: getMetadataPath()},
        {name: "renderInfoInsights", path: getLogFilePath(RENDER_INFO_INSIGHTS)}];
        resolve()
    });
}

function setupLogsDirectory() {
    return new Promise(async (resolve) => {
        FILES = 
        [{name: CPU_INFO_TSV, path: getLogFilePath(CPU_INFO_TSV)},
        {name: MEM_INFO_TSV, path: getLogFilePath(MEM_INFO_TSV)},       
        {name: RENDER_INFO_TSV, path: getLogFilePath(RENDER_INFO_TSV)},
        {name: NETWORK_INFO_TSV, path: getLogFilePath(NETWORK_INFO_TSV)},
        {name: ENERGY_INFO_TSV, path: getLogFilePath(ENERGY_INFO_TSV)}];
        resolve()
    });
}

// Checks if the output file exists, save to state if it does
async function outputExists() {
    const outputFile = await fetchFile(OUTPUT_JSON_PATH);
    if(outputFile) {
        commitToState("output", outputFile);
    }
    return outputFile;
}

// Returns the path of the metadata file
function getMetadataPath() {
    return ROOT + THRESHOLDS_FOLDER_PATH + METADATA_JSON;
}

// Returns two dir backwards path of the file
function getTwoDirBackwardsPath(fileName) {
    return TWO_DIR_BACKWARDS_PATH + fileName;
}

// Returns the tsv files path depending on the output file existence
function getLogFilesDirectory() {
    return outputFileExists ? TWO_DIR_BACKWARDS_PATH + state.deviceInfo.id_uid + `/${LOGS_FOLDER_PATH}` : TWO_DIR_BACKWARDS_PATH + PROFILER_DATA_FOLDER_PATH;
}

function getLogFilePath(fileName) {
    return getLogFilesDirectory() + fileName;
}

// Returns the path of the mp4 output file
function getVideoFilePath() {
    const videoFileName = "output.mp4";
    return outputFileExists
      ? TWO_DIR_BACKWARDS_PATH + state.deviceInfo.id_uid + `/${videoFileName}`
      : TWO_DIR_BACKWARDS_PATH + PROFILER_DATA_FOLDER_PATH + `${videoFileName}`;
}
  

// Returns the path of the file based on output existence and specific directory
function getFilePath(fileName) {
    return TWO_DIR_BACKWARDS_PATH + fileName;
}

function getDeviceImageDirectory() {
    return outputFileExists ? DEVICE_INFO_FOLDER_PATH : TWO_DIR_BACKWARDS_PATH;;
}

// Resolves when files are ready to continue
async function waitForFilesReady() {
	await waitForCondition(() => {return filesAreReady}, 60000, 10);
}

function getUserThresholds() {
    return outputFileExists ? "./thresholds/custom.yml" : TWO_DIR_BACKWARDS_PATH + THRESHOLDS_YML_FILE;
}

