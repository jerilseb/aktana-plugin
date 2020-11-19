function loadComments() {
    // console.log("EXT: %cLoad comments message received", "color: lime");
    let e = document.querySelector("ytd-comments");
    let n = document.querySelector("ytd-watch-flexy");
    if (e && typeof e.loadComments == "function" && n && n.comments && !n.comments.contents) {
        // console.log("EXT: %cFiring loadComments", "color: lime");
        e.loadComments();
    }
}

window.addEventListener(
    "message",
    (t) => {
        t.data && t.data.loadComments && loadComments();
    },
    false
);

// console.log("EXT: %cComments script executed", "color:lime");
