import { sleep } from "../lib/util";

const data = {
    30: "Learning Objectives",
    240: "Aktana DSE at a Glance",
    690: "DSE: Actors",
    616: "Identifying Billing Method",
    741: "Bookstore pay",
    1547: "DSE: Anatomy of a Suggestion",
    947: "Setup Student Pay(Not Applicable)",
    1181: "Set Up Institution",
    1251: "Examples",
    1286: "Q: CRM-ID",
    1386: "What is the difference between school id and facility id?",
    1619: "Add Default Program and Time Zone",
    1805: "Q: How would someone know without having that information - what the adelphi university program is constituted??",
    2264: "Standard Deluxe + Custom Tests",
    2358: "Create Service & NXT Master Logins for School",
    2468: "Ticket Log between AM/SS/BizOPS",
    2745: "Wrap Up"
};

export default async function () {
    const _data = JSON.parse(JSON.stringify(data));
    await sleep(1000);
    return _data;
}
