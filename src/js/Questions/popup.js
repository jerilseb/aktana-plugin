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
                <div class="title">Question</div>
                <div id="q-text"></div>
                <q-options ?editable=${this.editable}></q-options>

                <div class="submit-button" @click=${() => this.submit()}>SUBMIT</div>
                <div class="save-button" @click=${() => this.saveQuestion()}>SAVE</div>
                <div class="resume-button" @click=${() => this.closePopup()}></div>
                <div class="close-button" @click=${() => this.closePopup()}></div>
            `;
        }

        connectedCallback() {
            render(this.template, this);

            this._editor = null;
            this._optionsEl = this.querySelector("q-options");
            this._questionText = this.querySelector("#q-text");

            this.addEventListener("option-change", (event) => {
                if (this._optionsEl.selected.length > 0) {
                    this.status = "can-submit";
                } else {
                    this.status = "";
                }
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

        submit() {
            if (this.status === "can-submit") {
                this.status = "submitted";
                this._optionsEl.revealAnswers(this._correctOptions);
            }
        }

        set question(question) {
            const { id, text, options, type, correct } = question;

            this._optionsEl.type = type;
            this._optionsEl.options = options;
            this._correctOptions = correct;
            this.qID = id;
            this.status = "";

            try {
                this._editor = new EditorJS({
                    holder: "q-text",
                    data: text,
                    readOnly: !this.editable,
                });
            } catch (err) {
                console.error("AKTANA:", err);
            }
        }

        async editedQuestion() {
            return {
                id: this.qID,
                text: await this._editor.save(),
                options: this._optionsEl.options,
                correct: this._optionsEl.selected,
            };
        }

        get qID() {
            return parseInt(this.getAttribute("qid"));
        }

        set qID(value) {
            this.setAttribute("qid", value);
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
