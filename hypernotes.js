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
        if (!searchTerm) return;
        
        matches = [];
        currentMatch = -1;
        
        // Get all text nodes in the document body
        const textNodes = getTextNodes(document.body);
        
        // Search for matches in text nodes
        textNodes.forEach(node => {
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
        });
        
        // Highlight first match if any
        if (matches.length > 0) {
            currentMatch = 0;
            highlightMatch(currentMatch);
        }
    }
    
    // Function to highlight a specific match
    function highlightMatch(matchIndex) {
        if (matchIndex < 0 || matchIndex >= matches.length) return;
        
        const match = matches[matchIndex];
        
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
        
        clearHighlights('search-highlight');
        currentMatch = (currentMatch + 1) % matches.length;
        highlightMatch(currentMatch);
    });
    
    searchPrev.addEventListener('click', function() {
        if (matches.length === 0) return;
        
        clearHighlights('search-highlight');
        currentMatch = (currentMatch - 1 + matches.length) % matches.length;
        highlightMatch(currentMatch);
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
}

/**
 * Highlighting functionality
 */
function initHighlighting() {
    const highlightYellow = document.getElementById('highlight-yellow');
    const highlightGreen = document.getElementById('highlight-green');
    
    let activeHighlightClass = null;
    
    // Function to handle text selection highlighting
    function handleTextSelection() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        if (range.collapsed) return;
        
        try {
            // Create highlight span
            const highlightSpan = document.createElement('span');
            highlightSpan.className = activeHighlightClass;
            highlightSpan.dataset.flagged = 'true';
            
            // Handle complex selections that might span multiple elements
            const contents = range.extractContents();
            highlightSpan.appendChild(contents);
            range.insertNode(highlightSpan);
            
            // Clear selection
            selection.removeAllRanges();
            
            // Update flagged sections dropdown
            updateFlaggedSections();
        } catch (error) {
            console.error('Error highlighting text:', error);
        }
    }
    
    // Event listeners for highlight checkboxes
    highlightYellow.addEventListener('change', function() {
        if (this.checked) {
            highlightGreen.checked = false;
            activeHighlightClass = 'highlight-yellow';
            document.addEventListener('mouseup', handleTextSelection);
        } else {
            activeHighlightClass = null;
            document.removeEventListener('mouseup', handleTextSelection);
        }
    });
    
    highlightGreen.addEventListener('change', function() {
        if (this.checked) {
            highlightYellow.checked = false;
            activeHighlightClass = 'highlight-green';
            document.addEventListener('mouseup', handleTextSelection);
        } else {
            activeHighlightClass = null;
            document.removeEventListener('mouseup', handleTextSelection);
        }
    });
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
