import { LOG, secondsToHours } from "../lib/util";
import { template } from "../lib/domUtil";
import { API_BASE } from "../lib/API";
import "./topics.scss";

export default class Popup {

    constructor(EE, video, controlBar) {
        this.video = video;
        this.controlBar = controlBar;

        const html = template`
            <div ref="el" class="vken-popup vken-topics-popup">
                <div ref="content" class="popup-content"></div>
            </div>
        `;

        const { el, content } = html.refs();
        video.parentElement.append(el);

        this.el = el;
        this.el.addEventListener("mousewheel", event => event.stopImmediatePropagation());
        this.el.addEventListener("keydown", event => event.stopPropagation());
        this.content = content;

        this.content.addEventListener("click", e => {
            let eventTarget = e.target;
            let row = eventTarget.closest(".vken-topic-row");
            if (row) {
                this.visible = false;
                EE.emit("seek-video", parseInt(row.dataset["time"]));
            }
        });

        const resetDiv = document.createElement("div");
        resetDiv.setAttribute("class", "vken-reset-div");
        resetDiv.addEventListener("click", _ => (this.visible = false));
        video.parentElement.append(resetDiv);

        EE.on("time-update", (currentTime) => {
            if (this.topics?.size > 0) {
                this.scrollPlayingTopicIntoView(currentTime);
            }
        });
    }

    setupButton() {
        const el = document.createElement("div");
        el.setAttribute("class", "vjs-control vjs-button vken-topics-button");
        const subtitlesButton = this.controlBar.querySelector(".vjs-playback-rate");
        subtitlesButton.insertAdjacentElement("beforebegin", el);

        el.addEventListener("click", _ => {
            this.visible = !this.visible;
        });
    }

    findPlayingRow(currentTime) {
        let rows = this.content.querySelectorAll("div.vken-topic-row");
        if (rows.length === 0 || currentTime < parseInt(rows[0].getAttribute("data-time"))) {
            return null;
        }

        let result = null;
        for (let i = 0; i < rows.length; i++) {
            let rowTime = rows[i].getAttribute("data-time");
            let nextRowTime = rows[i + 1]?.getAttribute("data-time") ?? "999999";

            if (currentTime >= parseInt(rowTime) && currentTime < parseInt(nextRowTime)) {
                result = rows[i];
                break;
            }
        }
        return result;
    }

    scrollPlayingTopicIntoView(currentTime) {
        let playingRow = this.findPlayingRow(currentTime);

        if (playingRow && this.playingRow !== playingRow) {
            this.playingRow?.classList.remove("highlighted");

            let container = playingRow.parentElement;
            container.scrollTop = playingRow.offsetTop - container.clientHeight / 2 + 20;

            playingRow.classList.add("highlighted");
            this.playingRow = playingRow;
        }
    }

    get visible() {
        return this.el.hasAttribute("visible");
    }

    set visible(value) {
        this.el.toggleAttribute("visible", value);
        this.video.parentElement.classList.toggle("vken-topics-visible", value);
    }

    setContent() {
        this.content.innerHTML = "";
        for (let [key, value] of this.topics.entries()) {
            let row = this.createRow(key, value);
            this.content.append(row);
        }
    }

    createRow(time, text) {
        const html = template`
            <div ref="el" class="vken-topic-row" data-time=${time}>
                <div class="vken-topic-dot">•</div>
                <div class="vken-topic-text">${text}</div>
                <div class="vken-topic-time">${secondsToHours(time)}</div>
            </div>
        `;

        let { el } = html.refs();
        return el;
    }

    async initialize(videoId) {
        let topics = new Map();

        const response = await fetch(`${API_BASE}/mmtocnew?youtube_id=${videoId}&generate=0`);
        if (response.ok) {
            const data = await response.json();
            if (data?.mmtoc) {
                Object.keys(data.mmtoc)
                    .map(Number)
                    .forEach(key => {
                        topics.set(key, data.mmtoc[key]);
                    });
            }
        }

        if (topics.size > 0) {
            this.topics = topics;
            this.setContent();
            this.setupButton();
        }
    }
}
