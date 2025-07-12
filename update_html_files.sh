#!/bin/bash

# List of HTML files to update
HTML_FILES=(
  "c_basics.html"
  "control_flow.html"
  "data_types.html"
  "functions.html"
  "memory_management.html"
  "pointers.html"
  "structures.html"
)

# Header bar HTML to insert
HEADER_BAR='<!-- Header Bar -->
    <div class="header-bar">
        <div class="search-container">
            <input type="text" id="search-input" placeholder="Search...">
            <button id="search-prev">↑</button>
            <button id="search-next">↓</button>
        </div>
        <div class="highlight-controls">
            <div class="highlight-option">
                <input type="checkbox" id="highlight-yellow">
                <label for="highlight-yellow">Neon Yellow</label>
            </div>
            <div class="highlight-option">
                <input type="checkbox" id="highlight-green">
                <label for="highlight-green">Neon Green</label>
            </div>
        </div>
        <div class="flagged-sections">
            <label for="flagged-select">Jump to:</label>
            <select id="flagged-select">
                <option value="">-- Flagged Sections --</option>
            </select>
        </div>
    </div>'

# Script tag to insert
SCRIPT_TAG='
    <!-- Include HyperNotes enhanced functionality -->
    <script src="hypernotes.js"></script>'

# Process each HTML file
for file in "${HTML_FILES[@]}"; do
  echo "Processing $file..."
  
  # Add header bar after <body> tag
  sed -i "/<body>/a\\
$HEADER_BAR" "$file"
  
  # Add script tag before </body> tag
  sed -i "s|</body>|$SCRIPT_TAG\\
</body>|" "$file"
  
  # Check if the file has a link to styles.css
  if ! grep -q '<link rel="stylesheet" href="styles.css">' "$file"; then
    # Add styles.css link if it doesn't exist
    sed -i '/<head>/a\\
    <link rel="stylesheet" href="styles.css">' "$file"
  fi
  
  echo "Updated $file"
done

echo "All HTML files have been updated!"
