import { LOGGER_API } from "./API";

class EventLogger {
    constructor(options) {
        this._batchSize = options.batchSize || 10;
        this._interval = options.logInterval || 5000;

        this._array = [];
        this._sessionId = Date.now() % 100000000000;
        console.log(this._sessionId);

        setInterval(() => {
            if (this.hasEntries()) {
                const entries = this.remove();
                const data = {
                    sid: this._sessionId,
                    events: entries
                }

                fetch(LOGGER_API, {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
            }
        }, this._interval);
    }

    add(value) {
        this._array.push({
            msg: value,
            loc: location.pathname.substr(10),
            ets: parseInt(performance.now())
        });
    }

    remove () {
        return this._array.splice(0, this._batchSize);
    }

    hasEntries() {
        return this._array.length > 0;
    }

    destroy () {
        this._array = null;
    }
}

export default EventLogger;