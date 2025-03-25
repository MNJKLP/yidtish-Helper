// Function to setup sticky post buttons
function setupStickyPostButtons() {
  // Find all posts on the page
  const posts = document.querySelectorAll('.post');
  
  // Process each post
  posts.forEach(post => {
    const postButtons = post.querySelector('.post-buttons');
    const postContent = post.querySelector('.postbody');
    
    if (!postButtons || !postContent) return;
    
    // Store original position data
    const originalRect = postButtons.getBoundingClientRect();
    const originalRight = originalRect.right;
    const windowWidth = window.innerWidth;
    let rightOffset = windowWidth - originalRight;  // Initialize rightOffset
    
    // Track whether buttons are sticky
    let isSticky = false;
    
    // Function to update button position
    function updateButtonPosition() {
      const postRect = postContent.getBoundingClientRect();
      const postTop = postRect.top;
      const postBottom = postRect.bottom;
      
      // Check if we should make buttons sticky
      if (postTop < 20 && postBottom > postButtons.offsetHeight + 20) {
        if (!isSticky) {
          // Make buttons sticky
          postButtons.style.position = 'fixed';
          postButtons.style.top = '5px';
          postButtons.style.right = rightOffset + 'px';  // Keep buttons in place horizontally
          postButtons.style.zIndex = '100';
          postButtons.style.backgroundColor = 'transparent'; // Remove background color
          postButtons.style.border = 'none'; // Remove border
          postButtons.style.padding = '4px 4px 4px 7px';
          postButtons.style.borderRadius = '4px';
          postButtons.style.boxShadow = 'none'; // Remove any box-shadow
          postButtons.style.backdropFilter = 'none'; // Remove backdrop filter if applied
          isSticky = true;
        }
      } else {
        if (isSticky) {
          // Reset to original
          postButtons.style.position = '';
          postButtons.style.top = '';
          postButtons.style.right = '';
          postButtons.style.zIndex = '';
          postButtons.style.backgroundColor = '';
          postButtons.style.border = '';
          postButtons.style.padding = '';
          postButtons.style.borderRadius = '';
          postButtons.style.boxShadow = ''; // Reset any box-shadow
          postButtons.style.backdropFilter = ''; // Reset backdrop filter
          isSticky = false;
        }
      }
    }
    
    // Add scroll event listener
    window.addEventListener('scroll', updateButtonPosition);
    
    // Initial position check
    updateButtonPosition();
    
    // Handle window resize
    window.addEventListener('resize', () => {
      // Recalculate right offset if not sticky
      if (!isSticky) {
        const newRect = postButtons.getBoundingClientRect();
        const newRight = newRect.right;
        const newWindowWidth = window.innerWidth;
        rightOffset = newWindowWidth - newRight;
      }
      
      // Update position if sticky
      if (isSticky) {
        postButtons.style.right = rightOffset + 'px';
      }
    });
  });
}

// Run on page load and after any AJAX content loads
function initializeScript() {
  setupStickyPostButtons();
  
  // Monitor for dynamically added content
  const observer = new MutationObserver(mutations => {
    let shouldReinit = false;
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length) {
        shouldReinit = true;
      }
    });
    if (shouldReinit) {
      setupStickyPostButtons();
    }
  });
  
  // Observe the entire document for changes
  observer.observe(document.body, { childList: true, subtree: true });
}

// Run when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeScript);
} else {
  initializeScript();
}
