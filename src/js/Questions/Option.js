import "./option.scss";
import { template } from "../lib/domUtil";

customElements.define(
    "q-option",
    class extends HTMLElement {
        set text(value) {
            let el = template`
                <div ref="editButton" class="edit-button"></div>
                <div ref="checkBox" class="checkbox"></div>
                <div ref="optionText" class="option-text"></div>            
            `;

            let { checkBox, editButton, optionText } = el.refs();
            this.appendChild(el);

            this._text = optionText;
            this._text.textContent = value;
            
            checkBox.addEventListener("click", (_) => {
                if (this.status === "active") {
                    this.dispatchEvent(
                        new CustomEvent("option-change", {
                            bubbles: true,
                            composed: true,
                        })
                    );
                }
            });
        }

        get text() {
            return this._text.textContent;
        }

        get status() {
            return this.getAttribute("status");
        }

        set status(value) {
            return this.setAttribute("status", value);
        }

        get selected() {
            return this.hasAttribute("selected");
        }

        set selected(value) {
            this.toggleAttribute("selected", !!value);
        }

        get editable() {
            return this.hasAttribute("editable");
        }

        set editable(value) {
            this.toggleAttribute("editable", !!value);
            this._text.toggleAttribute("contenteditable", !!value);
        }

        set type(value) {
            this.setAttribute("type", value);
        }

        get type() {
            return this.getAttribute("type");
        }

        set index(value) {
            this.setAttribute("index", value);
        }

        get index() {
            return this.getAttribute("index");
        }

        disable() {
            this.removeAttribute("status");
        }

        markCorrect() {
            this.status = "correct";
        }

        markWrong() {
            this.status = "wrong";
        }
    }
);
