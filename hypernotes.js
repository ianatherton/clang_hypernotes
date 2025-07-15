/**
 * HyperNotes - Enhanced functionality for C Programming Notes
 * 
 * This library provides interactive features for C programming documentation:
 * - Search functionality with highlighting and navigation
 * - Text highlighting for important terms
 * - Flagged sections navigation
 * - (Future) Reserved word linking to definitions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize search functionality
    initSearch();
    
    // Initialize highlighting functionality
    initHighlighting();
    
    // Initialize flagged sections navigation
    initFlaggedSections();
    
    // Initialize reserved word linking (preparation phase)
    initReservedWordLinking();
    
    // Initialize header management
    initHeaderManagement();
    
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
 * 
 * Provides real-time search capabilities within documentation pages.
 * Features include:
 * - Incremental search as you type
 * - Navigation between search results
 * - Persistent search terms across page loads
 * - Keyboard shortcuts (Enter for next, Shift+Enter for previous)
 */
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchPrev = document.getElementById('search-prev');
    const searchNext = document.getElementById('search-next');
    
    let currentMatch = -1;
    let matches = [];
    
    /**
     * Performs search across the document's text nodes
     * Clears previous highlights, finds all matches for the search term,
     * and highlights the first match if any are found
     */
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
    
    /**
     * Highlights a specific search match and scrolls to it
     * @param {number} matchIndex - Index of the match to highlight
     */
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
    
    /**
     * Clears all highlights of a specific class from the document
     * @param {string} className - CSS class name of highlights to clear
     */
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
 * Text Highlighting Module
 * 
 * A simple, modular, and performant text highlighting system that works across all pages.
 * Features:
 * - Single highlight color for simplicity
 * - Efficient DOM manipulation
 * - Easy to enable/disable
 * - Automatic flagging of highlighted terms for navigation
 */
function initHighlighting() {
    // Get highlight input element
    const highlightInput = document.getElementById('highlight-input');
    const highlightButton = document.getElementById('highlight-button');
    
    if (!highlightInput || !highlightButton) {
        console.log('Highlighting elements not found in DOM');
        return;
    }
    
    // Load saved highlights from localStorage
    loadSavedHighlights();
    
    // Add event listeners
    highlightButton.addEventListener('click', function() {
        const term = highlightInput.value.trim();
        if (term) {
            highlightAllOccurrences(term);
            highlightInput.value = ''; // Clear the input after highlighting
        }
    });
    
    // Allow pressing Enter to highlight
    highlightInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            highlightButton.click();
        }
    });
    
    console.log('Text highlighting module initialized');
}

/**
 * Highlights all occurrences of a term in the document
 * @param {string} term - The term to highlight
 */
function highlightAllOccurrences(term) {
    const termLower = term.toLowerCase();
    const textNodes = getTextNodes(document.body);
    let highlightCount = 0;
    
    // Get existing highlights from localStorage
    let savedHighlights = JSON.parse(localStorage.getItem('savedHighlights') || '[]');
    
    // Check if term is already highlighted
    if (savedHighlights.includes(termLower)) {
        console.log(`Term "${term}" is already highlighted`);
        return;
    }
    
    // Add term to saved highlights
    savedHighlights.push(termLower);
    localStorage.setItem('savedHighlights', JSON.stringify(savedHighlights));
    
    // Process each text node
    textNodes.forEach(node => {
        const text = node.nodeValue;
        const textLower = text.toLowerCase();
        let startIndex = 0;
        let index;
        
        // Find all occurrences of the term in this text node
        while ((index = textLower.indexOf(termLower, startIndex)) > -1) {
            // Split the node into before, match, and after parts
            const beforeNode = document.createTextNode(text.substring(0, index));
            const matchText = text.substring(index, index + term.length);
            const matchNode = document.createTextNode(matchText);
            const afterNode = document.createTextNode(text.substring(index + term.length));
            
            // Create highlight span
            const highlightSpan = document.createElement('span');
            highlightSpan.className = 'text-highlight';
            highlightSpan.dataset.flagged = 'true';
            highlightSpan.dataset.term = termLower;
            highlightSpan.appendChild(matchNode);
            
            // Replace original node with new nodes
            const parentNode = node.parentNode;
            parentNode.insertBefore(beforeNode, node);
            parentNode.insertBefore(highlightSpan, node);
            parentNode.insertBefore(afterNode, node);
            parentNode.removeChild(node);
            
            // Continue with the remaining text
            node = afterNode;
            textLower = node.nodeValue.toLowerCase();
            startIndex = 0;
            highlightCount++;
        }
    });
    
    // Update flagged sections dropdown
    updateFlaggedSections();
    
    console.log(`Highlighted ${highlightCount} occurrences of "${term}"`);
}

/**
 * Loads and applies saved highlights from localStorage
 */
function loadSavedHighlights() {
    const savedHighlights = JSON.parse(localStorage.getItem('savedHighlights') || '[]');
    
    if (savedHighlights.length > 0) {
        console.log(`Loading ${savedHighlights.length} saved highlights`);
        savedHighlights.forEach(term => highlightAllOccurrences(term));
    }
}

