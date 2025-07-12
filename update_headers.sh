#!/bin/bash

# Find all HTML files except index.html (which we've already updated)
HTML_FILES=$(find /home/sparkydev/projects/general_research/clang_hypernotes -name "*.html" -not -name "index.html")

# Loop through each file and update the header
for file in $HTML_FILES; do
  echo "Updating $file..."
  
  # Replace the old highlight controls with the new text field version
  sed -i '/<div class="highlight-controls">/,/<\/div>/ c\
        <div class="highlight-controls">\
            <div class="highlight-option">\
                <input type="text" id="highlight-yellow" placeholder="Neon Yellow Highlight">\
            </div>\
            <div class="highlight-option">\
                <input type="text" id="highlight-green" placeholder="Neon Green Highlight">\
            </div>\
        </div>' "$file"
done

echo "All HTML files updated successfully!"
