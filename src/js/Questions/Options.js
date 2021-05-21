import { LOG } from "../lib/util";
import "./Option";
import { template } from "../lib/domUtil";

customElements.define(
    "q-options",
    class extends HTMLElement {
        constructor() {
            super();
            this._selectedIdx = [];
        }

        connectedCallback() {
            this.addEventListener("option-click", event => {
                if (this.type === "single") {
                    for (let element of this.optionElements) {
                        element.selected = false;
                    }
                    event.target.selected = true;
                    this._selectedIdx = [event.target.index];
                } else {
                    event.target.selected = !event.target.selected;
                    this._selectedIdx = [];
                    for (let element of this.selectedOptionElements) {
                        this._selectedIdx.push(element.index);
                    }
                }

                this.dispatchEvent(
                    new CustomEvent("option-change", {
                        bubbles: true,
                        composed: true,
                    })
                );
            });

            let el = template`
                <div ref="editPopup" class="option-edit-click-popup">
                    <div ref="addButton" class="add-option popup-button"></div>
                    <div ref="deleteButton" class="delete-option popup-button"></div>
                    <div ref="switchButton" class="switch-option popup-button"></div>
                </div>
            `;

            let { editPopup, addButton, deleteButton, switchButton } = el.refs();
            this.append(el);
            this._editPopup = editPopup;

            this.addEventListener("option-edit-click", event => {
                const isDismiss = event.target.editing;
                this.resetEdit();

                if (!isDismiss) {
                    LOG("show edit for", event.target.editing);

                    event.target.editing = true;
                    this.showEditPopup(this.optionElements.indexOf(event.target), event.target.offsetTop);
                }
            });

            this.addEventListener("click", _ => {
                LOG("Clicked outside");
                this.resetEdit();
            });

            addButton.addEventListener("click", _ => {
                let index = parseInt(this._editPopup.getAttribute("index"));
                let element = this.createOption("");
                let current = this.optionElements[index];
                current.insertAdjacentElement("afterend", element);
            });

            deleteButton.addEventListener("click", _ => {
                let index = parseInt(this._editPopup.getAttribute("index"));
                this.removeChild(this.optionElements[index]);
            });

            switchButton.addEventListener("click", _ => {
                if (this.type === "single") this.type = "multi";
                else this.type = "single";
            });
        }

        resetEdit() {
            for (let option of this.optionElements) {
                option.editing = false;
            }
            this.hideEditPopup();
        }

        set type(value) {
            this.setAttribute("type", value);
            for (let option of this.optionElements) {
                option.type = value;
            }
            this.selected = [];
        }

        get type() {
            return this.getAttribute("type");
        }

        get selected() {
            return this._selectedIdx;
        }

        set selected(values) {
            for (let i = 0; i < this.optionElements.length; i++) {
                let element = this.optionElements[i];
                if (values.includes(i)) {
                    element.selected = true;
                } else {
                    element.selected = false;
                }
            }

            this._selectedIdx = values;
            this.dispatchEvent(
                new CustomEvent("option-change", {
                    bubbles: true,
                    composed: true,
                })
            );
        }

        get optionElements() {
            return Array.from(this.querySelectorAll("q-option"));
        }

        get selectedOptionElements() {
            return Array.from(this.querySelectorAll("q-option[selected]"));
        }

        get editable() {
            return this.hasAttribute("editable");
        }

        set editable(value) {
            return this.toggleAttribute("editable", !!value);
        }

        get options() {
            return this.optionElements.map(option => option.text);
        }

        set options(values) {
            this.destroyOptions();

            let optionElements = values.map((optionText, idx) => {
                const element = this.createOption(optionText);
                element.index = idx;
                return element;
            });

            this.append(...optionElements);
        }

        createOption(optionText) {
            const element = document.createElement("q-option");
            element.status = "active";
            element.type = this.type;
            element.text = optionText;
            element.editable = this.editable;
            return element;
        }

        destroyOptions() {
            for (let element of this.optionElements) {
                this.removeChild(element);
            }
        }

        revealAnswers(correctOptions, selectedOptions) {
            let correct = true;

            for (let i = 0; i < this.optionElements.length; i++) {
                let element = this.optionElements[i];
                element.selected = false;

                if (correctOptions.includes(i)) {
                    element.status = "correct";
                } else if (selectedOptions.includes(i)) {
                    element.status = "wrong";
                    correct = false;
                } else {
                    element.disable();
                }
            }

            return correct;
        }

        showEditPopup(index, offset) {
            this._editPopup.style.top = offset + "px";
            this._editPopup.setAttribute("index", index);
            this._editPopup.classList.add("visible");
        }

        hideEditPopup() {
            this._editPopup.classList.remove("visible");
        }
    }
);
