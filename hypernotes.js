/**
 * HyperNotes - Enhanced functionality for C Programming Notes
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize search functionality
    initSearch();
    
    // Initialize highlighting functionality
    initHighlighting();
    
    // Initialize flagged sections navigation
    initFlaggedSections();
    
    // Show/hide back-to-top button based on scroll position
    window.addEventListener('scroll', function() {
        const backToTop = document.querySelector('.back-to-top');
        if (window.pageYOffset > 300) {
            backToTop.style.display = 'block';
        } else {
            backToTop.style.display = 'none';
        }
    });
});

/**
 * Search functionality
 */
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchPrev = document.getElementById('search-prev');
    const searchNext = document.getElementById('search-next');
    
    let currentMatch = -1;
    let matches = [];
    
    // Function to perform search
    function performSearch() {
        // Clear previous matches
        clearHighlights('search-highlight');
        
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (!searchTerm) {
            matches = [];
            currentMatch = -1;
            return;
        }
        
        // Store search term in localStorage
        localStorage.setItem('searchTerm', searchTerm);
        
        matches = [];
        currentMatch = -1;
        
        // Get all text nodes in the document body
        const textNodes = getTextNodes(document.body);
        
        // Search for matches in text nodes
        for (let i = 0; i < textNodes.length; i++) {
            const node = textNodes[i];
            const text = node.nodeValue.toLowerCase();
            let startIndex = 0;
            let index;
            
            while ((index = text.indexOf(searchTerm, startIndex)) > -1) {
                matches.push({
                    node: node,
                    index: index,
                    length: searchTerm.length
                });
                startIndex = index + 1;
            }
        }
        
        console.log(`Found ${matches.length} matches for "${searchTerm}"`);
        
        // Highlight first match if any
        if (matches.length > 0) {
            currentMatch = 0;
            highlightMatch(currentMatch);
        }
    }
    
    // Function to highlight a specific match
    function highlightMatch(matchIndex) {
        if (matches.length === 0) return;
        
        // Ensure matchIndex is valid and wraps around
        if (matchIndex < 0) matchIndex = matches.length - 1;
        if (matchIndex >= matches.length) matchIndex = 0;
        
        currentMatch = matchIndex;
        
        // Clear previous highlights
        clearHighlights('search-highlight');
        
        const match = matches[matchIndex];
        
        try {
            // Split text node at match boundaries
            const beforeNode = document.createTextNode(match.node.nodeValue.substring(0, match.index));
            const matchNode = document.createTextNode(match.node.nodeValue.substring(match.index, match.index + match.length));
            const afterNode = document.createTextNode(match.node.nodeValue.substring(match.index + match.length));
            
            // Create highlight span
            const highlightSpan = document.createElement('span');
            highlightSpan.className = 'search-highlight';
            highlightSpan.style.backgroundColor = '#ffff00';
            highlightSpan.style.color = '#000000';
            highlightSpan.appendChild(matchNode);
            
            // Replace original node with new nodes
            const parentNode = match.node.parentNode;
            parentNode.insertBefore(beforeNode, match.node);
            parentNode.insertBefore(highlightSpan, match.node);
            parentNode.insertBefore(afterNode, match.node);
            parentNode.removeChild(match.node);
            
            // Scroll to match
            highlightSpan.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            
            console.log(`Showing match ${currentMatch + 1} of ${matches.length}`);
        } catch (error) {
            console.error('Error highlighting search match:', error);
            // If there's an error, try to recover by performing the search again
            setTimeout(performSearch, 0);
        }
    }
    
    // Function to clear all highlights
    function clearHighlights(className) {
        const highlights = document.querySelectorAll('.' + className);
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.insertBefore(document.createTextNode(highlight.textContent), highlight);
            parent.removeChild(highlight);
        });
        
        // Normalize text nodes
        document.body.normalize();
    }
    
    // Event listeners
    searchInput.addEventListener('input', performSearch);
    
    searchNext.addEventListener('click', function() {
        if (matches.length === 0) return;
        highlightMatch(currentMatch + 1); // Will handle wraparound internally
    });
    
    searchPrev.addEventListener('click', function() {
        if (matches.length === 0) return;
        highlightMatch(currentMatch - 1); // Will handle wraparound internally
    });
    
    // Handle Enter key for search
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                // Shift+Enter for previous match
                searchPrev.click();
            } else {
                // Enter for next match
                searchNext.click();
            }
        }
    });
    
    // Load search term from localStorage if available
    const savedSearchTerm = localStorage.getItem('searchTerm');
    if (savedSearchTerm) {
        searchInput.value = savedSearchTerm;
        setTimeout(performSearch, 100); // Slight delay to ensure DOM is ready
    }
}

/**
 * Highlighting functionality
 */
