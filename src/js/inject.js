import EventEmitter from "eventemitter3";
import md5 from "fast-md5";
import { sleep, debounce, getQueryParam, LOG } from "./lib/util";
import { waitForElementInsertion, waitForElement } from "./lib/domUtil";
import Question from "./Questions/question";
// import Topics from "./Topics/topics";
import Topics from "./Topics/topics";

window.addEventListener("load", async () => {
    LOG("Document load fired");

    try {
        await initialize();
    } catch (err) {
        console.error("AKTANA:", err);
    }
});

async function initialize() {
    const EE = new EventEmitter();
    let video = null;

    EE.on("seek-video", (time) => {
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
        if (video.duration) {
            LOG("Metadata already loaded", video.duration);
            setupControls();
        } else {
            LOG("Waiting for metadata", video.duration);
            video.addEventListener("loadedmetadata", async () => {
                LOG("Metadata loaded");
                setupControls();
            });
        }
    }

    async function setupControls() {
        const videoId = "aktana-" + video.duration.toFixed(3).replace(".", "").padStart(8, "0");
        const container = video.parentElement;
        const controlBar = await waitForElement(container, ".vjs-control-bar");
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

        questions.initialize(videoId);

        chrome.storage.local.get(["auth_token"], ({ auth_token }) => {
            if (auth_token) {
                LOG("Auth token found, enabling edit mode");
                questions.editable = true;
            }
        });

        // topics.setupControls(container, controlBar);
        // await topics.getTopcis(videoId);
        topics.initialize(videoId);
    }
}
