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
            this.addEventListener("option-change", (event) => {
                if (this.type === "single") {
                    for (let option of this.qOptions) {
                        option.selected = false;
                    }
                    event.target.selected = true;
                    this._selectedIdx = [parseInt(event.target.index)];
                } else {
                    event.target.selected = !event.target.selected;
                    this._selectedIdx = [];
                    for (let option of this.querySelectorAll("q-option[selected]")) {
                        this._selectedIdx.push(parseInt(option.index));
                    }
                }
            });

            let el = template`
                <div ref="editPopup" class="option-edit-popup">
                    <div ref="addButton" class="add-option popup-button"></div>
                    <div ref="deleteButton" class="delete-option popup-button"></div>
                </div>
            `;

            let { editPopup, addButton, deleteButton } = el.refs();
            this.append(el);
            this._editPopup = editPopup;

            this.addEventListener("option-edit", event => {
                let show = !event.target.editing
                this.resetEdit();

                if(show) {
                    event.target.editing = true;
                    this.showEditPopup(this.qOptions.indexOf(event.target) , event.target.offsetTop);
                } else {
                    this.hideEditPopup();
                }
            });

            this.addEventListener('click', event => {
                LOG("Clicked outside");
                this.resetEdit();
                this.hideEditPopup();
            });

            addButton.addEventListener('click', event => {
                let index = parseInt(this._editPopup.getAttribute('index'));
                let qOption = this.createOption('Option text');
                let current = this.qOptions[index];
                current.insertAdjacentElement('afterend', qOption);
            });

            deleteButton.addEventListener('click', event => {
                let index = parseInt(this._editPopup.getAttribute('index'));
                this.removeChild(this.qOptions[index]);
            });
        }

        resetEdit() {
            for( let qOption of this.qOptions) {
                qOption.editing = false;
            }
        }

        set type(value) {
            this.setAttribute("type", value);
        }

        get type() {
            return this.getAttribute("type");
        }

        get selected() {
            return this._selectedIdx;
        }

        set selected(values) {
            for( let idx of values) {
                if(idx < this.qOptions.length) {
                    this.qOptions[idx].selected = true;
                }
            }
            this._selectedIdx = values;
        }

        get options() {
            // return this._options;
            return this.qOptions.map((option) => option.text);
        }

        get qOptions() {
            return Array.from(this.querySelectorAll("q-option"));
        }

        get editable() {
            return this.hasAttribute("editable");
        }

        set editable(value) {
            return this.toggleAttribute("editable", !!value);
        }

        set options(values) {
            this.destroyOptions();

            let options = values.map((optionText, idx) => {
                const qOption = this.createOption(optionText);
                qOption.index = idx;
                return qOption;
            }) ;

            this.append(...options);
        }

        createOption(optionText) {
            const qOption = document.createElement("q-option");
            qOption.status = "active";
            qOption.type = this.type;
            qOption.text = optionText;
            qOption.editable = this.editable;
            return qOption;
        }

        destroyOptions() {
            for( let qOption of this.qOptions) {
                this.removeChild(qOption);
            }
        }

        revealAnswers(correctOptions, selectedOptions) {
            let correct = true;

            for (let i = 0; i < this.qOptions.length; i++) {
                let qOption = this.qOptions[i];
                qOption.selected = false;
                if (correctOptions.includes(i)) {
                    qOption.status = "correct";
                } else if (selectedOptions.includes(i)) {
                    qOption.status = "wrong";
                    correct = false;
                } else {
                    qOption.disable();
                }
            }

            return correct;
        }

        showEditPopup(index, offset) {
            this._editPopup.style.top = offset + "px";
            this._editPopup.setAttribute('index', index);
            this._editPopup.classList.add('visible');
        }

        hideEditPopup() {
            this._editPopup.classList.remove('visible');
        }
    }
);
