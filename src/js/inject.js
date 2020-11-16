import EventEmitter from 'eventemitter3';
import md5 from 'fast-md5';
import { sleep, debounce, getQueryParam, LOG } from "./lib/util";
import { waitForElementInsertion, waitForElement } from "./lib/domUtil";
import Question from './Questions/question';
import Topics from "./Topics/topics";

window.addEventListener("load", async () => {
  LOG("Document load fired");

  try {
    await initialize();
  }
  catch(err) {
    console.error("AKTANA:", err);
  }
});

async function initialize() {
  const EE = new EventEmitter();
  const questions = new Question(EE);
  const topics = new Topics(EE);


  let video = document.querySelector('video');
  if(video) {
    LOG("Video found on first load");
    await setupControls(video);
  }

  EE.on("seek-video", time => {
    if(video) {
      video.currentTime = time;
      video.play();
    }
  });

  async function tearDown() {
    LOG("Tearing down controls");
  }
  
  async function setupControls(video) {
    let container = video.parentElement;
    let videoId = location.pathname.split('/').pop();
    LOG("videoId is", videoId);
  
    let controlBar = container.querySelector('.vjs-control-bar');
    if(controlBar === null) {
        LOG("Waiting for controlbar");
        controlBar = await waitForElement(container, '.vjs-control-bar');
    }
  
    // Fire a time update event every second
    let prevTime = 0;
    let interval = setInterval(() => {
      if(document.body.contains(container)) {
        let currentTime = parseInt(video.currentTime);
        if(prevTime !== currentTime) {
          EE.emit("time-update", currentTime);
          prevTime = currentTime;
        }
      } else {
        clearInterval(interval);
        tearDown();
      }
    }, 1000);
  
    questions.setupControls(container, video);
    await questions.getQuestionsForVideo(videoId);
    questions.enableEdit(controlBar);
  
    topics.setupControls(container, controlBar);
    await topics.getTopcis(videoId);
  }

  while(true) {
    LOG("Waiting for video insertion");
    video = await waitForElementInsertion(document, 'video');
    LOG("Setting up controls");
    await setupControls(video);
  }
}

