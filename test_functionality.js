/**
 * Test script to verify search and highlight functionality
 * Open browser console and run this script to test functionality
 */

function testSearchAndHighlight() {
    console.log('=== Testing Search and Highlight Functionality ===');
    
    // Test search functionality
    const searchInput = document.getElementById('search-input');
    const searchNext = document.getElementById('search-next');
    const searchPrev = document.getElementById('search-prev');
    
    // Test highlight functionality
    const highlightYellow = document.getElementById('highlight-yellow');
    const highlightGreen = document.getElementById('highlight-green');
    
    console.log('1. Testing search functionality...');
    searchInput.value = 'function';
    
    // Trigger input event
    const inputEvent = new Event('input', { bubbles: true });
    searchInput.dispatchEvent(inputEvent);
    
    // Wait for search to complete
    setTimeout(() => {
        console.log('2. Testing search navigation...');
        // Click next a few times
        searchNext.click();
        setTimeout(() => {
            searchNext.click();
            setTimeout(() => {
                // Click previous to test wraparound
                searchPrev.click();
                setTimeout(() => {
                    console.log('3. Testing yellow highlighting...');
                    // Test yellow highlighting
                    highlightYellow.value = 'int';
                    highlightYellow.dispatchEvent(inputEvent);
                    
                    setTimeout(() => {
                        console.log('4. Testing green highlighting...');
                        // Test green highlighting
                        highlightGreen.value = 'return';
                        highlightGreen.dispatchEvent(inputEvent);
                        
                        console.log('5. Testing persistence...');
                        console.log('Local storage values:');
                        console.log('- Search term:', localStorage.getItem('searchTerm'));
                        console.log('- Yellow highlight:', localStorage.getItem('highlightYellowTerm'));
                        console.log('- Green highlight:', localStorage.getItem('highlightGreenTerm'));
                        
                        console.log('=== Test complete! ===');
                        console.log('Please navigate to another page to verify persistence.');
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 1000);
    }, 1000);
}

// Run the test
testSearchAndHighlight();
