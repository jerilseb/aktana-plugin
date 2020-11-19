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
                        text: "What's the capital of India?",
                    },
                },
            ],
            version: "2.8.1",
        },
        options: ["New Delhi", "Mumbai", "Hyderabad", "None of the above"],
        type: "single",
        correct: [1],
        time: [120, 125],
    },
    {
        id: 478729,
        text: {
            time: 1550476186479,
            blocks: [
                {
                    type: "paragraph",
                    data: {
                        text: "",
                    },
                },
            ],
            version: "2.8.1",
        },
        options: ["1", "2", "5", "Error"],
        type: "single",
        correct: [2],
        time: [240, 245],
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
        time: [360, 365],
    },
];

export default async function () {
    const _data = JSON.parse(JSON.stringify(data));
    await sleep(1000);
    return _data;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
