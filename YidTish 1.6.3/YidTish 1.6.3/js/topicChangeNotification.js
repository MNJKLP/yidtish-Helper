// Topic Change Notification Script for Yidtish Forum
(function() {
    // Only run on specific pages: new posts and active topics
    const currentUrl = window.location.href;
    const isNewPostsPage = currentUrl.includes('/search.php?search_id=newposts');
    const isActiveTopicsPage = currentUrl.includes('/search.php?search_id=active_topics');
    
    if (!isNewPostsPage && !isActiveTopicsPage) {
        return;
    }

    // Get the current top topic based on the actual HTML structure
    function getCurrentTopTopic() {
        // Find all topic rows
        const topicRows = document.querySelectorAll("li.row");
        if (topicRows.length === 0) {
            return null;
        }
        
        // Get the first (top) topic row
        const topTopicRow = topicRows[0];
        
        // Extract topic information from the correct elements
        const topicTitleElement = topTopicRow.querySelector("a.topictitle");
        if (!topicTitleElement) {
            return null;
        }
        
        const topicTitle = topicTitleElement.textContent.trim();
        const topicUrl = topicTitleElement.href;
        
        // Extract topic ID from URL
        let topicId = null;
        if (topicUrl) {
            const match = topicUrl.match(/t=(\d+)/);
            if (match && match[1]) {
                topicId = match[1];
            }
        }
        
        // Get the last post information
        const lastPostElement = topTopicRow.querySelector(".lastpost");
        let lastPostInfo = "";
        
        if (lastPostElement) {
            // Get the username and time
            const usernameElement = lastPostElement.querySelector(".username");
            const timeElement = lastPostElement.querySelector("time");
            
            if (usernameElement && timeElement) {
                const username = usernameElement.textContent.trim();
                const time = timeElement.getAttribute("datetime");
                lastPostInfo = `${username}|${time}`;
            }
        }
        
        return {
            id: topicId,
            title: topicTitle,
            url: topicUrl,
            lastPostInfo: lastPostInfo,
            pageType: isNewPostsPage ? 'newposts' : 'active_topics'
        };
    }

    // Store the current top topic
    const currentTopTopic = getCurrentTopTopic();
    if (!currentTopTopic) {
        return;
    }
    
    // Use different storage keys for different page types
    const storageKey = isNewPostsPage ? 'yidtishTopTopicNewPosts' : 'yidtishTopTopicActiveTopics';
    
    // Store the current top topic in localStorage for comparison
    localStorage.setItem(storageKey, JSON.stringify(currentTopTopic));
    
    // Set interval to 30 seconds
    let interval = 30000; // 30 seconds
    
    // Function to check for topic changes
    let checkTopicChange = function() {
        fetch(window.location.href)
            .then(function(response) {
                return response.text();
            })
            .then(function(data) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(data, "text/html");
                
                // Find all topic rows in the fetched page
                const topicRows = doc.querySelectorAll("li.row");
                if (topicRows.length === 0) {
                    setTimeout(checkTopicChange, interval);
                    return;
                }
                
                // Get the first (top) topic row
                const topTopicRow = topicRows[0];
                
                // Extract topic information from the correct elements
                const topicTitleElement = topTopicRow.querySelector("a.topictitle");
                if (!topicTitleElement) {
                    setTimeout(checkTopicChange, interval);
                    return;
                }
                
                const newTopicTitle = topicTitleElement.textContent.trim();
                const newTopicUrl = topicTitleElement.href;
                
                // Extract topic ID from URL
                let newTopicId = null;
                if (newTopicUrl) {
                    const match = newTopicUrl.match(/t=(\d+)/);
                    if (match && match[1]) {
                        newTopicId = match[1];
                    }
                }
                
                // Get the last post information
                const lastPostElement = topTopicRow.querySelector(".lastpost");
                let newLastPostInfo = "";
                
                if (lastPostElement) {
                    // Get the username and time
                    const usernameElement = lastPostElement.querySelector(".username");
                    const timeElement = lastPostElement.querySelector("time");
                    
                    if (usernameElement && timeElement) {
                        const username = usernameElement.textContent.trim();
                        const time = timeElement.getAttribute("datetime");
                        newLastPostInfo = `${username}|${time}`;
                    }
                }
                
                const newTopTopic = {
                    id: newTopicId,
                    title: newTopicTitle,
                    url: newTopicUrl,
                    lastPostInfo: newLastPostInfo,
                    pageType: isNewPostsPage ? 'newposts' : 'active_topics'
                };
                
                // Get the stored top topic
                const storedTopTopicJSON = localStorage.getItem(storageKey);
                if (!storedTopTopicJSON) {
                    localStorage.setItem(storageKey, JSON.stringify(newTopTopic));
                    setTimeout(checkTopicChange, interval);
                    return;
                }
                
                const storedTopTopic = JSON.parse(storedTopTopicJSON);
                
                // Check if the top topic has changed (either different topic ID or different last post info)
                if (newTopicId !== storedTopTopic.id || newLastPostInfo !== storedTopTopic.lastPostInfo) {
                    // Remove any existing notification
                    const existingNotification = document.getElementById('yidtishTopicChangeNotification');
                    if (existingNotification) {
                        existingNotification.remove();
                    }
                    
                    // Get the topic list container
                    const topicList = document.querySelector("ul.topiclist.topics");
                    if (!topicList) {
                        setTimeout(checkTopicChange, interval);
                        return;
                    }
                    
                    // Create a new notification row that looks like a topic row
                    const notificationRow = document.createElement('li');
                    notificationRow.id = 'yidtishTopicChangeNotification';
                    notificationRow.className = 'row bg0'; // Use bg0 to make it stand out
                    
                    // Get the structure from an existing row
                    const firstRow = document.querySelector("li.row");
                    if (!firstRow) {
                        setTimeout(checkTopicChange, interval);
                        return;
                    }
                    
                    // Create our custom HTML based on the structure
                    notificationRow.innerHTML = `
                        <dl class="row-item">
                            <dt>
                                <div class="list-inner" style="background-color: #cadceb; padding: 10px; border-radius: 5px; text-align: center;">
                                    <a class="topictitle" style="font-weight: bold; color: #333; display: block; margin-bottom: 10px;">נייע טאפיקס ציגעקומען</a>
                                    <div style="display: flex; justify-content: center; gap: 10px;">
                                        <button id="refreshButton" style="padding: 3px 10px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 3px; cursor: pointer;">ריפרעש</button>
                                        <button id="closeButton" style="padding: 3px 10px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 3px; cursor: pointer;">פארמאך</button>
                                    </div>
                                </div>
                            </dt>
                            <dd class="posts">&nbsp;</dd>
                            <dd class="views">&nbsp;</dd>
                            <dd class="lastpost">&nbsp;</dd>
                        </dl>
                    `;
                    
                    // Insert at the top of the list
                    topicList.insertBefore(notificationRow, topicList.firstChild);
                    
                    // Add event listener to refresh button
                    document.getElementById('refreshButton').addEventListener('click', function() {
                        window.location.reload();
                    });
                    
                    // Add event listener to close button
                    document.getElementById('closeButton').addEventListener('click', function() {
                        notificationRow.remove();
                        // Update stored top topic to prevent showing notification again until next change
                        localStorage.setItem(storageKey, JSON.stringify(newTopTopic));
                    });
                    
                    // Flash the title
                    let originalTitle = document.title;
                    let titleInterval = setInterval(function() {
                        document.title = document.title === originalTitle ? "\u26B9 " + originalTitle : originalTitle;
                    }, 500);
                    
                    // Clear title flashing when notification is closed
                    document.getElementById('closeButton').addEventListener('click', function() {
                        clearInterval(titleInterval);
                        document.title = originalTitle;
                    });
                    
                    // Update stored top topic
                    localStorage.setItem(storageKey, JSON.stringify(newTopTopic));
                } else {
                    setTimeout(checkTopicChange, interval);
                }
            })
            .catch(function(error) {
                console.error("YidTish Helper: Error fetching page:", error);
                // If there's an error, increase the interval and try again
                interval *= 2;
                setTimeout(checkTopicChange, interval);
            });
    };
    
    // Start checking for topic changes
    setTimeout(checkTopicChange, interval);
})();
