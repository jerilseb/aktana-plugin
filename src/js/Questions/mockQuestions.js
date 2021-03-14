import { LOG, sleep } from "../lib/util";
import { DASHBOARD_API_BASE } from "../lib/API";

export async function fetchQuestions(videoId) {
    const questions = [];
    let body = JSON.parse(localStorage.getItem(videoId)) || [];

    if (body.length > 0) {
        for (let item of body) {
            let q = transformData(item);
            questions.push(q);
        }
    }

    return questions;
}

export async function postQuestion ({ text, time, options, correct }, videoId) {
    let questions = JSON.parse(localStorage.getItem(videoId)) || [];
    id = getRandomInt(10000);

    const data = {
        question: {
            id,
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
        appears_at: time
    };

    questions.push(data);
    localStorage.setItem(videoId, JSON.stringify(questions));
    await sleep(1000);

    return transformData(data);
}

export async function updateQuestion ({ text, time, options, correct }, qId, videoId) {
    let questions = JSON.parse(localStorage.getItem(videoId)) || [];

    let question = questions.find(q => q.question.id === qId);
    let index = questions.indexOf(question);
    if (index > -1) {
        questions.splice(index, 1);
    }

    const data = {
        question: {
            id: qId,
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
        appears_at: time
    };

    questions.push(data);

    localStorage.setItem(videoId, JSON.stringify(questions));
    await sleep(1000);

    return transformData(data);
}

export async function deleteQuestion (qId, videoId) {
    let questions = JSON.parse(localStorage.getItem(videoId)) || [];

    let question = questions.find(q => q.question.id === qId);
    let index = questions.indexOf(question);
    if (index > -1) {
        questions.splice(index, 1);
    }

    localStorage.setItem(videoId, JSON.stringify(questions));
    await sleep(1000);

    return true
}

function transformData(data) {
    let q = {};
    let { question, appears_at } = data;
    q["id"] = question["id"],
    q["text"] = question["question_json"]["blocks"][0].data['text'];
    q["options"] = question["options"]["options"];
    q["time"] = appears_at,
    q["correct"] = question["answer"]["answer"];
    q["type"] = question["type"] === "MCQ-Single-Correct" ? "single" : "multi";
    q["shown"] = false;
    q["attempted"] = false;

    return q;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
