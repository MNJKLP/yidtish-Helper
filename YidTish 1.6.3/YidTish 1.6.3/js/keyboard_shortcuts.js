// Keyboard shortcuts for Yidtish
function previousPage() {
    document.querySelectorAll(".previous a")[0].click();
}
function nextPage() {
    document.querySelectorAll(".next a")[0].click();
}
function sendPost(post) {
    if (post) {
        post.click();
    }
}
function previewPost() {
    document.getElementsByName("preview")[0].click();
}
function toggleNotification() {
    const notificationNode = document.getElementById("notification_list_button");
    if (notificationNode) {
        notificationNode.scrollIntoView({ behavior: "instant", block: "start" });
        notificationNode.click();
    }
}
function nextNotification() {
    Array.from(document.querySelectorAll("li.bg2 .notification-block")).some(node => {
        if (node.querySelector('strong').innerText === 'תגובה') {
            window.location.href = node.dataset.realUrl;
            return true;
        }
    });
}
function checkKey(e) {
    const post = document.getElementsByName("post")[0] || document.getElementsByName("submit")[0] || false;
    const isAltKey = e.altKey || e.getModifierState('AltGraph');
    if (e.code === "KeyA" && isAltKey) {
        window.location.href = 'https://forum.yidtish.com/search.php?search_id=newposts';
    }
    if (e.key === "Enter" && e.ctrlKey && post) {
        sendPost(post);
    }
    if (e.code === "KeyV" && isAltKey && post) {
        previewPost();
    }
    if (e.code === "KeyN" && isAltKey) {
        toggleNotification();
    }
    if (e.code === "KeyM" && isAltKey) {
        nextNotification();
    }
    e = e || window.event;
    if (e.target.nodeName === "INPUT" || e.target.nodeName === "TEXTAREA" || e.target.isContentEditable) {
        return;
    }
    if (e.key === "ArrowLeft") {
        try {
            nextPage();
        } catch {
            // Attempted to go after last page
        }
    } else if (e.key === "ArrowRight") {
        try {
            previousPage();
        } catch {
            // Attempted to go before first page
        }
    } 
}

// Add tooltip to post button
let post = document.getElementsByName("post")[0] || document.getElementsByName("submit")[0] || false;
if (post) {
    post.setAttribute("title", "שיק (שארטקאט קאנטראל+ענטער)");
}

// Attach keyboard event listener
document.onkeydown = checkKey;
