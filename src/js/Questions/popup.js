import "./Options";
import { LOG, sleep, secondsToHoursFull, hmsToSeconds, secondsToHours } from "../lib/util";
import { html, render } from "lit-html";
import "./popup.scss";

customElements.define(
    "q-popup",
    class extends HTMLElement {
        get template() {
            return html`
                <div class="status-overlay"></div>
                <div class="title" data-value="Question at ${secondsToHours(this.qTime)}"  @click=${() => this.editTime()}></div>
                <div class="q-text" ?contenteditable=${this.editable} placeholder="Type the question here.."></div>
                <q-options ?editable=${this.editable}></q-options>

                <div class="submit-button" @click=${() => this.submit()}>SUBMIT</div>
                <div class="save-button" @click=${() => this.saveQuestion()}></div>
                <div class="delete-button" @click=${() => this.confirmDeletion()}></div>
                <div class="resume-button" @click=${() => this.closePopup()}></div>
                <div class="close-button" @click=${() => this.closePopup()}></div>
                <div class="delete-confirm-overlay">
                    <div class="message">Are you sure you want to delete this question?</div>
                    <div class="row">
                        <div class="yes btn" @click=${() => this.deleteQuestion()}>Yes</div>
                        <div class="no btn" @click=${() => (this.status = "editing")}>No</div>
                    </div>
                </div>
                <div class="edit-time-overlay">
                    <input class="time-input" type="text" placeholder="hh:mm:ss"  pattern="[0-9][0-9]:[0-5][0-9]:[0-5][0-9]" />
                    <div class="update-btn btn" @click=${() => this.updateTime()}></div>
                </div>
            `;
        }

        connectedCallback() {
            render(this.template, this);

            this._editor = null;
            this._optionsEl = this.querySelector("q-options");
            this._questionText = this.querySelector(".q-text");
            this._timeInput = this.querySelector('input.time-input');

            this.addEventListener("option-change", (event) => {
                this.selectionActive = this._optionsEl.selected.length > 0;
            });
        }

        static get observedAttributes() {
            return ["editable", "status"];
        }

        attributeChangedCallback(name) {
            LOG("Attribute changed", name);
            render(this.template, this);
        }

        closePopup() {
            this.dispatchEvent(
                new CustomEvent("close", {
                    bubbles: false,
                    composed: true,
                })
            );
        }

        saveQuestion() {
            if (!this.editable || !this.selectionActive) return;

            this.dispatchEvent(
                new CustomEvent("save", {
                    bubbles: false,
                    composed: true,
                })
            );
        }

        confirmDeletion() {
            this.status = "confirm-delete";
        }

        editTime() {
            let time = secondsToHoursFull(this.qTime);
            this._timeInput.value = time;
            this.status = "edit-time";
        }

        updateTime() {
            let time = hmsToSeconds(this._timeInput.value);
            this.qTime = time;
            this.status = "editing";
        }

        // reset() {
        //     this.status = "";
        // }

        deleteQuestion() {
            if (!this.editable) return;

            this.dispatchEvent(
                new CustomEvent("delete", {
                    bubbles: false,
                    composed: true,
                })
            );
        }

        async submit() {
            if (this.selectionActive) {

                // Revealing answers will reset selected. So dispatch first
                this.dispatchEvent(
                    new CustomEvent("submit", {
                        bubbles: false,
                        composed: true,
                        detail: {
                            selected: this._optionsEl.selected,
                        },
                    })
                );

                let isCorrect = this._optionsEl.revealAnswers(this._correctOptions, this._optionsEl.selected);
                this.status = isCorrect ? "correct-answer" : "wrong-answer";
                await sleep(1000);

                this.status = "attempted";
            }
        }

        set question(question) {
            const { id, text, options, type, correct, time, attempted, selected } = question;

            this._optionsEl.type = type;
            this._optionsEl.options = options;
            this._correctOptions = correct;
            this.questionID = id;
            this.qTime = time;
            this._questionText.innerHTML = text;
            this.selectionActive = false;

            if (this.editable) {
                this.status = "editing";
                if (correct) {
                    this._optionsEl.selected = correct;
                    // this.selectionActive = true;
                }
            } else if (attempted) {
                this.status = "attempted";
                this._optionsEl.revealAnswers(this._correctOptions, selected);
            } else {
                this.status = "attempting";
            }
        }

        editedQuestion() {
            return {
                id: this.questionID,
                time: this.qTime,
                text: this._questionText.innerHTML,
                options: this._optionsEl.options,
                correct: this._optionsEl.selected,
                correct_text: this._optionsEl.selectedOptionsText,
                type: this._optionsEl.type
            };
        }

        get questionID() {
            return parseInt(this.getAttribute("qid"));
        }

        set questionID(value) {
            this.setAttribute("qid", value);
            this.toggleAttribute("new", value === -1);
        }

        get qTime() {
            return parseInt(this.getAttribute("qtime"));
        }

        set qTime(value) {
            this.setAttribute("qtime", value);
        }

        get status() {
            return this.getAttribute("status");
        }

        set status(value) {
            this.setAttribute("status", value);
        }

        get editable() {
            return this.hasAttribute("editable");
        }

        set editable(value) {
            return this.toggleAttribute("editable", !!value);
        }

        get selectionActive() {
            return this.hasAttribute("selection-active");
        }

        set selectionActive(value) {
            return this.toggleAttribute("selection-active", !!value);
        }

        get visible() {
            return this.classList.contains("visible");
        }

        set visible(value) {
            this.classList.toggle("visible", !!value);
            if (!value) {
                this._questionText.innerHTML = "";
            }
        }
    }
);
