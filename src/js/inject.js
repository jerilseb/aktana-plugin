import EventEmitter from "emittery";
import { calculateVideoId, sleep, LOG, getAuthToken } from "./lib/util";
import { waitForElementInsertion, waitForElement } from "./lib/domUtil";
import Question from "./Questions/question";
import Topics from "./Topics/topics";

window.addEventListener("load", async () => {
    LOG("Initializing extension ");

    const manifest = chrome.runtime.getManifest();
    LOG("VERSION:", manifest.version);

    try {
        await initialize();
    } catch (err) {
        console.error("AKTANA:", err);
    }
});

async function initialize() {
    const EE = new EventEmitter();
    let video = null;
    let setupInProgress = false;

    EE.on("seek-video", time => {
        if (video) {
            video.currentTime = time;
            video.play();
        }
    });

    video = document.querySelector("video");
    if (video) {
        LOG("Video found on first load");
        setupVideo();
        await sleep(500);
    }

    while (true) {
        video = await waitForElementInsertion(document.body, "video");
        setupVideo();
        await sleep(500);
    }

    function setupVideo() {
        if (/learning\/content/.test(location.pathname)) {
            if (video.duration) {
                LOG("Metadata already loaded", video.duration);
                setupControls();
            } else {
                LOG("Waiting for video metadata");
                video.addEventListener("loadedmetadata", async () => {
                    LOG("Metadata loaded");
                    setupControls();
                });
            }
        } else {
            LOG("Skipping video");
        }
    }

    async function setupControls() {
        if(setupInProgress) {
            LOG("Setup already in progress, skipping");
            return;
        }

        setupInProgress = true;
        setTimeout(() => {
            setupInProgress = false;
        }, 1000);

        const videoId = calculateVideoId(video.duration);
        const container = video.parentElement;
        const controlBar = await waitForElement(container, ".vjs-control-bar");
        const titleDiv = document.querySelector(".container header h1:first-child");

        let videoTitle = null;
        if (titleDiv && titleDiv.textContent) {
            videoTitle = titleDiv.textContent.trim();
            LOG("Video Title:", videoTitle);
        }

        const questions = new Question(EE, video, controlBar);
        const topics = new Topics(EE, video, controlBar);

        // Fire a time update event every second
        let prevTime = 0;
        let interval = setInterval(() => {
            if (document.body.contains(container)) {
                let currentTime = Math.floor(video.currentTime);
                if (prevTime !== currentTime) {
                    EE.emit("time-update", currentTime);
                    prevTime = currentTime;
                }
            } else {
                clearInterval(interval);
            }
        }, 1000);

        questions.initialize(videoId, videoTitle);

        let auth_token = await getAuthToken();
        if (auth_token) {
            LOG("Auth token found, enabling admin mode");
            questions.enableAdminMode();
        }

        // topics.setupControls(container, controlBar);
        // await topics.getTopcis(videoId);
        topics.initialize(videoId);
    }
}
