# C Programming Hyper-Notes

A comprehensive interactive wiki guide for C99 programming language, from beginner to advanced levels.

## Overview

C Programming Hyper-Notes is a detailed reference guide designed to help programmers understand and master the C programming language (C99 standard). The guide covers everything from basic concepts to advanced techniques, with interactive features that enhance the learning experience.

## Features

- **Comprehensive Coverage**: From basic syntax to advanced topics like memory management and preprocessor directives
- **Interactive Search**: Quickly find specific topics or keywords throughout the guide
- **Highlighting System**: Mark important sections with customizable highlights
- **Flagged Sections**: Bookmark and jump to important sections
- **Term Linking**: Automatic linking of C programming terms for quick reference
- **Responsive Design**: Works well on both desktop and mobile devices

## Content Structure

The guide is organized into logical sections:

- Introduction to C
- C Basics (Program Structure, Compilation Process, Basic Syntax)
- Data Types (Primitive, Derived, User-defined, Variables, Type Conversion)
- Operators (Arithmetic, Relational, Logical, Bitwise, Assignment)
- Control Flow (if-else, switch, loops, break/continue)
- Functions (Declaration, Parameters, Return Values, Recursion)
- Arrays (Declaration, Multi-dimensional Arrays, Array Operations)
- Pointers (Basics, Pointer Arithmetic, Pointers and Arrays)
- Strings (String Basics, String Functions, String Manipulation)
- Structures (Structure Basics, Nested Structures, Structure Padding)
- Unions (Union Basics, Union vs Structures, Applications)
- Enumerations (Enum Basics, Enum Applications)
- Preprocessor (Directives, Macros, Conditional Compilation)
- Standard Library (Standard I/O, Math Functions, String Functions)
- File I/O (Text Files, Binary Files, Error Handling)
- Memory Management (Dynamic Memory Allocation, Memory Leaks)
- Error Handling (Return Codes, errno, setjmp/longjmp)
- Debugging Techniques
- Best Practices (Code Organization, Naming Conventions)

## Usage

1. Open `index.html` in your web browser to access the main page
2. Use the Table of Contents to navigate to specific topics
3. Use the search bar to find specific terms or concepts
4. Highlight important information using the highlight controls
5. Bookmark sections using the flagging system

## Development

This project uses vanilla HTML, CSS, and JavaScript with no external dependencies.

### Key Files

- `index.html` - Main entry point and homepage
- `*.html` - Individual topic pages
- `styles.css` - Styling for the entire guide
- `hypernotes.js` - Core functionality for interactive features
- `c_terms_mapping.js` - Mapping of C terms for automatic linking

### Adding New Content

To add new terms to the automatic linking system:
1. Edit `c_terms_mapping.js`
2. Run `add_terms_mapping.sh` to update the term mappings

To update headers across all HTML files:
1. Make changes to the header template
2. Run `update_headers.sh` to apply changes to all files

## License

This project is available for educational purposes.

## Contributing

Contributions to improve the guide are welcome. Please feel free to submit pull requests with corrections, additional content, or feature improvements.
