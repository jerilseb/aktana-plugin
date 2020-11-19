import fetchTopics from "./mockData";
import Popup from "./popup";
import { LOG } from "../lib/util";
import "./topics.scss";

export default class Topics {
    constructor(EE) {
        this._EE = EE;
    }

    setupControls(container, controlBar) {
        this._container = container;
        this._controlBar = controlBar;
    }

    async getTopcis(videoId) {
        this._topics = await fetchTopics(videoId);

        if (this._topics) {
            let addQuestionDiv = document.createElement("div");
            addQuestionDiv.setAttribute("class", "vjs-control vjs-button vken-topics-button");

            let playbackRateButton = this._controlBar.querySelector(".vjs-playback-rate");
            playbackRateButton.insertAdjacentElement("beforebegin", addQuestionDiv);

            addQuestionDiv.addEventListener("click", (event) => {
                LOG("Topics Button clicked");
                this._popup.show();
            });
            LOG("Adding topics button: Done");

            this._popup = new Popup(this._EE, this._container);
            this._popup.setTopics(this._topics);
        }
    }
}
