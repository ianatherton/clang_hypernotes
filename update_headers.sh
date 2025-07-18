#!/bin/bash

# Find all HTML files except the ones we've already updated (index.html and operators.html)
HTML_FILES=$(find /home/sparkydev/projects/general_research/clang_hypernotes -name "*.html" -not -name "index.html" -not -name "operators.html" -not -name "header.html")

# Loop through each file and update the header
for file in $HTML_FILES; do
  echo "Updating $file..."
  
  # Replace the entire header bar with a container div
  sed -i '/<\!-- Header Bar -->/,/<\/div>\s*$/ c\
    <!-- Header Container - Will be populated by header-loader.js -->\
    <div id="header-container"></div>' "$file"
  
  # Add the header-loader.js script before the closing body tag if it doesn't exist
  if ! grep -q "header-loader.js" "$file"; then
    sed -i '/<script src="hypernotes.js"><\/script>/a \
    <!-- Include Header Loader -->\
    <script src="header-loader.js"></script>' "$file"
  fi
done

echo "All HTML files updated successfully!"
