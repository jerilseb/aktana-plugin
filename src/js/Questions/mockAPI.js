import { LOG, sleep, secondsToHours, hmsToSeconds } from "../lib/util";

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

export async function createQuestion ({ text, time, options, correct, correct_text, type }, videoId) {
    let questions = JSON.parse(localStorage.getItem(videoId)) || [];
    let questionId = getRandomInt(10000);
    let quizId = getRandomInt(10000);
    const questionType = type === "single" ? "MCQ-Single-Correct" : "MCQ-Multiple-Correct"

    const data = {
        question: {
            id: questionId,
            question_json: { "blocks": [
                        {
                            type: "paragraph",
                            data: { text }
                        }
                    ]},
            options: { options },
            answer: { answer: correct, answer_text: correct_text },
            type: questionType,
            difficulty: "Moderate"
        },
        quiz_id: quizId,
        appears_at: secondsToHours(time)
    };

    questions.push(data);
    localStorage.setItem(videoId, JSON.stringify(questions));
    await sleep(1000);

    return transformData(data);
}

export async function updateQuestion ({ text, time, options, correct, correct_text, type }, questionId, quizId, videoId) {
    let questions = JSON.parse(localStorage.getItem(videoId)) || [];
    const questionType = type === "single" ? "MCQ-Single-Correct" : "MCQ-Multiple-Correct"

    let question = questions.find(q => q.question.id === questionId);
    let index = questions.indexOf(question);

    if (index > -1) {
        questions.splice(index, 1);
    }

    const data = {
        question: {
            id: questionId,
            question_json: { "blocks": [
                        {
                            type: "paragraph",
                            data: { text }
                        }
                    ]},
            options: { options },
            answer: { answer: correct, answer_text: correct_text },
            type: questionType,
            difficulty: "Moderate"
        },
        quiz_id: quizId,
        appears_at: secondsToHours(time)
    };

    questions.push(data);

    localStorage.setItem(videoId, JSON.stringify(questions));
    await sleep(1000);

    return transformData(data);
}

export async function deleteQuestion (quizId, videoId) {
    let questions = JSON.parse(localStorage.getItem(videoId)) || [];

    let question = questions.find(q => q.quiz_id === quizId);
    let index = questions.indexOf(question);
    if (index > -1) {
        questions.splice(index, 1);
    }

    localStorage.setItem(videoId, JSON.stringify(questions));
    await sleep(1000);

    return true
}

export async function submitQuestion(selectedOptions, videoId, quizId, questionId) {
    const payload = {
        response: {
            attempted: {
                [questionId]: selectedOptions
            },
            skipped: []
        }
    }
    LOG("Submitting", payload);
    await sleep(1000);
}

function transformData(data) {
    let q = {};
    let { question, appears_at, quiz_id } = data;
    q["id"] = question["id"];
    q["quizId"] = quiz_id;
    q["text"] = question["question_json"]["blocks"][0].data['text'];
    q["options"] = question["options"]["options"];
    q["time"] = hmsToSeconds(appears_at);
    q["correct"] = question["answer"]["answer"];
    q["type"] = question["type"] === "MCQ-Single-Correct" ? "single" : "multi";
    q["shown"] = false;
    q["attempted"] = false;

    return q;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
