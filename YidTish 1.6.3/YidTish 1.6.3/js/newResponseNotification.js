(function () {
    // Only run on topic view pages
    if (window.location.pathname !== '/viewtopic.php') {
        return;
    }
    
    // Get the current post count from the pagination info
    let paginationElement = document.querySelector("div.pagination");
    if (!paginationElement) {
        return;
    }

    let match = paginationElement.innerHTML.match(/(\d+) פאוסטס/);
    if (!match) {
        return;
    }

    let currentCount = match[1];
    
    // Get the number of posts currently displayed
    let postElements = document.getElementsByClassName("post has-profile");
    if (postElements.length === 0) {
        return;
    }
    
    let currentPostCount = postElements.length;
    
    // Get the last post element
    let lastPost = postElements[currentPostCount - 1];

    // Extract topic ID from the URL
    let topicTitleElement = document.querySelector("h2.topic-title > a");
    if (!topicTitleElement) {
        return;
    }
    
    var topicURL = topicTitleElement.href;
    var topicURLSearch = topicURL.substr(topicURL.indexOf("?"));
    var urlParams = new URLSearchParams(topicURLSearch);
    var topicId = urlParams.get("t");
    
    // Get the forum URL
    var forumURLElement = document.querySelector(".left-box.arrow-right") || 
                          document.querySelector(".crumb[data-forum-id]");
    if (!forumURLElement) {
        return;
    }
    
    var forumURL = forumURLElement.href;

    // Check if we're on the last page
    function isLastPage() {
        return document.getElementsByClassName("next").length == 0;
    }

    // Store the current page title
    let title = document.title;

    // Set interval to 20 seconds
    let backgroundSync = true;
    let interval = 20000; // 20 seconds

    // Try to get settings from the page if they exist
    if (document.getElementById("YidTishHelperSettings")) {
        backgroundSync = document.getElementById("YidTishHelperSettings")
            .getAttribute("data-background-sync") === "true";
        let backgroundSyncPosts = document.getElementById("YidTishHelperSettings")
            .getAttribute("data-background-sync-posts");
        if (!backgroundSync || !backgroundSyncPosts) {
            return;
        }
        interval = parseInt(backgroundSyncPosts);
    }

    // Function to check for new responses
    let checkNewResponse = function () {
        if (isLastPage() && currentCount > 0) {
            fetch(forumURL)
                .then(function (response) {
                    return response.text();
                })
                .then(function (data) {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(data, "text/html");
                    
                    // Find the topic in the forum page
                    let topics = Array.from(doc.querySelectorAll("li.row"));
                    
                    let topic = topics.find((t) => {
                        let tHref = t.querySelector("a.topictitle")?.href;
                        if (!tHref) return false;
                        let tHrefSearch = tHref.substr(tHref.indexOf("?"));
                        let tSearch = new URLSearchParams(tHrefSearch);
                        let tId = tSearch.get("t");
                        return tId == topicId;
                    });
                    
                    // If we can't find the topic, assume no new posts
                    if (!topic) {
                        setTimeout(checkNewResponse, interval);
                        return;
                    }
                    
                    // Get the post count from the topic
                    let postsElement = topic.querySelector(".posts");
                    if (!postsElement) {
                        setTimeout(checkNewResponse, interval);
                        return;
                    }
                    
                    let newCount = postsElement.textContent.trim();
                    
                    // If the post count has increased, show notification
                    if (newCount && parseInt(currentCount) <= parseInt(newCount)) {
                        lastPost.insertAdjacentHTML(
                            "afterend",
                            `<h3 style="margin:4px auto;text-align:center;background:#cadceb;padding:7px 5px 5px 5px;border:none;border-radius:7px;user-select:none;">
                                נייע פאוסטס זענען צוגעקומען
                                <a class="button" style="width:150px;margin:5px auto;display:block;" href="/viewtopic.php?t=${topicId}&view=unread#unread">רילאוד</a>
                            </h3>`
                        );
                        // Flash the title
                        setInterval(function () {
                            document.title = document.title == title ? "\u26B9 " + title : title;
                        }, 500);
                    } else {
                        setTimeout(checkNewResponse, interval);
                    }
                })
                .catch(function (error) {
                    console.error("YidTish Helper: Error fetching forum page:", error);
                    // If there's an error, increase the interval and try again
                    interval *= 3;
                    setTimeout(checkNewResponse, interval);
                });
        } else {
            setTimeout(checkNewResponse, interval);
        }
    };
    
    // Start checking for new responses
    setTimeout(checkNewResponse, interval);
})();