function initHighlighting() {
    const highlightYellow = document.getElementById('highlight-yellow');
    const highlightGreen = document.getElementById('highlight-green');
    
    // Function to highlight all occurrences of a term
    function highlightAllOccurrences(term, className) {
        if (!term) {
            clearHighlights(className);
            return;
        }
        
        // Clear previous highlights of this class
        clearHighlights(className);
        
        // Get all text nodes in the document body
        const textNodes = getTextNodes(document.body);
        let highlightCount = 0;
        
        // Search for matches in text nodes
        for (let i = 0; i < textNodes.length; i++) {
            let node = textNodes[i];
            const originalNodeValue = node.nodeValue;
            const text = originalNodeValue.toLowerCase();
            const searchTerm = term.toLowerCase();
            let startIndex = 0;
            let index;
            
            // Find all occurrences in this text node
            while ((index = text.indexOf(searchTerm, startIndex)) > -1) {
                highlightCount++;
                
                // Split text node at match boundaries
                const beforeNode = document.createTextNode(originalNodeValue.substring(0, index));
                const matchNode = document.createTextNode(originalNodeValue.substring(index, index + searchTerm.length));
                const afterNode = document.createTextNode(originalNodeValue.substring(index + searchTerm.length));
                
                // Create highlight span
                const highlightSpan = document.createElement('span');
                highlightSpan.className = className;
                highlightSpan.dataset.flagged = 'true';
                highlightSpan.appendChild(matchNode);
                
                // Replace original node with new nodes
                const parentNode = node.parentNode;
                parentNode.insertBefore(beforeNode, node);
                parentNode.insertBefore(highlightSpan, node);
                parentNode.insertBefore(afterNode, node);
                parentNode.removeChild(node);
                
                // Update node reference to continue search
                node = afterNode;
                startIndex = 0;
                break; // Break and process next text node to avoid infinite loop
            }
        }
        
        console.log(`Highlighted ${highlightCount} occurrences of "${term}" with class ${className}`);
        
        // Update flagged sections dropdown
        updateFlaggedSections();
        
        // Normalize text nodes to fix any issues
        document.body.normalize();
        
        // Re-run the highlighting to catch any missed occurrences
        // This is needed because the DOM structure changes during highlighting
        if (highlightCount > 0) {
            setTimeout(() => highlightAllOccurrences(term, className), 0);
        }
    }
    
    // Store highlight terms between page loads
    function storeHighlightTerms() {
        localStorage.setItem('highlightYellowTerm', highlightYellow.value);
        localStorage.setItem('highlightGreenTerm', highlightGreen.value);
    }
    
    // Load highlight terms from storage
    function loadHighlightTerms() {
        const yellowTerm = localStorage.getItem('highlightYellowTerm');
        const greenTerm = localStorage.getItem('highlightGreenTerm');
        
        if (yellowTerm) {
            highlightYellow.value = yellowTerm;
            highlightAllOccurrences(yellowTerm, 'highlight-yellow');
        }
        
        if (greenTerm) {
            highlightGreen.value = greenTerm;
            highlightAllOccurrences(greenTerm, 'highlight-green');
        }
    }
    
    // Event listeners for highlight text fields
    highlightYellow.addEventListener('input', function() {
        highlightAllOccurrences(this.value, 'highlight-yellow');
        storeHighlightTerms();
    });
    
    highlightGreen.addEventListener('input', function() {
        highlightAllOccurrences(this.value, 'highlight-green');
        storeHighlightTerms();
    });
    
    // Load highlight terms on initialization
    setTimeout(loadHighlightTerms, 100); // Slight delay to ensure DOM is ready
}

/**
 * Flagged sections navigation
 */
function initFlaggedSections() {
    const flaggedSelect = document.getElementById('flagged-select');
    
    // Event listener for flagged sections dropdown
    flaggedSelect.addEventListener('change', function() {
        const selectedValue = this.value;
        if (!selectedValue) return;
        
        // Get the selected element and scroll to it
        const element = document.querySelector(`[data-flagged-id="${selectedValue}"]`);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    });
    
    // Initial update of flagged sections
    updateFlaggedSections();
}

/**
 * Update flagged sections dropdown
 */
function updateFlaggedSections() {
    const flaggedSelect = document.getElementById('flagged-select');
    const flaggedElements = document.querySelectorAll('[data-flagged="true"]');
    
    // Clear existing options except the first one
    while (flaggedSelect.options.length > 1) {
        flaggedSelect.remove(1);
    }
    
    // Add options for each flagged element
    flaggedElements.forEach((element, index) => {
        // Generate a unique ID for the flagged element if it doesn't have one
        if (!element.dataset.flaggedId) {
            element.dataset.flaggedId = 'flagged-' + index;
        }
        
        // Get text content for the option
        let optionText = element.textContent.trim();
        if (optionText.length > 30) {
            optionText = optionText.substring(0, 30) + '...';
        }
        
        // Add class name to option text
        if (element.classList.contains('highlight-yellow')) {
            optionText = '🟡 ' + optionText;
        } else if (element.classList.contains('highlight-green')) {
            optionText = '🟢 ' + optionText;
        }
        
        // Create and add option
        const option = document.createElement('option');
        option.value = element.dataset.flaggedId;
        option.textContent = optionText;
        flaggedSelect.appendChild(option);
    });
}

/**
 * Helper function to get all text nodes in an element
 */
function getTextNodes(element) {
    const textNodes = [];
    
    function getTextNodesRecursive(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            // Skip empty text nodes
            if (node.nodeValue.trim() !== '') {
                textNodes.push(node);
            }
        } else {
            // Skip script and style elements
            if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
                for (let i = 0; i < node.childNodes.length; i++) {
                    getTextNodesRecursive(node.childNodes[i]);
                }
            }
        }
    }
    
    getTextNodesRecursive(element);
    return textNodes;
}
