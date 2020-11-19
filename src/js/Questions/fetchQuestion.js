import { LOG } from "../util";

export default async function fetchQuestions(videoId) {
    const questions = [];

    try {
        const response = await fetch(
            `https://vkanalytics.videoken.com/api/external-videoquestions/${videoId}/?organisation_name=VideoKen`
        );
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

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
