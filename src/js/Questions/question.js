import '@webcomponents/custom-elements';
import fetchQuestions from "./mockQuestions2";
import questionPlaceholder from "./questionPlaceholder";
import { secondsToHours } from "../lib/util";
import questionIcon from "../../icons/question.svg";
import plusIcon from "../../icons/plus.svg";
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
            LOG("time-update event", currentTime);
            if(this.visible) return;
            
            for (let question of this._questions) {
                const [start, end] = question['time'];
                if(
                    !question.shown &&
                    currentTime >= start && 
                    currentTime <= end
                )
                {
                    LOG("Setting question", question);
                    this.setCurrentQuestion(question);
                    this.showCurrentQuestion();
                    break;
                }
            }
        });

        this._EE.on("marker-click", value => {
            let question = this._questions.filter(q => q['id'] === value)[0];
            if(question) {
                this.setCurrentQuestion(question);
                this.showCurrentQuestion();
            }
        });
    }

    get template() {
        return html`
            <div class="questions-container">
                <q-popup @close=${() => this.closeAndPlay()}></q-popup>
            </div>
        `;
    }

    setupControls(container, video) {
        this._video = video;
        this._container = container;
        let div = document.createElement('div');
        div.setAttribute('id', 'vken-controls');
        this._container.append(div);

        render(this.template, div);
        this._el = container.querySelector('.questions-container');
        this._popup = this._el.querySelector('q-popup');
    }

    closeAndPlay() {
        this.visible = false;
        this._video.play();
    }

    setCurrentQuestion(question) {
        const { text, options, type, correct } = question;
        this._popup.setQuestion(type, text, options, correct);
        this._currentQuestion = question;
    }

    showCurrentQuestion() {
        this._video.pause();
        this.visible = true;
        this._currentQuestion.shown = true;
    }

    get visible() {
        return this._el.classList.contains('visible');
    }

    set visible(value) {
        this._popup.visible = value;
        this._el.classList.toggle('visible', value);
    }

    get editable() {
        return this._el.classList.contains('editable');
    }

    set editable(value) {
        this._el.classList.toggle('editable', value);
    }
    
    setupTimelineMarkers() {
        let timeline = this._container.querySelector('.vjs-progress-control');
        if(timeline) {
            const duration = parseInt(this._video.duration);
    
            for (let question of this._questions) {
                const [start, end] = question['time'];
                const percentage = ((start / duration) * 100).toFixed(2);
    
                if(percentage > 98) continue;
    
                const marker = document.createElement('div');
                marker.setAttribute('class', 'question-marker');
                marker.setAttribute('data-qid', question['id']);
                marker.setAttribute('data-tip', `Question at ${secondsToHours(start)}`);
                marker.style.left = `calc(${percentage}% - 8px)`;
                marker.innerHTML = questionIcon;
    
                marker.addEventListener('click', event => {
                    this._EE.emit("marker-click", question['id']);
                });
    
                timeline.appendChild(marker);
            }
        }
    }

    async enableEdit(controlBar) {
        let addQuestionDiv = document.createElement('div');
        addQuestionDiv.setAttribute('class', 'vjs-control vjs-button vken-add-question');
        addQuestionDiv.innerHTML = plusIcon;

        let playbackRateButton = controlBar.querySelector(".vjs-playback-rate");
        playbackRateButton.insertAdjacentElement('beforebegin', addQuestionDiv);

        addQuestionDiv.addEventListener('click', event => {
            LOG("Add icon clicked");
            const { text, options, type } = questionPlaceholder;
            this._popup.setQuestion(type, text, options, 0);
            this._video.pause();
            this.visible = true;
        });
        LOG("Adding edit icon: Done");
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
}