import "./Options";
import EditorJS from "@editorjs/editorjs";
import { LOG } from "../lib/util";
import { html, render } from "lit-html";
import "./popup.scss";

customElements.define(
    "q-popup",
    class extends HTMLElement {
        get template() {
            return html`
                <div class="status"></div>
                <div class="title">${this.editable ? "Edit Question" : "Question"}</div>
                <div id="q-text" ?contenteditable=${this.editable}></div>
                <q-options ?editable=${this.editable}></q-options>

                <div class="submit-button" @click=${() => this.submit()}>SUBMIT</div>
                <div class="save-button" @click=${() => this.saveQuestion()}>SAVE</div>
                <div class="delete-button" @click=${() => this.confirmDeletion()}></div>
                <div class="resume-button" @click=${() => this.closePopup()}></div>
                <div class="close-button" @click=${() => this.closePopup()}></div>
                <div class="delete-confirm">
                    <div>Are you sure you want to delete this question?</div>
                    <div class="row">
                        <div class="yes btn" @click=${() => this.deleteQuestion()}>Yes</div>
                        <div class="no btn" @click=${() => this.status=""}>No</div>
                    </div>
                </div>
            `;
        }

        connectedCallback() {
            render(this.template, this);

            this._editor = null;
            this._optionsEl = this.querySelector("q-options");
            this._questionText = this.querySelector("#q-text");

            this.addEventListener("option-change", (event) => {
                this.selectionActive = this._optionsEl.selected.length > 0;
            });
        }

        static get observedAttributes() {
            return ["editable"];
        }

        attributeChangedCallback(name) {
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
            if (!this.editable) return;

            this.dispatchEvent(
                new CustomEvent("save", {
                    bubbles: false,
                    composed: true,
                })
            );
        }

        confirmDeletion() {
            this.status="confirm-delete";
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

        submit() {
            if (this.selectionActive) {
                this.status = "submitted";
                this._optionsEl.revealAnswers(this._correctOptions, this._optionsEl.selected);

                this.dispatchEvent(
                    new CustomEvent("submit", {
                        bubbles: false,
                        composed: true,
                    })
                );
            }
        }

        set question(question) {
            // debugger
            const { id, text, options, type, correct, time, attempted, selected } = question;

            this._optionsEl.type = type;
            this._optionsEl.options = options;
            this._correctOptions = correct;
            this.qID = id;
            this.qTime = time;
            this.status = "";

            if(this.editable && correct) {
                this._optionsEl.selected = correct;
                this.selectionActive = true;
            } else {
                this.selectionActive = false;
            }

            this._questionText.innerHTML = text;

            if(attempted) {
                this.status = "submitted";
                this._optionsEl.revealAnswers(this._correctOptions, selected);
            }

            // try {
            //     this._editor = new EditorJS({
            //         holder: "q-text",
            //         data: text,
            //         readOnly: !this.editable,
            //     });


            // } catch (err) {
            //     console.error("AKTANA:", err);
            // }
        }

        editedQuestion() {
            return {
                id: this.qID,
                time: this.qTime,
                text: this._questionText.innerHTML,
                options: this._optionsEl.options,
                correct: this._optionsEl.selected,
            };
        }

        get qID() {
            return parseInt(this.getAttribute("qid"));
        }

        set qID(value) {
            this.setAttribute("qid", value);
            this.toggleAttribute("new", value === -1)
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
