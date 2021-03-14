import "@webcomponents/custom-elements";
import { fetchQuestions, postQuestion, updateQuestion, deleteQuestion } from "./mockQuestions";
// import { fetchQuestions, postQuestion } from "./API";
import questionPlaceholder from "./questionPlaceholder";
import { secondsToHours, sleep } from "../lib/util";
import { LOG } from "../lib/util";
import { template } from "../lib/domUtil";
import { html, render } from "lit-html";
import "./popup";
import "./question.scss";

export default class Question {
    constructor(EE, video, controlBar) {
        this._video = video;
        this._videoId = null;
        this._container = video.parentElement;
        this._controlBar = controlBar;
        this._questions = [];
        this._currentQuestion = null;
        this._EE = EE;
        this._editable = false;

        this._EE.on("time-update", (currentTime) => {
            if (this.editable || this.visible) return;

            for (let question of this._questions) {
                const start = question["time"];
                if (!question.shown && currentTime >= start && currentTime <= start + 5) {
                    this.currentQuestion = question;
                    this.visible = true;
                    break;
                }
            }
        });

        this._EE.on("marker-click", (qId) => {
            let question = this._questions.filter((q) => q["id"] === qId)[0];
            if (question) {
                this.currentQuestion = question;
                this.visible = true;
            }
        });
    }

    get template() {
        return html`
            <div class="questions-container">
                <q-popup
                    ?editable=${this._editable}
                    @close=${() => this.closeAndPlay()}
                    @save=${() => this.saveQuestion()}
                    @delete=${() => this.deleteQuestion()}
                    @submit=${() => this.submitAnswer()}
                ></q-popup>
            </div>
        `;
    }

    render() {
        LOG("Rendering popup");
        let div = this._container.querySelector("#vken-controls");
        if (!div) {
            div = document.createElement("div");
            div.setAttribute("id", "vken-controls");
            this._container.append(div);
        }
        render(this.template, div);
    }

    closeAndPlay() {
        this.visible = false;
        this._video.play();
    }

    set currentQuestion(question) {
        LOG("Setting question", question);
        this._currentQuestion = question;
        this._popupEl.question = question;
    }

    get currentQuestion() {
        return this._currentQuestion;
    }

    get visible() {
        return this._el.classList.contains("visible");
    }

    set visible(value) {
        if(value && this._currentQuestion) {
            this._video.pause();
            this._popupEl.visible = true;
            this._el.classList.toggle("visible", true);
            this._currentQuestion.shown = true;
        } else {
            this._popupEl.visible = false;
            this._el.classList.toggle("visible", false);
        }
    }

    get editable() {
        return this._editable;
    }

    set editable(value) {
        this._editable = !!value;

        let addQuestionDiv = document.createElement("div");
        addQuestionDiv.setAttribute("class", "vjs-control vjs-button vken-add-question-icon");
        let playbackRateButton = this._controlBar.querySelector(".vjs-playback-rate");
        playbackRateButton.insertAdjacentElement("beforebegin", addQuestionDiv);

        addQuestionDiv.addEventListener("click", (event) => {
            LOG("Add icon clicked");
            let question = JSON.parse(JSON.stringify(questionPlaceholder));
            question.time = parseInt(this._video.currentTime);
            this.currentQuestion = question;
            this.visible = true;
        });

        this.render();
        LOG("Adding edit icon: Done");
    }

    submitAnswer() {
        this._currentQuestion.attempted = true;
        this._currentQuestion.selected = this._popupEl._optionsEl.selected;
    }

    async saveQuestion() {
        let { id, text, options, correct, time } = this._popupEl.editedQuestion();
        this._popupEl.status = "saving";

        if (id === -1) {
            let question = await postQuestion({ text, options, correct, time}, this._videoId);
            this._questions.push(question);
            this.insertMarker(question, true);
        } else {
            let index = this._questions.indexOf(this.currentQuestion);
            if (index > -1) {
                this._questions.splice(index, 1);
            }
            let question = await updateQuestion({ text, options, correct, time}, id, this._videoId);
            this._questions.push(question);
        }

        this._popupEl.status = "save-success";
        await sleep(1000);
        this.visible = false;
    }

    async deleteQuestion() {
        this._popupEl.status = "saving";
        let qId = this.currentQuestion.id;

        await deleteQuestion(qId, this._videoId);
        let index = this._questions.indexOf(this.currentQuestion);
        if (index > -1) {
            this._questions.splice(index, 1);
        }

        this.removeMarker(qId);

        this._popupEl.status = "save-success";
        await sleep(1000);
        this.visible = false;
    }

    insertMarker(question, animate = false) {
        // const [start, _] = question["time"];
        let qId = question.id;
        const start = parseInt(question.time);
        const duration = parseInt(this._video.duration);
        const percentage = ((start / duration) * 100).toFixed(2);

        if (percentage > 99) return;

        let el = template`
        <div
            ref="marker"
            class="vken-question-pin ${animate && "animated"}"
            data-qid=${qId}
            data-tip="Question at ${secondsToHours(start)}"
            style="left: calc(${percentage}% - 8px)"
        >
            <div class="question-icon"></div>
        </div>
        `;

        const { marker } = el.refs();
        this._timeline.append(el);

        marker.addEventListener("click", (_) => {
            LOG("Clicked on Marker", qId);
            this._EE.emit("marker-click", qId);
        });
    }

    removeMarker(qId) {
        let marker = this._timeline.querySelector(`[data-qid="${qId}"]`);
        this._timeline.removeChild(marker);
    }

    async setupTimelineMarkers() {
        if (!this._timeline) {
            LOG("Timeline not ready, skipping markers");
            return;
        }

        for (let question of this._questions) {
            this.insertMarker(question, false);
        }
    }

    async initialize(videoId) {
        this._videoId = videoId;
        this._timeline = this._container.querySelector(".vjs-progress-control");

        this.render();
        this._el = this._container.querySelector(".questions-container");
        this._popupEl = this._el.querySelector("q-popup");

        this.visible = false;
        this._questions = await fetchQuestions(videoId);
        LOG("Questions fetched", this._questions);

        if (this._questions.length > 0) {
            LOG("Setting up timeline Markers");
            this.setupTimelineMarkers();
        }
    }
}

