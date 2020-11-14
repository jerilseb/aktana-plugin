import "./Options";
import EditorJS from '@editorjs/editorjs';
import { LOG } from "../lib/util";
import { html, render } from "lit-html";
import "./popup.scss";

customElements.define('q-popup', class extends HTMLElement {

    get template() {
        return html`
            <div class="title">Question</div>
            <div id="q-text"></div>
            <q-options @option-change=${() => this.optionChanged()}></q-options>
            
            <div class="submit-button" @click=${() => this.submit()}>SUBMIT</div>
            <div class="resume-button" @click=${() => this.closePopup()}>
                <svg viewBox="0 0 72 72" width="22" height="22">
                    <path fill="none" d="M-1-1h74v74H-1z"/>
                    <path d="M19.76 11.4l-.1 46.87c11.91-8.54 23.98-15.58 35.9-24.12l-35.8-22.76z" fill-opacity="null" stroke-width="1.5" stroke="#fff" fill="#fff"/>
                </svg>
            </div>
            <div class="close-button" @click=${() => this.closePopup()}>
                <svg viewBox="0 0 80 80" width="15" height="15">
                    <rect transform="rotate(45 41.25 40.833)" rx="2" height="10" width="60.75" y="35.833" x="10.875" fill="#999999"/>
                    <rect transform="rotate(135 41.5 41.083)" rx="2" height="10" width="60.75" y="36.083" x="11.125" fill="#929292"/>
                </svg>
            </div>
        `;
    }

    connectedCallback() {
        render(this.template, this);

        this._editor = null;
        this._options = this.querySelector('q-options');
        this._questionText = this.querySelector('#q-text');
    }

    optionChanged() {
        if(this._options.selected.length > 0) {
            this.status = "can-submit";
        } else {
            this.status = "";
        }
    }

    closePopup() {
        // this._editor.destroy();

        this.dispatchEvent(new CustomEvent('close', {
            bubbles: true,
            composed: true
        }));
    }

    submit() {
        if(this.status === "can-submit") {
            this.status = "submitted";
            this._options.revealAnswers(this._correctOptions);
        }        
    }

    setQuestion(questionType, questionText, options, correctOptions) {
        LOG("Setting question text", questionText);
        this._options.type = questionType;
        this._options.options = options;
        this._correctOptions = correctOptions;
        this.status = "";

        this._editor = new EditorJS({
            holder: 'q-text',
            data: questionText,
            readOnly: false
        });
    }

    get status() {
        return this.getAttribute('status');
    }

    set status(value) {
        this.setAttribute('status', value);
    }

    get visible() {
        return this.classList.contains('visible');
    }

    set visible(value) {
        this.classList.toggle('visible', value);
        if(!value) {
            this._questionText.innerHTML = '';
        }
    }

});
