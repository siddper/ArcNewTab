chrome.commands.onCommand.addListener(function(command) {
  if (command === "show-popup") {
    // Get all tabs in the current window
    chrome.tabs.query({currentWindow: true}, function(tabs) {
      // Get the current active tab and inject the script with tabs data
      chrome.tabs.query({active: true, currentWindow: true}, function(activeTabs) {
        if (activeTabs[0]) {
          chrome.scripting.executeScript({
            target: {tabId: activeTabs[0].id},
            function: toggleBlackRectangle,
            args: [tabs]
          });
        }
      });
    });
  }
});

// Listen for messages from content script to switch tabs
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'switchToTab') {
    chrome.tabs.update(request.tabId, {active: true});
  } else if (request.action === 'searchOrNavigate') {
    const query = request.query;
    
    // Check if it's a URL - very simple and reliable
    const isUrl = query.includes('.') && !query.includes(' ');
    
    if (isUrl) {
      // It's a URL - navigate directly
      let url = query;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      chrome.tabs.create({ url: url });
    } else {
      // It's a search query - search Google
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      chrome.tabs.create({ url: searchUrl });
    }
  }
});

function toggleBlackRectangle(tabs) {
  // Check if the overlay already exists
  let overlay = document.getElementById('_x_extension_overlay_2024_unique_');
  
  if (overlay) {
    // If it exists, remove it (toggle off)
    overlay.remove();
  } else {
    // If it doesn't exist, create it (toggle on)
    overlay = document.createElement('div');
    overlay.id = '_x_extension_overlay_2024_unique_';
    overlay.style.cssText = `
      all: unset !important;
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      width: 700px !important;
      max-width: 90vw !important;
      background: #2C2C2C !important;
      border: 1px solid #4F4F4F !important;
      border-radius: 12px !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
      z-index: 2147483647 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      box-sizing: border-box !important;
      margin: 0 !important;
      padding: 0 !important;
      line-height: 1 !important;
      text-decoration: none !important;
      list-style: none !important;
      outline: none !important;
      color: inherit !important;
      font-size: 100% !important;
      font: inherit !important;
      vertical-align: baseline !important;
    `;
    
    // Add Inter font with unique ID
    const fontLink = document.createElement('link');
    fontLink.id = '_x_extension_font_2024_unique_';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
    
    // Create the search input with icon
    const searchInput = document.createElement('input');
    searchInput.id = '_x_extension_search_input_2024_unique_';
    searchInput.type = 'text';
    searchInput.placeholder = 'Search or Enter URL...';
    searchInput.style.cssText = `
      all: unset !important;
      width: 100% !important;
      padding: 20px 22px 20px 50px !important;
      background: #1A1A1A !important;
      border: none !important;
      border-bottom: 1px solid #313131 !important;
      color: #E3E4E8 !important;
      font-size: 16px !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
      outline: none !important;
      border-radius: 12px 12px 0 0 !important;
      box-sizing: border-box !important;
      margin: 0 !important;
      line-height: 1 !important;
      text-decoration: none !important;
      list-style: none !important;
      display: block !important;
      vertical-align: baseline !important;
    `;
    
    // Create search icon
    const searchIcon = document.createElement('div');
    searchIcon.id = '_x_extension_search_icon_2024_unique_';
    searchIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E3E4E8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="_x_extension_svg_2024_unique_"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>`;
    searchIcon.style.cssText = `
      all: unset !important;
      position: absolute !important;
      left: 20px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      color: #9CA3AF !important;
      pointer-events: none !important;
      z-index: 1 !important;
      box-sizing: border-box !important;
      margin: 0 !important;
      padding: 0 !important;
      line-height: 1 !important;
      text-decoration: none !important;
      list-style: none !important;
      outline: none !important;
      background: transparent !important;
      font-size: 100% !important;
      font: inherit !important;
      vertical-align: baseline !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    `;

    
    // Add focus styles
    searchInput.addEventListener('focus', function() {
      selectedIndex = -1;
      updateSelection();
    });
    
    searchInput.addEventListener('blur', function() {
      // Don't change selectedIndex here to allow keyboard navigation
    });
    
    // Add click outside to close functionality
    document.addEventListener('click', function(e) {
      if (!overlay.contains(e.target)) {
        overlay.remove();
      }
    });
    
    // Add keyboard navigation
    let selectedIndex = -1; // -1 means input is focused, 0+ means suggestion is selected
    const suggestionItems = [];
    
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overlay) {
        overlay.remove();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (selectedIndex === -1) {
          // Move from input to first suggestion
          selectedIndex = 0;
          searchInput.blur();
        } else {
          // Move to next suggestion
          selectedIndex = (selectedIndex + 1) % suggestionItems.length;
        }
        updateSelection();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (selectedIndex === 0) {
          // Move from first suggestion back to input
          selectedIndex = -1;
          searchInput.focus();
        } else if (selectedIndex === -1) {
          // Move from input to last suggestion
          selectedIndex = suggestionItems.length - 1;
          searchInput.blur();
        } else {
          // Move to previous suggestion
          selectedIndex = selectedIndex - 1;
        }
        updateSelection();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const query = searchInput.value.trim();
        
        if (selectedIndex >= 0 && suggestionItems[selectedIndex]) {
          // Switch to existing tab
          chrome.runtime.sendMessage({
            action: 'switchToTab',
            tabId: tabs[selectedIndex].id
          });
          overlay.remove();
        } else if (query) {
          // Handle search or URL navigation
          chrome.runtime.sendMessage({
            action: 'searchOrNavigate',
            query: query
          });
          overlay.remove();
        }
      }
    });
    
    function updateSelection() {
      suggestionItems.forEach((item, index) => {
        if (index === selectedIndex) {
          // Add selected background
          item.style.setProperty('background-color', '#313131', 'important');
          // Update button color
          const button = item.querySelector('button');
          if (button) {
            button.style.setProperty('color', 'white', 'important');
          }
        } else {
          // Reset to default background
          item.style.setProperty('background-color', '#1A1A1A', 'important');
          // Reset button color
          const button = item.querySelector('button');
          if (button) {
            button.style.setProperty('color', '#656565', 'important');
          }
        }
      });
    }
    
    // Focus the input when created
    setTimeout(() => searchInput.focus(), 100);
    

    
    // Create suggestions container
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.id = '_x_extension_suggestions_container_2024_unique_';
    suggestionsContainer.style.cssText = `
      all: unset !important;
      width: 100% !important;
      overflow-y: auto !important;
      background: #1A1A1A !important;
      border-radius: 0 0 12px 12px !important;
      padding: 8px !important;
      box-sizing: border-box !important;
      display: block !important;
      line-height: 1 !important;
      text-decoration: none !important;
      list-style: none !important;
      outline: none !important;
      color: inherit !important;
      font-size: 100% !important;
      font: inherit !important;
      vertical-align: baseline !important;
    `;

    // Add tab suggestions
    tabs.forEach((tab, index) => {
      const suggestionItem = document.createElement('div');
      suggestionItem.id = `_x_extension_suggestion_item_${index}_2024_unique_`;
      suggestionItem.style.cssText = `
        all: unset !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 12px 16px !important;
        background: #1A1A1A !important;
        border-radius: 8px !important;
        margin-bottom: 4px !important;
        cursor: pointer !important;
        transition: background-color 0.2s ease !important;
        box-sizing: border-box !important;
        margin: 0 0 4px 0 !important;
        line-height: 1 !important;
        text-decoration: none !important;
        list-style: none !important;
        outline: none !important;
        color: inherit !important;
        font-size: 100% !important;
        font: inherit !important;
        vertical-align: baseline !important;
      `;
      
      // Store reference to suggestion item
      suggestionItems.push(suggestionItem);

      // Create left side with icon and title
      const leftSide = document.createElement('div');
      leftSide.id = `_x_extension_left_side_${index}_2024_unique_`;
      leftSide.style.cssText = `
        all: unset !important;
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        flex: 1 !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        padding: 0 !important;
        line-height: 1 !important;
        text-decoration: none !important;
        list-style: none !important;
        outline: none !important;
        background: transparent !important;
        color: inherit !important;
        font-size: 100% !important;
        font: inherit !important;
        vertical-align: baseline !important;
      `;

      // Create favicon
      const favicon = document.createElement('img');
      favicon.id = `_x_extension_favicon_${index}_2024_unique_`;
      favicon.src = tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23E3E4E8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';
      favicon.style.cssText = `
        all: unset !important;
        width: 16px !important;
        height: 16px !important;
        border-radius: 2px !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        padding: 0 !important;
        line-height: 1 !important;
        text-decoration: none !important;
        list-style: none !important;
        outline: none !important;
        background: transparent !important;
        color: inherit !important;
        font-size: 100% !important;
        font: inherit !important;
        vertical-align: baseline !important;
        display: block !important;
      `;

      // Create title
      const title = document.createElement('span');
      title.id = `_x_extension_title_${index}_2024_unique_`;
      title.textContent = tab.title || 'Untitled';
      title.style.cssText = `
        all: unset !important;
        color: #E3E4E8 !important;
        font-size: 14px !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        max-width: 300px !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        padding: 0 !important;
        line-height: 1 !important;
        text-decoration: none !important;
        list-style: none !important;
        outline: none !important;
        background: transparent !important;
        display: inline !important;
        vertical-align: baseline !important;
      `;

      // Create switch button
      const switchButton = document.createElement('button');
      switchButton.id = `_x_extension_switch_button_${index}_2024_unique_`;
      switchButton.textContent = 'Switch to Tab';
      switchButton.style.cssText = `
        all: unset !important;
        background: transparent !important;
        color: #656565 !important;
        border: none !important;
        border-radius: 6px !important;
        font-size: 12px !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
        cursor: pointer !important;
        transition: background-color 0.2s ease !important;
        padding: 6px 12px !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        line-height: 1 !important;
        text-decoration: none !important;
        list-style: none !important;
        outline: none !important;
        display: inline-block !important;
        vertical-align: baseline !important;
      `;

      // Add hover effects
      suggestionItem.addEventListener('mouseenter', function() {
        if (suggestionItems.indexOf(this) !== selectedIndex) {
          this.style.setProperty('background-color', '#313131', 'important');
        }
      });

      suggestionItem.addEventListener('mouseleave', function() {
        if (suggestionItems.indexOf(this) !== selectedIndex) {
          this.style.setProperty('background-color', '#1A1A1A', 'important');
        }
      });

      // Add click handler to switch to tab
      switchButton.addEventListener('click', function(e) {
        e.stopPropagation();
        chrome.runtime.sendMessage({
          action: 'switchToTab',
          tabId: tab.id
        });
        overlay.remove();
      });

      // Add click handler to select item
      suggestionItem.addEventListener('click', function() {
        chrome.runtime.sendMessage({
          action: 'switchToTab',
          tabId: tab.id
        });
        overlay.remove();
      });

      leftSide.appendChild(favicon);
      leftSide.appendChild(title);
      suggestionItem.appendChild(leftSide);
      suggestionItem.appendChild(switchButton);
      suggestionsContainer.appendChild(suggestionItem);
    });
    
    // Position the icon relative to the input
    const inputContainer = document.createElement('div');
    inputContainer.id = '_x_extension_input_container_2024_unique_';
    inputContainer.style.cssText = `
      all: unset !important;
      position: relative !important;
      width: 100% !important;
      box-sizing: border-box !important;
      margin: 0 !important;
      padding: 0 !important;
      line-height: 1 !important;
      text-decoration: none !important;
      list-style: none !important;
      outline: none !important;
      color: inherit !important;
      font-size: 100% !important;
      font: inherit !important;
      vertical-align: baseline !important;
      display: block !important;
    `;
    
    inputContainer.appendChild(searchIcon);
    inputContainer.appendChild(searchInput);
    overlay.appendChild(inputContainer);
    overlay.appendChild(suggestionsContainer);
    document.body.appendChild(overlay);
  }
}
