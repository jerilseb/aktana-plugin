import "@webcomponents/custom-elements";
import { html, render } from "lit-html";
// import { fetchQuestions, createQuestion, updateQuestion, deleteQuestion, submitQuestion } from "./mockAPI";
import { fetchQuestions, createQuestion, updateQuestion, deleteQuestion, submitQuestion } from "./API";
import questionPlaceholder from "./questionPlaceholder";
import { secondsToHours, sleep } from "../lib/util";
import { LOG, getAuthToken, calculateVideoId } from "../lib/util";
import { template } from "../lib/domUtil";
import "./popup";
import "./question.scss";

export default class Question {
    constructor(EE, video, controlBar) {
        this._video = video;
        this._videoId = null;
        this._container = video.parentElement;
        this._controlBar = controlBar;
        this._questions = [];
        this._editable = false;
        this._currentQuestion = null;
        this._EE = EE;

        this._EE.on("time-update", currentTime => {
            if (this.editable || this.visible) return;

            for (let question of this._questions) {
                const start = question.time;
                if (!question.shown && currentTime >= start && currentTime <= start + 5) {
                    this.currentQuestion = question;
                    this.visible = true;

                    LOG("Question shown on time_update:", question.id);
                    const calculatedVideoId = calculateVideoId(this._video.duration);
                    if (question.videoId !== calculatedVideoId) {
                        LOG(
                            `CALCULATED_ID_MISMATCH: q_id: ${question.id}, time: ${currentTime}, init_video_id: ${this._videoId}, q_video_id: ${question.videoId}, calc_video_id: ${calculatedVideoId}`
                        );
                    }
                    if (question.videoId !== this._videoId) {
                        LOG(
                            `VIDEO_ID_MISMATCH: q_id: ${question.id}, time: ${currentTime}, init_video_id: ${this._videoId}, q_video_id: ${question.videoId}, calc_video_id: ${calculatedVideoId}`
                        );
                    }
                    break;
                }
            }
        });

        this._EE.on("marker-click", questionId => {
            let question = this._questions.filter(q => q.id === questionId)[0];
            if (question) {
                this.currentQuestion = question;
                this.visible = true;

                LOG("Question shown on marker_click:", question.id);
                const calculatedVideoId = calculateVideoId(this._video.duration);
                if (question.videoId !== calculatedVideoId) {
                    LOG(
                        `CALCULATED_ID_MISMATCH: q_id: ${question.id}, init_video_id: ${this._videoId}, q_video_id: ${question.videoId}, calc_video_id: ${calculatedVideoId}`
                    );
                }
                if (question.videoId !== this._videoId) {
                    LOG(
                        `VIDEO_ID_MISMATCH: q_id: ${question.id}, init_video_id: ${this._videoId}, q_video_id: ${question.videoId}, calc_video_id: ${calculatedVideoId}`
                    );
                }
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
                    @submit=${event => this.submitAnswer(event)}
                ></q-popup>
            </div>
        `;
    }

    render() {
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
        LOG("Dismissed question: qId", this._currentQuestion.id);
    }

    set currentQuestion(question) {
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
        if (value && this._currentQuestion) {
            this._video.pause();
            this._popupEl.visible = true;
            this._el.classList.toggle("visible", true);
            this._currentQuestion.shown = true;
        } else {
            this._popupEl.visible = false;
            this._el.classList.toggle("visible", false);
        }
    }

    enableAdminMode() {
        this._editable = true;

        let addQuestionButton = document.createElement("div");
        addQuestionButton.setAttribute("class", "vjs-control vjs-button vken-add-question-button");
        let playbackRateButton = this._controlBar.querySelector(".vjs-playback-rate");
        playbackRateButton.insertAdjacentElement("beforebegin", addQuestionButton);

        addQuestionButton.addEventListener("click", _ => {
            let question = JSON.parse(JSON.stringify(questionPlaceholder));
            question.time = parseInt(this._video.currentTime);
            this.currentQuestion = question;
            this.visible = true;
        });

        let analyticsButton = document.createElement("div");
        analyticsButton.setAttribute("class", "vjs-control vjs-button vken-analytics-button");
        addQuestionButton.insertAdjacentElement("beforebegin", analyticsButton);

        analyticsButton.addEventListener("click", async _ => {
            let auth_token = await getAuthToken();
            window.open(`https://dashboard.videoken.com/quiz-analytics/${this._videoId}?token=${auth_token}`, "_blank");
        });

        this.render();
    }

    submitAnswer(event) {
        this._currentQuestion.attempted = true;
        this._currentQuestion.selected = this._popupEl._optionsEl.selected;

        let { id, quizId } = this.currentQuestion;
        let { selected } = event.detail;

        submitQuestion(selected, this._videoId, quizId, id);
        LOG("Attempted question, qId:", id);
    }

    async saveQuestion() {
        let { text, options, correct, correct_text, time, type } = this._popupEl.editedQuestion();
        let { id, quizId } = this._currentQuestion;
        this._popupEl.status = "saving";

        try {
            if (id === -1) {
                let question = await createQuestion(
                    { text, options, correct, correct_text, time, type },
                    this._videoId,
                    this._videoTitle
                );
                this._questions.push(question);
                this.insertMarker(question, true);
            } else {
                let question = await updateQuestion(
                    { text, options, correct, correct_text, time, type },
                    id,
                    quizId,
                    this._videoId
                );
                let index = this._questions.indexOf(this.currentQuestion);
                if (index > -1) {
                    this._questions.splice(index, 1);
                }
                this._questions.push(question);
                this.updateMarkerPosition(question);
            }

            this._popupEl.status = "saved";
            await sleep(1000);
            this.visible = false;
        } catch (err) {
            this._popupEl.status = "save-error";
            await sleep(1500);
            this.visible = false;
        }
    }

    async deleteQuestion() {
        this._popupEl.status = "saving";
        let { id, quizId } = this.currentQuestion;

        await deleteQuestion(quizId, this._videoId);
        let index = this._questions.indexOf(this.currentQuestion);
        if (index > -1) {
            this._questions.splice(index, 1);
        }

        this.removeMarker(id);
        this._popupEl.status = "deleted";
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
            style="left: calc(${percentage}% - 9px)"
        >
            <div class="question-icon"></div>
        </div>
        `;

        const { marker } = el.refs();
        this._timeline.append(el);

        marker.addEventListener("click", _ => {
            LOG("Clicked on Marker - qId:", qId);
            this._EE.emit("marker-click", qId);
        });
    }

    updateMarkerPosition(question) {
        let marker = this._timeline.querySelector(`[data-qid="${question.id}"]`);
        if (marker) {
            const start = parseInt(question.time);
            const duration = parseInt(this._video.duration);
            const percentage = ((start / duration) * 100).toFixed(2);
            marker.setAttribute("data-tip", `Question at ${secondsToHours(start)}`);
            marker.style.left = `calc(${percentage}% - 9px)`;
            LOG("Moved marker to", start);
        }
    }

    removeMarker(questionId) {
        let marker = this._timeline.querySelector(`[data-qid="${questionId}"]`);
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
        LOG("Setup timeline Markers");
    }

    async initialize(videoId, videoTitle) {
        this._videoId = videoId;
        this._videoTitle = videoTitle;

        this._timeline = this._container.querySelector(".vjs-progress-holder");
        if (!this._timeline) {
            this._timeline = this._container.querySelector(".vjs-progress-control");
        }

        this.render();
        this._el = this._container.querySelector(".questions-container");
        this._popupEl = this._el.querySelector("q-popup");

        this.visible = false;
        this._questions = await fetchQuestions(videoId);
        LOG(this._questions.length, "Questions fetched");

        if (this._questions.length > 0) {
            this.setupTimelineMarkers();
        }
    }
}
