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
 * C Term Linking Functionality
 * 
 * Links C language terms to their definitions throughout the documentation.
 * This functionality scans the document for C keywords, library functions, and other terms,
 * and converts them into hyperlinks to their respective documentation sections.
 */
function initReservedWordLinking() {
    /**
     * Check if the C_TERMS_MAPPING is available, if not, load it dynamically
     */
    function ensureTermsMappingLoaded() {
        return new Promise((resolve, reject) => {
            if (typeof C_TERMS_MAPPING !== 'undefined') {
                resolve(C_TERMS_MAPPING);
                return;
            }
            
            // If mapping isn't loaded, load it dynamically
            const script = document.createElement('script');
            script.src = 'c_terms_mapping.js';
            script.onload = () => {
                if (typeof C_TERMS_MAPPING !== 'undefined') {
                    resolve(C_TERMS_MAPPING);
                } else {
                    reject(new Error('C_TERMS_MAPPING not found after loading script'));
                }
            };
            script.onerror = () => reject(new Error('Failed to load c_terms_mapping.js'));
            document.head.appendChild(script);
        });
    }
    
    /**
     * Creates a hyperlink for a term
     * @param {Element} element - The DOM element containing the term
     * @param {string} term - The term to link
     * @param {Object} mapping - The mapping information for the term
     */
    function createTermLink(element, term, mapping) {
        // Don't link if element is already a link or inside a link
        if (element.tagName === 'A' || element.closest('a')) {
            return;
        }
        
        // Don't link if element is inside a code block
        if (element.closest('.code-block')) {
            return;
        }
        
        // Create the link
        const link = document.createElement('a');
        link.href = `${mapping.page}#${mapping.anchor}`;
        link.title = mapping.title;
        link.className = 'term-link';
        link.dataset.term = term;
        link.textContent = element.textContent;
        
        // Replace the element with the link
        element.parentNode.replaceChild(link, element);
        
        return link;
    }
    
    /**
     * Identifies and links all code elements and text nodes that contain C terms
     */
    async function linkCTerms() {
        try {
            // Get the terms mapping
            const termsMapping = await ensureTermsMappingLoaded();
            
            // Track statistics
            let linkedCount = 0;
            
            // First, handle elements with specific classes that are likely to contain C terms
            const codeElements = document.querySelectorAll('code, .keyword, .function, .preprocessor, .datatype');
            
            codeElements.forEach(element => {
                const text = element.textContent.trim();
                
                // Skip if empty or too long (likely not a simple term)
                if (!text || text.length > 30) return;
                
                // Check if this term is in our mapping
                if (termsMapping[text]) {
                    const link = createTermLink(element, text, termsMapping[text]);
                    if (link) linkedCount++;
                }
            });
            
            // Now look for terms in paragraph text (more selective to avoid over-linking)
            const paragraphs = document.querySelectorAll('p, li, td, th, h1, h2, h3, h4, h5, h6');
            
            // List of important concept terms to find in regular text
            // We're more selective here to avoid over-linking
            const importantConcepts = [
                'pointer', 'array', 'string', 'structure', 'function', 'macro',
                'recursion', 'parameter', 'argument', 'prototype', 'memory leak',
                'buffer overflow', 'null pointer', 'dangling pointer', 'segmentation fault',
                'undefined behavior', 'stack', 'heap', 'function pointer', 'callback',
                'errno', 'file pointer', 'stream', 'binary file', 'text file'
            ];
            
            // For each paragraph, look for these important terms
            paragraphs.forEach(paragraph => {
                // Skip if inside a code block
                if (paragraph.closest('.code-block')) return;
                
                // Get all text nodes in this paragraph
                const textNodes = getTextNodesInElement(paragraph);
                
                textNodes.forEach(textNode => {
                    const text = textNode.nodeValue;
                    
                    // Look for each important concept in this text node
                    importantConcepts.forEach(concept => {
                        if (!termsMapping[concept]) return;
                        
                        // Look for the concept with word boundaries
                        const regex = new RegExp(`\\b${concept}\\b`, 'i');
                        const match = text.match(regex);
                        
                        if (match) {
                            // Split the text node at the match
                            const index = match.index;
                            const matchedText = match[0];
                            
                            // Create text nodes for before and after the match
                            const beforeNode = document.createTextNode(text.substring(0, index));
                            const afterNode = document.createTextNode(text.substring(index + matchedText.length));
                            
                            // Create a span for the matched text
                            const matchSpan = document.createElement('span');
                            matchSpan.textContent = matchedText;
                            
                            // Create a link for the matched text
                            const link = createTermLink(matchSpan, concept, termsMapping[concept]);
                            if (link) linkedCount++;
                            
                            // Replace the text node with the new nodes
                            const parent = textNode.parentNode;
                            parent.insertBefore(beforeNode, textNode);
                            parent.insertBefore(link || matchSpan, textNode);
                            parent.insertBefore(afterNode, textNode);
                            parent.removeChild(textNode);
                        }
                    });
                });
            });
            
            console.log(`Linked ${linkedCount} C terms to their definitions`);
            
            // Add CSS for term links if not already present
            if (!document.getElementById('term-link-styles')) {
                const style = document.createElement('style');
                style.id = 'term-link-styles';
                style.textContent = `
                    .term-link {
                        color: #0066cc;
                        text-decoration: none;
                        border-bottom: 1px dotted #0066cc;
                        cursor: help;
                    }
                    .term-link:hover {
                        color: #004499;
                        border-bottom: 1px solid #004499;
                    }
                `;
                document.head.appendChild(style);
            }
        } catch (error) {
            console.error('Error linking C terms:', error);
        }
    }
    
    /**
     * Gets all text nodes within an element
     * @param {Element} element - The element to search within
     * @returns {Array} - Array of text nodes
     */
    function getTextNodesInElement(element) {
        const textNodes = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            { acceptNode: node => node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT },
            false
        );
        
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        return textNodes;
    }
    
    // Run the linking process after a short delay to ensure DOM is ready
    setTimeout(linkCTerms, 500);
}
