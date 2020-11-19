import { LOG, debounce } from "./util";

// let currentObserver = null, observerName = null;

// export function clearElementObserver() {
//     if(currentObserver) {
//         LOG("Clearing observer for", observerName);
//         currentObserver.disconnect();
//         currentObserver = null;
//         observerName = null;
//     }
// }

export function waitForElementInsertion(parent, selector) {
    return new Promise((resolve) => {
        observerName = `Insert ${selector}`;
        currentObserver = new MutationObserver((mutations) => {
            requestIdleCallback(
                (_) => {
                    for (let mutation of mutations) {
                        for (let addedNode of mutation.addedNodes) {
                            if (addedNode.nodeType === 1 && addedNode.matches(selector)) {
                                // LOG("Inserted element", selector);
                                clearElementObserver();
                                resolve(addedNode);
                            }
                        }
                    }
                },
                { timeout: 2000 }
            );
        });
        currentObserver.observe(parent, { childList: true, subtree: true });
        LOG("Waiting for element Insertion:", selector);
    });
}

export function waitForElementRemoval(parent, selector) {
    return new Promise((resolve) => {
        observerName = `Remove ${selector}`;
        currentObserver = new MutationObserver((mutations) => {
            requestIdleCallback(
                (_) => {
                    for (let mutation of mutations) {
                        for (let removedNode of mutation.removedNodes) {
                            if (removedNode.nodeType === 1 && removedNode.matches(selector)) {
                                // LOG("Inserted element", selector);
                                clearElementObserver();
                                resolve(addedNode);
                            }
                        }
                    }
                },
                { timeout: 2000 }
            );
        });
        currentObserver.observe(parent, { childList: true, subtree: true });
        LOG("Waiting for element Removal:", selector);
    });
}

let currentObserver = null,
    observerName = null;

export function clearElementObserver() {
    if (currentObserver) {
        LOG("Clearing observer:", observerName);
        clearTimeout(currentObserver);
        currentObserver = null;
        observerName = null;
    }
}

export function waitForElement(parent, selector) {
    return new Promise((resolve) => {
        LOG("Waiting for element:", selector);
        (function loop() {
            observerName = selector;
            currentObserver = setTimeout(() => {
                requestIdleCallback(() => {
                    let el = parent.querySelector(selector);
                    if (el) {
                        LOG("Element available:", selector);
                        clearElementObserver();
                        resolve(el);
                    } else {
                        loop();
                    }
                });
            }, 200);
        })();
    });
}

// Mutation records only have the old value of a changed attribute.
// So we have to adjust our logic based on that.
// https://stackoverflow.com/questions/60593551/get-the-new-attribute-value-for-the-current-mutationrecord-when-using-mutationob

export function watchForAttributeChange(element, attribute, callback) {
    const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            callback(mutation.oldValue);
        }
    });
    observer.observe(element, {
        attributeFilter: [attribute],
        attributeOldValue: true,
        childList: false,
        subtree: false,
    });
}

export function template(strings, ...args) {
    let result = ``;
    const placeholders = {};
    for (let i = 0; i < args.length; i++) {
        if (args[i] instanceof HTMLElement) {
            const id = `id${i}`;
            placeholders[id] = args[i];
            result += `${strings[i]}<div replace="${id}"></div>`;
        } else {
            result += strings[i] + args[i];
        }
    }
    result += strings[strings.length - 1];

    const template = document.createElement(`template`);
    template.innerHTML = result;
    const content = template.content;

    for (let refNode of content.querySelectorAll("[replace]")) {
        const newNode = placeholders[refNode.getAttribute("replace")];
        refNode.replaceWith(newNode);
    }

    content.refs = () => {
        const refElements = content.querySelectorAll("[ref]");
        return [...refElements].reduce((acc, element) => {
            const propName = element.getAttribute("ref").trim();
            element.removeAttribute("ref");
            acc[propName] = element;
            return acc;
        }, {});
    };

    return content;
}
