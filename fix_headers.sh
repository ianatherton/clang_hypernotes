#!/bin/bash

# Store the header content in a variable
HEADER='<!-- Header Bar -->
<div class="header-bar">
    <div class="search-container">
        <input type="text" id="search-input" placeholder="Search...">
        <button id="search-prev">↑</button>
        <button id="search-next">↓</button>
    </div>
    <div class="highlight-controls">
        <div class="highlight-option">
            <input type="text" id="highlight-yellow" placeholder="Neon Yellow Highlight">
        </div>
        <div class="highlight-option">
            <input type="text" id="highlight-green" placeholder="Neon Green Highlight">
        </div>
    </div>
    <div class="flagged-sections">
        <label for="flagged-select">Jump to:</label>
        <select id="flagged-select">
            <option value="">-- Flagged Sections --</option>
        </select>
    </div>
</div>'

# Find all HTML files
HTML_FILES=$(find /home/sparkydev/projects/general_research/clang_hypernotes -name "*.html" -not -name "header.html" -not -name "inline_header.html")

# Loop through each file and update the header
for file in $HTML_FILES; do
  echo "Updating $file..."
  
  # Create a temporary file
  TMP_FILE=$(mktemp)
  
  # Process the file
  awk '
  BEGIN { header_found = 0; header_printed = 0; }
  
  # Print the header after <body> tag
  /<body>/ {
    print $0;
    printf "    '"$HEADER"'\n";
    header_printed = 1;
    next;
  }
  
  # Skip the old header container or header bar
  /<div id="header-container">/ || /<div class="header-bar">/ {
    header_found = 1;
    next;
  }
  
  # Skip lines until we reach the end of the header section
  header_found == 1 && /<\/div>/ {
    header_found = 0;
    next;
  }
  
  # Skip lines if we are in the header section
  header_found == 1 {
    next;
  }
  
  # Skip header loader script
  /<!-- Include Header Loader -->/ || /script src="header-loader.js"/ {
    next;
  }
  
  # Print all other lines
  { print $0; }
  ' "$file" > "$TMP_FILE"
  
  # Replace the original file with the processed file
  mv "$TMP_FILE" "$file"
done

echo "All HTML files updated successfully!"
