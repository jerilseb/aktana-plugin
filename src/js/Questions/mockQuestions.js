import { sleep } from "../lib/util";

const data = [
    {
        id: 463434,
        text: {
            time: 1550476186479,
            blocks: [
                {
                    type: "paragraph",
                    data: {
                        text: "Which is the main part of Aktana Decision Support Suite",
                    },
                },
            ],
            version: "2.8.1",
        },
        options: ["Market Data & Insights", "MCM and Field Activity", "Non Personal Channel Actions", "None of the above"],
        type: "single",
        correct: [1],
        time: [650, 655],
    },
    {
        id: 832955,
        text: {
            time: 1550476186479,
            blocks: [
                {
                    type: "paragraph",
                    data: {
                        text: "If you don’t specify ASC or DESC after a SQL ORDER BY clause, which is used by default?",
                    },
                },
            ],
            version: "2.8.1",
        },
        options: [
            "The values of count are logged or stored in a particular location or storage",
            "The value of count from 0 to 9 is displayed in the console",
            "An error is displayed",
            "An exception is thrown",
        ],
        type: "single",
        correct: [1],
        time: [2360, 2365],
    },
];

export async function fetchQuestions () {
    const _data = JSON.parse(JSON.stringify(data));
    await sleep(1000);
    return _data;
}

export async function saveQuestions (data) {
    await sleep(1000);
    return data;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
