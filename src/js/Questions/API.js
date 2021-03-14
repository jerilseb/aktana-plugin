import { LOG, sleep } from "../lib/util";
import { DASHBOARD_API_BASE } from "../lib/API";

export async function fetchQuestions(videoId) {
    const questions = [];

    try {
        const response = await fetch(`${DASHBOARD_API_BASE}/external-videoquestions/${videoId}`, {
            method: 'GET',
            mode: 'no-cors'
        });

        const data = await response.json();

        if (data.body && data.body.length > 0) {
            const { body } = data;
            for (let item of body) {
                let q = {};
                let { question, ui_options } = item;
                q["id"] = getRandomInt(999999);
                q["text"] = question["question_text"];
                q["options"] = question["options"]["options"];
                q["time"] = ui_options["time"];
                q["correct"] = question["answer"]["answer"];
                q["type"] = question["type"] === "MCQ-Single-Correct" ? "single" : "multi";
                q["hinted"] = false;
                q["attempted"] = false;

                questions.push(q);
            }
        }
    } catch (error) {
        LOG(error);
    }

    return questions;
}

export async function postQuestion ({ text, time, options, correct }, videoId) {
    const data = {
            question: {
                question_json: { "blocks": [
                            {
                                type: "paragraph",
                                data: { text }
                            }
                        ]},
                options: { options },
                answer: { answer: correct },
                type: "MCQ-Single-Correct",
                difficulty: "Moderate"
        },
        appears_at: time[0]
    };

    try {
        let auth_token = await getAuthToken();

        const response = await fetch(`${DASHBOARD_API_BASE}/videoquestions/${videoId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${auth_token}`
            },
            body: JSON.stringify(data)
        });

        const data = await response.json();

        LOG(response);
    } catch (error) {
        LOG(error);
    }
}

// export async function postQuestion (data) {
//     debugger
//     await sleep(1000);
//     return data;
// }

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

async function getAuthToken() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["auth_token"], ({ auth_token }) => {
            if (auth_token) {
                resolve(auth_token);
            } else {
                reject("Auth token not found");
            }
        });
    });
}
