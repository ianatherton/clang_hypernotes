#!/bin/bash

# This script adds the c_terms_mapping.js script to all HTML files in the project
# that don't already include it

for file in *.html; do
  # Skip term_linking_test.html as it already has the script
  if [ "$file" == "term_linking_test.html" ]; then
    continue
  fi
  
  # Check if the file already includes c_terms_mapping.js
  if grep -q "c_terms_mapping.js" "$file"; then
    echo "✓ $file already includes c_terms_mapping.js"
  else
    # Add c_terms_mapping.js before hypernotes.js
    if grep -q "hypernotes.js" "$file"; then
      echo "Adding c_terms_mapping.js to $file"
      sed -i 's|<script src="hypernotes.js"></script>|<script src="c_terms_mapping.js"></script>\n    <script src="hypernotes.js"></script>|' "$file"
    else
      echo "! $file doesn't include hypernotes.js, adding both scripts before </body>"
      sed -i 's|</body>|    <script src="c_terms_mapping.js"></script>\n    <script src="hypernotes.js"></script>\n</body>|' "$file"
    fi
  fi
done

echo "Done! C terms mapping script has been added to all HTML files."
