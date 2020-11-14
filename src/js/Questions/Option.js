import greenTick from "../../icons/greenTick.svg";
import blueTick from "../../icons/blueTick.svg";
import crossIcon from "../../icons/cross.svg";
const template = document.createElement('template');

template.innerHTML = `
    <style>
        :host {
            display: flex;
            flex-direction: row;
            margin: .5em .2em .2em .2em;
            font-size: 15px;
        }

        .option-text {
            display: inline-block;
            margin-left: 1em;
        }

        .checkbox {
            box-sizing: border-box;
            border-width: .15em;
            border-color: #999999;
            border-style: solid;
            border-radius: .1em;
            width: 1.2em;
            height: 1.2em;
            display: inline-block;
            flex-shrink: 0;
            background-size: 1.2em;
            background-repeat: round;
        }
        
        :host([type="single"]) .checkbox {
            border-radius: 50%;
        }

        :host([type="single"][selected]) .checkbox {
            border-width: .35em;
        }

        :host([status="active"]) .checkbox {
            cursor: pointer;
        }

        :host([status="active"]) .checkbox:hover {
            border-color: #666666;
            transform: scale(1.05);
        }

        :host([selected]) .checkbox, :host([selected]) .checkbox:hover {
            border-color: #227fd6;
        }

        :host([type="multi"][selected]) .checkbox {
            border: none;
            background-image: url('data:image/svg+xml;base64,${btoa(blueTick)}');
        }

        :host([status="correct"]) div.checkbox {
            border: none;
            background-image: url('data:image/svg+xml;base64,${btoa(greenTick)}');
        }

        :host([status="wrong"]) div.checkbox {
            border: none;
            background-image: url('data:image/svg+xml;base64,${btoa(crossIcon)}');
        }
    </style>

    <div class="checkbox"></div>
    <div class="option-text">
        <slot></slot>
    </div>
`;

customElements.define('q-option', class extends HTMLElement {

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.checkBox = this.shadowRoot.querySelector('.checkbox');
        this.checkBox.addEventListener('click', event => {
            if(this.status === "active") {
                this.dispatchEvent(new CustomEvent('option-change', {
                    bubbles: true,
                    composed: true
                }));
            }
        });
    }

    get status() {
        return this.getAttribute('status');
    }

    set status(value) {
        return this.setAttribute('status', value);
    }

    get selected() {
        return this.hasAttribute('selected');
    }

    set selected(value) {
        this.toggleAttribute('selected', value);
    }

    set type(value) {
        this.setAttribute('type', value);
    }

    get type() {
        return this.getAttribute('type');
    }

    set index(value) {
        this.setAttribute('index', value);
    }

    get index() {
        return this.getAttribute('index');
    }

    disable() {
        this.removeAttribute('status');
    }

    markCorrect() {
        this.status = "correct";
    }

    markWrong() {
        this.status = "wrong";
    }
})