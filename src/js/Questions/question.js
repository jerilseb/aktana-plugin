import '@webcomponents/custom-elements';
import fetchQuestions from "./mockQuestions2";
import questionPlaceholder from "./questionPlaceholder";
import { secondsToHours } from "../lib/util";
// import { fetchQuestions } from "./fetch";
import { LOG } from "../lib/util";
import { html, render } from "lit-html";
import "./popup";
import "./question.scss";

export default class Question {

    constructor(EE) {
        this._questions = [];
        this._currentQuestion = null;
        this._EE = EE;

        this._EE.on("time-update", currentTime => {
            if(this.editable || this.visible) return;
            
            for (let question of this._questions) {
                const [start, end] = question['time'];
                if(!question.shown && currentTime >= start && currentTime <= end) {
                    this.currentQuestion = question;
                    this.show();
                    break;
                }
            }
        });

        this._EE.on("marker-click", (qId, position) => {
            let question = this._questions.filter(q => q['id'] === qId)[0];
            if(question) {
                if(!this.editable) {
                     this.showEditMenu(qId, position);
                } else {
                    this.currentQuestion = question;
                    this.show();
                }
            }
        });
    }

    get template() {
        return html`
            <div class="questions-container">
                <q-popup ?editable=${this.editable} 
                    @close=${() => this.closeAndPlay()}
                    @save=${() => this.saveQuestion()}
                ></q-popup>
            </div>
        `;
    }

    setupControls(container, controlBar, video) {
        this._video = video;
        this._container = container;
        this._controlBar = controlBar;
        this._timeline = this._container.querySelector('.vjs-progress-control');


        this.render();
        this._el = container.querySelector('.questions-container');
        this._popupEl = this._el.querySelector('q-popup');
    }

    render() {
        LOG("Rendering popup");
        let div = this._container.querySelector("#vken-controls");
        if(!div) {
            div = document.createElement('div');
            div.setAttribute('id', 'vken-controls');
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

    show() {
        this._video.pause();
        this.visible = true;
        this._currentQuestion.shown = true;
    }

    get visible() {
        return this._el.classList.contains('visible');
    }

    set visible(value) {
        this._popupEl.visible = !!value;
        this._el.classList.toggle('visible', !!value);
    }

    get editable() {
        return this._editable;
    }

    set editable(value) {
        this._editable = !!value;

        let addQuestionDiv = document.createElement('div');
        addQuestionDiv.setAttribute('class', 'vjs-control vjs-button vken-add-question-icon');
        let playbackRateButton = this._controlBar.querySelector(".vjs-playback-rate");
        playbackRateButton.insertAdjacentElement('beforebegin', addQuestionDiv);

        addQuestionDiv.addEventListener('click', event => {
            LOG("Add icon clicked");
            this.currentQuestion = questionPlaceholder;
            this._video.pause();
            this.visible = true;
        });

        this.render();
        LOG("Adding edit icon: Done");
    }

    async saveQuestion() {
        this.visible = false;
        let { id, text, options, correct } = await this._popupEl.editedQuestion();
        
        if(id === -1) {
            let time = this._video.currentTime;
            LOG("This is a new question");
        }

        let question = { text, options, correct, type: "single", time: [time, time + 5]};

        LOG(text, options, correct);
    }

    insertMarker(question, animate = false) {
        const [start, _] = question['time'];
        const duration = parseInt(this._video.duration);
        const percentage = ((start / duration) * 100).toFixed(2);

        if (percentage > 99) return;

        const template = document.createElement('template');
        template.innerHTML = `
            <div 
                class="vken-question-pin" 
                data-qid=${question["id"]}
                data-tip="Question at ${secondsToHours(start)}"
                style="left: calc(${percentage}% - 8px)"
            >
                <div class="question-icon"></div>
            </div>

        `;

        const marker = template.content;
        marker.addEventListener('click', _ => {
            this._EE.emit("marker-click", question['id'], percentage);
        });
        this._timeline.appendChild(marker);
    }
    
    setupTimelineMarkers() {
        if(!this._timeline) {
            LOG("Timeline not ready, skipping markers");
            return;
        }

        for (let question of this._questions) {
            this.insertMarker(question);
        }

        this._editMenu = document.createElement('div');
        this._editMenu.setAttribute('class', "vken-question-edit-menu");
        this._controlBar.append(this._editMenu);
    }

    async getQuestionsForVideo(videoId) {
        this.visible = false;
        this._questions = await fetchQuestions(videoId);
        LOG("Questions fetched", this._questions);

        if(this._questions.length > 0) {
            LOG("Setting up timeline Markers");
            this.setupTimelineMarkers();
        }
    }

    showEditMenu(qId, position) {
        const menu = document.createElement('div');
        menu.setAttribute('class', "vken-question-edit-menu");
    }
}