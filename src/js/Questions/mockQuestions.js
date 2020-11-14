import { sleep } from "../lib/util";

const data = [
    {   id: 463434,
        text: "If you don’t specify ASC or DESC after a SQL ORDER BY clause, which is used by default?",
        options: [
            "ASC",
            "DESC",
            "There is no default value",
            "Error will occur"
        ],
        type: "single",
        correct: [1],
        time: [120, 125]
    },
    {
        id: 478729,
        text: `
<b>What's the output of the following python code?</b>
<pre style="background: #dde2ef; padding: 8px">
<span style="color: #aaaaaa">></span> my_tuple = (1, 2, 3, 4)
<span style="color: #aaaaaa">></span> my_tuple.append( (5, 6, 7) )
<span style="color: #aaaaaa">></span> print len(my_tuple)
</pre>
        `,
        options: [
            "1",
            "2",
            "5",
            "Error"
        ],
        type: "single",
        correct: [2],
        time: [240, 245]
    },
    {
        id: 832955,
        text: `
<div style="font-size: .9em">
<b>What happens in the following javaScript code snippet?</b>
<pre style="background: #dde2ef; padding: 8px">
var count = 0;
while (count < 10) 
{
     console.log(count);
     count++;
}
</pre>
</div>
        `,
        options: [
            "The values of count are logged or stored in a particular location or storage",
            "The value of count from 0 to 9 is displayed in the console",
            "An error is displayed",
            "An exception is thrown"
        ],
        type: "single",
        correct: [1],
        time: [360, 365]
    }
]

export default async function() {
    const _data = JSON.parse(JSON.stringify(data));
    await sleep(1000);
    return _data;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}