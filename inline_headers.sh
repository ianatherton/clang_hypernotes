#!/bin/bash

# Define the unified header content
HEADER='    <!-- Header Bar -->
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

# Find all HTML files except header.html and inline_header.html
HTML_FILES=$(find /home/sparkydev/projects/general_research/clang_hypernotes -name "*.html" -not -name "header.html" -not -name "inline_header.html")

# Process each file
for file in $HTML_FILES; do
    echo "Processing $file..."
    
    # Create a temporary file
    temp_file=$(mktemp)
    
    # Process the file line by line
    in_header=0
    header_found=0
    
    while IFS= read -r line; do
        # Check if we're at the body tag
        if [[ "$line" =~ \<body\> ]]; then
            # Print the body tag
            echo "$line" >> "$temp_file"
            # Print the unified header
            echo "$HEADER" >> "$temp_file"
            continue
        fi
        
        # Check if we're at the start of an existing header
        if [[ "$line" =~ \<\!\-\-\ Header\ Bar\ \-\-\> || "$line" =~ \<div\ class=\"header\-bar\"\> ]]; then
            in_header=1
            header_found=1
            continue
        fi
        
        # Check if we're at the end of an existing header
        if [[ $in_header -eq 1 && "$line" =~ \<\/div\> ]]; then
            in_header=0
            continue
        fi
        
        # Skip lines if we're in an existing header
        if [[ $in_header -eq 1 ]]; then
            continue
        fi
        
        # Print all other lines
        echo "$line" >> "$temp_file"
    done < "$file"
    
    # If no header was found, we need to add one after the body tag
    if [[ $header_found -eq 0 ]]; then
        echo "No header found in $file, adding one..."
        # Create another temporary file
        temp_file2=$(mktemp)
        
        # Add header after body tag
        awk '
        /<body>/ {
            print $0;
            print "'"$HEADER"'";
            next;
        }
        { print $0; }
        ' "$temp_file" > "$temp_file2"
        
        # Replace the first temp file with the second
        mv "$temp_file2" "$temp_file"
    fi
    
    # Replace the original file with the processed file
    mv "$temp_file" "$file"
    
    # Remove any header-loader.js script tags
    sed -i '/<!-- Include Header Loader -->/d' "$file"
    sed -i '/<script src="header-loader.js">/d' "$file"
    
    echo "Finished processing $file"
done

echo "All HTML files have been updated with the unified header!"
