import config from "./config";
import EventLogger from "./eventLogger";

const logger = new EventLogger({
    batchSize: 10,
    logInterval: 5000
});

export function LOG(...args) {
    let message = args.join(" ");

    if (config.debug) {
        console.log("AKTANA:", message);
    }

    if (config.logEvents) {
        logger.add(message);
    }
}

export function hmsToSeconds(str) {
    let p = str.split(":"),
        s = 0,
        m = 1;
    while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
    }
    return s;
}

export function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export function calculateVideoId(duration) {
    const videoId = "aktana-" + duration.toFixed(3).replace(".", "").padStart(8, "0");
    return videoId;
}

export function debounce(func, wait, immediate) {
    let timeout;

    return function executedFunction() {
        const context = this;
        const args = arguments;

        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);

        if (callNow) func.apply(context, args);
    };
}

export function secondsToHours(seconds) {
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(seconds / 3600);
    seconds -= minutes * 60;
    minutes -= hours * 60;

    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;

    return (hours > 0 ? `${hours}:` : "") + minutes + ":" + seconds;
}

export function secondsToHoursFull(seconds) {
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(seconds / 3600);
    seconds -= minutes * 60;
    minutes -= hours * 60;

    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    if (hours < 10) hours = "0" + hours;

    return hours + ":" + minutes + ":" + seconds;
}

export function getQueryParam(key) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == key) {
            return decodeURIComponent(pair[1]);
        }
    }
}

export async function getAuthToken() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["auth_token"], ({ auth_token }) => {
            if (auth_token) {
                resolve(auth_token);
            } else {
                resolve(null);
                // reject("Auth token not found");
            }
        });
    });
}
