import "./Option";

customElements.define('q-options', class extends HTMLElement {

    constructor() {
        super();
        this._options = [];
        this._selectedIdx = [];
    }

    connectedCallback() {
        this.addEventListener('option-change', event => {
            if(this.type === "single") {
                for (let option of this.querySelectorAll('q-option')) {
                    option.selected = false;
                }
                event.target.selected = true;
                this._selectedIdx = [parseInt(event.target.index)];
            } else {
                event.target.selected = !event.target.selected;
                this._selectedIdx = [];
                for (let option of this.querySelectorAll('q-option[selected]')) {
                    this._selectedIdx.push(parseInt(option.index));
                }
            }
        })
    }

    set type(value) {
        this.setAttribute('type', value);
    }

    get type() {
        return this.getAttribute('type');
    }

    get selected() {
        return this._selectedIdx;
    }

    get options() {
        return this._options;
    }

    set options(values) {
        this._options = [];
        this._numOptions = 0;
        this.innerHTML = '';
        for(let optionText of values) {
            this._options.push(optionText);
            const qOption = document.createElement('q-option');
            qOption.status = 'active';
            qOption.type = this.type;
            qOption.index = this._numOptions;
            qOption.innerHTML = optionText;
            this.appendChild(qOption);
            this._numOptions++;
        }
    }

    revealAnswers(correctOptions) {
        let correct = true;
        let qOptions = this.querySelectorAll('q-option');
        
        for (let i=0; i < this._options.length; i++) {
            let qOption = qOptions[i];
            qOption.selected = false;
            if(correctOptions.includes(i)) {
                qOption.status = "correct";
            } else if(this._selectedIdx.includes(i)) {
                qOption.status = "wrong";
                correct = false;
            } else {
                qOption.disable();
            }
        }

        return correct;
    }
});