/**
 * Removes all highlights for a specific term
 * @param {string} term - The term to remove highlights for
 */
function removeHighlights(term) {
    const termLower = term.toLowerCase();
    const highlights = document.querySelectorAll(`.text-highlight[data-term="${termLower}"]`);
    
    highlights.forEach(highlight => {
        const parent = highlight.parentNode;
        parent.insertBefore(document.createTextNode(highlight.textContent), highlight);
        parent.removeChild(highlight);
    });
    
    // Remove from saved highlights
    let savedHighlights = JSON.parse(localStorage.getItem('savedHighlights') || '[]');
    savedHighlights = savedHighlights.filter(t => t !== termLower);
    localStorage.setItem('savedHighlights', JSON.stringify(savedHighlights));
    
    // Normalize text nodes
    document.body.normalize();
    
    // Update flagged sections dropdown
    updateFlaggedSections();
    
    console.log(`Removed all highlights for "${term}"`);
}

/**
 * Flagged sections navigation
 * 
 * Provides a dropdown menu to quickly navigate to important sections.
 * Sections can be flagged through highlighting or by adding data-flagged="true"
 * attribute to HTML elements.
 * 
 * (Future) Will include navigation to reserved word definitions.
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
 * 
 * Scans the document for flagged elements and populates the dropdown.
 * Each flagged element receives a unique ID for navigation purposes.
 * Highlighted terms are indicated with a highlight emoji prefix.
 * 
 * (Future) Will include reserved words with special indicators.
 */
function updateFlaggedSections() {
    const flaggedSelect = document.getElementById('flagged-select');
    if (!flaggedSelect) return;
    
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
        if (element.classList.contains('text-highlight')) {
            optionText = '🔍 ' + optionText;
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
 * 
 * Recursively traverses the DOM to find all text nodes.
 * Skips empty text nodes and nodes within script and style elements.
 * 
 * @param {Element} element - The root element to search within
 * @returns {Array} - Array of text nodes found
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

/**
 * Header Management
 * 
 * Ensures the fixed header is consistent across all pages and properly aligned.
 * Handles the display and positioning of header elements.
 */
function initHeaderManagement() {
    // Ensure consistent header appearance across pages
    const headerBar = document.querySelector('.header-bar');
    if (!headerBar) return;
    
    // Fix alignment of flagged sections dropdown
    const flaggedSections = document.querySelector('.flagged-sections');
    if (flaggedSections) {
        flaggedSections.style.marginLeft = 'auto'; // Push to the right side
    }
    
    console.log('Header management initialized');
}

/**
 * Reserved Word Linking Functionality
 * 
 * Prepares C language reserved words for future linking to their definitions.
 * This functionality will scan the document for C keywords and other reserved words,
 * and prepare them for interactive linking to their respective documentation sections.
 */
function initReservedWordLinking() {
    // List of C reserved keywords to be linked
    const cKeywords = [
        'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 'double', 
        'else', 'enum', 'extern', 'float', 'for', 'goto', 'if', 'int', 'long', 'register', 
        'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef', 
        'union', 'unsigned', 'void', 'volatile', 'while'
    ];
    
    // List of common C library functions that might be documented
    const cLibraryFunctions = [
        'printf', 'scanf', 'malloc', 'free', 'calloc', 'realloc', 'strlen', 'strcpy', 
        'strcat', 'strcmp', 'memcpy', 'memset', 'fopen', 'fclose', 'fread', 'fwrite', 
        'fprintf', 'fscanf', 'exit'
    ];
    
    // List of C preprocessor directives
    const cPreprocessor = [
        '#include', '#define', '#ifdef', '#ifndef', '#endif', '#if', '#else', '#elif', 
        '#pragma', '#undef', '#error', '#line'
    ];
    
    /**
     * Identifies all code elements that contain reserved words
     * This is a preparation step for future linking functionality
     */
    function identifyReservedWords() {
        // Find all code elements that might contain reserved words
        const codeElements = document.querySelectorAll('code, .keyword, .function, .preprocessor');
        
        codeElements.forEach(element => {
            const text = element.textContent.trim();
            
            // Check if the element contains a C keyword
            if (cKeywords.includes(text)) {
                element.dataset.reservedType = 'keyword';
                element.dataset.reserved = 'true';
                console.log(`Found keyword: ${text}`);
            }
            // Check if the element contains a C library function
            else if (cLibraryFunctions.includes(text)) {
                element.dataset.reservedType = 'function';
                element.dataset.reserved = 'true';
                console.log(`Found function: ${text}`);
            }
            // Check if the element contains a preprocessor directive
            else if (cPreprocessor.some(directive => text.startsWith(directive))) {
                element.dataset.reservedType = 'preprocessor';
                element.dataset.reserved = 'true';
                console.log(`Found preprocessor: ${text}`);
            }
        });
        
        // Log the total count of identified reserved words
        const reservedElements = document.querySelectorAll('[data-reserved="true"]');
        console.log(`Identified ${reservedElements.length} reserved words for future linking`);
    }
    
    // Run the identification process after a short delay to ensure DOM is ready
    setTimeout(identifyReservedWords, 200);
}
