const template = document.createElement("template");
import "./option.scss";

template.innerHTML = `
    <div class="checkbox"></div>
    <div class="option-text"></div>
`;

customElements.define(
    "q-option",
    class extends HTMLElement {
        set text(value) {
            this.appendChild(template.content.cloneNode(true));

            this.checkBox = this.querySelector(".checkbox");
            this.checkBox.addEventListener("click", (event) => {
                if (this.status === "active") {
                    this.dispatchEvent(
                        new CustomEvent("option-change", {
                            bubbles: true,
                            composed: true,
                        })
                    );
                }
            });

            this._text = this.querySelector("div.option-text");
            this._text.textContent = value;
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
