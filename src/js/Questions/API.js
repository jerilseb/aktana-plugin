import { LOG, sleep, hmsToSeconds, getAuthToken } from "../lib/util";
import { DASHBOARD_API_BASE } from "../lib/API";

export async function fetchQuestions(videoId) {
    LOG("Fetching questions for", videoId);
    const questions = [];

    try {
        const response = await fetch(`${DASHBOARD_API_BASE}/external-videoquestions/${videoId}`, {
            method: 'GET'
        });

        const data = await response.json();

        if (data.body && data.body.length > 0) {
            const { body } = data;
            for (let item of body) {
                let q = transformData(item, data.video_id);
                questions.push(q);
            }
        }
    } catch (error) {
        LOG(error);
    }

    return questions;
}

export async function createQuestion ({ text, time, options, correct, correct_text, type }, videoId, videoTitle) {
    const questionType = type === "single" ? "MCQ-Single-Correct" : "MCQ-Multiple-Correct"

    const payload = {
        title: videoTitle,
        question: {
                appears_at: secondsToHours(time),
                question: {
                    question_json: {
                        "blocks":
                            [{
                                type: "paragraph",
                                data: { text }
                            }]
                        },
                    options: { options },
                    answer: {
                        answer: correct,
                        answer_text: correct_text
                    },
                    type: questionType,
                    difficulty: "Moderate"
                }
            },
    };

    try {
        let auth_token = await getAuthToken();

        const response = await fetch(`${DASHBOARD_API_BASE}/videoquestions/${videoId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${auth_token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        return transformData(data['question']);

    } catch (error) {
        LOG(error);
    }
}

export async function updateQuestion ({ text, time, options, correct, correct_text, type }, questionId, quizId, videoId) {
    let questions = JSON.parse(localStorage.getItem(videoId)) || [];

    let question = questions.find(q => q.question.id === questionId);
    let index = questions.indexOf(question);
    if (index > -1) {
        questions.splice(index, 1);
    }
    const questionType = type === "single" ? "MCQ-Single-Correct" : "MCQ-Multiple-Correct";

    const payload = {
        question: {
                appears_at: secondsToHours(time),
                quiz_id: quizId,
                question: {
                    id: questionId,
                    question_json: {
                        "blocks":
                            [{
                                type: "paragraph",
                                data: { text }
                            }]
                        },
                    options: { options },
                    answer: {
                        answer: correct,
                        answer_text: correct_text
                    },
                    type: questionType,
                    difficulty: "Moderate"
                }
            },
    };

    let auth_token = await getAuthToken();

    const response = await fetch(`${DASHBOARD_API_BASE}/videoquestions/${videoId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${auth_token}`
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    return transformData(data['question']);
}

export async function deleteQuestion (quizId, videoId) {
    let questions = JSON.parse(localStorage.getItem(videoId)) || [];

    let question = questions.find(q => q.question['quiz_id'] === quizId);
    let index = questions.indexOf(question);
    if (index > -1) {
        questions.splice(index, 1);
    }

    let auth_token = await getAuthToken();

    await fetch(`${DASHBOARD_API_BASE}/videoquestions/${videoId}?quiz_id=${quizId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${auth_token}`
        }
    });

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
    const response = await fetch(`${DASHBOARD_API_BASE}/${videoId}/video-quiz/${quizId}/submit/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });

    LOG(response);
}

export function secondsToHours(seconds) {
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(seconds / 3600);
    seconds -= minutes * 60;
    minutes -= hours * 60;

    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    if (hours < 10) hours = "0" + hours;

    return hours + ":" + minutes + ":" + seconds;
}

function transformData(data, videoId) {
    let q = {};
    let { question, appears_at, quiz_id } = data;

    q["videoId"] = videoId;
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
