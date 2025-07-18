#!/bin/bash

# Read the inline header content
HEADER_CONTENT=$(cat inline_header.html)
# Escape special characters for sed
HEADER_CONTENT_ESCAPED=$(echo "$HEADER_CONTENT" | sed -e 's/[\/&]/\\&/g')

# Find all HTML files
HTML_FILES=$(find /home/sparkydev/projects/general_research/clang_hypernotes -name "*.html" -not -name "header.html" -not -name "inline_header.html")

# Loop through each file and update the header
for file in $HTML_FILES; do
  echo "Updating $file..."
  
  # Replace the header container div with the actual header content
  sed -i "s/<!-- Header Container - Will be populated by header-loader.js -->\n    <div id=\"header-container\"><\/div>/$HEADER_CONTENT_ESCAPED/" "$file"
  
  # Remove the header-loader.js script reference if it exists
  sed -i '/<!-- Include Header Loader -->/d' "$file"
  sed -i '/script src="header-loader.js"/d' "$file"
done

echo "All HTML files updated successfully!"
