import { secondsToHours, debounce } from "../lib/util";

export default class Popup {
    constructor(EE, container) {
        this._topics = null;
        this._topicTimes = null;
        this._playingTopic = null;
        this._playingRow = null;
        this._isOpen = false;
        this._container = container;
        // this._isSearching = false;

        const template = document.createElement('template');
        template.innerHTML = `
          <div class="ytp-popup ytp-topics-popup">
            <div class="popup-content"></div>
          </div>
        `;
        this._el =  template.content.firstElementChild;
        container.append(this._el);

        this._el.addEventListener('mousewheel', event => event.stopImmediatePropagation());
        this._el.addEventListener("keydown", event => event.stopPropagation());

        // this._searchInput = this._el.querySelector('.search-input');
        this._popupContent = this._el.querySelector('.popup-content');
        // this._nextButton = this._el.querySelector('.right-button');
        // this._prevButton = this._el.querySelector('.left-button');

        // const debouncedHandler = debounce(this.setSearchTopics, 350);
        // this._searchInput.addEventListener('input', event => {
        //   debouncedHandler.call(this, event.target.value);
        // });

        // this._nextButton.addEventListener('click', () => {
        //   this.onNextButtonClick();
        // });

        // this._prevButton.addEventListener('click', () => {
        //   this.onPrevButtonClick();
        // });

        this._popupContent.addEventListener('click', e => {
          let row = e.target.closest('.ytp-topic-row');
          if(row) {
            this.hide();
            EE.emit("seek-video", parseInt(row.dataset["time"]));
          }
        });

        const resetDiv = document.createElement('div');
        resetDiv.setAttribute('class', 'ytp-reset-div');
        resetDiv.addEventListener('click', e => this.hide());
        container.append(resetDiv);

        EE.on("time-update", currentTime => {
          if(this._topics) {
            this.setPlayingTopic(currentTime);
          }
        });
    }

    el() {
        return this._el;
    }

    show() {
        if(!this._isOpen) {
          this._el.classList.add('active');
          this._container.classList.add('ytp-show-controlbar');
          this._isOpen = true;
          this.scrollPlayingTopicIntoView();
          // this._searchInput.focus();
        }
    }

    hide() {
        if(this._isOpen) {
          this._el.classList.remove('active');
          this._container.classList.remove('ytp-show-controlbar');

          this._isOpen = false;
          this.resetTopics();
        }
    }

    isOpen() {
        return this._isOpen;
    }

    scrollPlayingTopicIntoView() {
      if(this._playingRow) {
        let container = this._playingRow.parentNode;
        container.scrollTop = this._playingRow.offsetTop - container.clientHeight / 2 + 20;
      }
    }

    // setSearchTopics(searchTerm) {
    //   if(searchTerm.length > 0) {
    //     let formattedTopics = [];
    //     Object.keys(this._topics).forEach(time => {
    //       let text = this._topics[time];
    //       let index = text.toLowerCase().indexOf(searchTerm.toLowerCase());
  
    //       if (index > -1) {
    //         formattedTopics.push({
    //           time,
    //           text: [text.slice(0, index), text.slice(index, index + searchTerm.length), text.slice(index + searchTerm.length)]
    //         });
    //       }
    //     });

    //     this.setHTML(formattedTopics);
    //     this._isSearching = true;
    //     this._el.classList.add('searching');
    //   }
    //   else {
    //     this.resetTopics();
    //     this.setPlayingTopic(this._video.currentTime);
    //     this.scrollPlayingTopicIntoView();
    //   }
    // }

    resetTopics() {
      const formattedTopics = Object.keys(this._topics).map(time => {
        return { time, text: [this._topics[time], '', '']};
      });
      this.setHTML(formattedTopics);
      this._isSearching = false;
      this._el.classList.remove('searching');
    }

    setHTML(topics) {
      let innerHTML = '';
      if(topics.length > 0) {
        innerHTML = topics.reduce((html, topic) => {
          const { time, text } = topic;
          return html + `
            <div class="ytp-topic-row" data-time=${time}>
              <div class="ytp-topic-dot">•</div>
              <div class="ytp-topic-text">${text[0]}<mark>${text[1]}</mark>${text[2]}</div>
              <div class="ytp-topic-time">${secondsToHours(time)}</div>
            </div>`;
        }, '');
      }
      else {
        innerHTML = `
          <div class="empty">Nothing found</div>
        `
      }
      this._popupContent.innerHTML = innerHTML;
    }

    setTopics(topics) {
      this.hide();
      this._topics = topics;
      this.resetTopics();
      this._topicTimes = Object.keys(topics).map(Number);
      this._topicTimes.push(999999);
    }

    setPlayingTopic(currentTime) {
      if (this._isSearching) return;

      let found = false;
      for (let i=0; i < this._topicTimes.length - 1; i++) {
        if(currentTime >= this._topicTimes[i] && currentTime < this._topicTimes[i+1]) {
          this._playingTopic = this._topicTimes[i];
          found = true;
          break;
        }
      }

      if(!found) {
        this._playingTopic = null;
      }

      this.highlightPlayingTopic();
    }

    highlightPlayingTopic() {
      if(this._playingTopic !== null) {
        const playingRow = this._el.querySelector(`div.ytp-topic-row[data-time="${this._playingTopic}"]`);
        
        if(playingRow === this._playingRow) return;

        if(this._playingRow) {
          this._playingRow.classList.remove('highlighted');
        }
        
        playingRow.classList.add('highlighted');
        this._playingRow = playingRow;
      }
    }

    // onNextButtonClick() {
    //   const nextIndex = this._topicTimes.indexOf(this._playingTopic) + 1;
    //   if(nextIndex > this._topicTimes.length - 2) {
    //     return;
    //   }

    //   const nextTopicTime = this._topicTimes[nextIndex];
    //   this._video.currentTime = nextTopicTime;
      
    //   this.setPlayingTopic(nextTopicTime);
    //   this.scrollPlayingTopicIntoView();
    // }

    // onPrevButtonClick() {
    //   const prevIndex = this._topicTimes.indexOf(this._playingTopic) - 1;
    //   if(prevIndex < 0) {
    //     return;
    //   }

    //   const prevTopicTime = this._topicTimes[prevIndex];
    //   this._video.currentTime = prevTopicTime;
    //   this.setPlayingTopic(prevTopicTime);
    //   this.scrollPlayingTopicIntoView();
    // }
}