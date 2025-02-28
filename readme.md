# Zip 2 Prompt

[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/Zizwar/zip2prompt)

Zip 2 Prompt is a powerful tool that transforms project structures into an AI-readable text format, enabling comprehensive analysis of multi-file projects by AI models. It provides a user-friendly interface for extracting and formatting code from ZIP files, URLs, or GitHub repositories.

## Key Features

### Core Features
- Convert ZIP files, URLs, or GitHub repositories into AI-friendly text format
- Selective file extraction with advanced folder/file selection options
- Preserve and include project structure in output
- Customizable prompts to guide AI analysis
- Support for diverse file types common in software projects
- Dark mode for eye comfort
- Bilingual support (English/Arabic)
- Uploaded project management system
- Reopen and analyze previously uploaded projects
- Advanced checkbox system for files/folders
- Option to exclude media files (images/videos, etc.) from extraction
- Select/deselect all files with one click
- Enhanced file tree display with empty folder filtering
- Clipboard integration for quick copying of formatted content

### New Features 🆕
- **File Content Preview** - View file contents before selection with automatic code formatting
- **Ready-to-Use Prompt Templates** - Pre-made templates for common use cases (code analysis, debugging, documentation generation, improvement suggestions)
- **Code Summarization** - Option to reduce output size by removing comments and formatting code
- **Automatic Key File Detection** - Auto-detect and highlight essential project files (e.g., package.json, README, config files)
- **File Group System** - Save and retrieve predefined file selections for repeated use

## Why Zip 2 Prompt?

1. Overcome AI limitations in handling complex file structures  
2. Enable comprehensive AI-powered project analysis  
3. Simplify AI prompt creation for large/organized projects  
4. Maintain project context for accurate AI interpretation  
5. Save time preparing projects for AI processing  
6. Easily manage and filter relevant files for AI analysis  
7. Enhance AI response accuracy through new features like code summarization and specialized templates

## Usage

1. Upload ZIP file, provide URL, or enter GitHub repository link  
2. Select relevant files for analysis using advanced checkbox system  
3. Customize selection using "Select All", "Deselect All", or "Select Key Files" options  
4. Optionally exclude media files  
5. Add specific instructions/questions in main prompt area or choose from ready-made templates  
6. Preview files before selection using preview feature  
7. Use code summarization to reduce output size for large projects  
8. Generate comprehensive text output  
9. Copy to clipboard or download output for use with AI models  
10. Save favorite file groups for future reuse  

## Getting Started

```bash
git clone https://github.com/Zizwar/zip2prompt.git
cd zip2prompt
npm install
npm run start
```

## New Features Details

### File Content Preview
- Browse contents of any file before selection
- Automatic code formatting based on language using highlight.js
- Intuitive preview interface with direct add/remove from selection

### Ready-to-Use Prompt Templates
- Choose from specialized templates for various scenarios:
  - **Code Analysis**: Get insights about architecture and patterns
  - **Debugging**: Detect vulnerabilities and performance issues
  - **Documentation Generation**: Create comprehensive code documentation
  - **Improvement Suggestions**: Receive code readability/maintainability recommendations

### Code Summarization
- Reduce output size by removing unnecessary comments
- Unified code formatting for better readability
- Ideal for large projects exceeding AI model limits

### Automatic Key File Detection
- Auto-detect important files including:
  - Config files (package.json, composer.json, etc.)
  - README/documentation files
  - Setup/configuration files
  - Main files (index.js, main.py, etc.)
- Star indicators in UI for key files
- Dedicated button to select all key files with one click

### File Group System
- Save custom file selections with custom names
- Easily retrieve previously saved selections
- Simplify repetitive work on same/similar projects

## File Upload Methods
- Direct ZIP file upload
- Remote ZIP file URL input
- GitHub repository link with branch selection

## File Management
- View list of uploaded projects
- Reopen previously uploaded projects for further analysis
- Delete uploaded projects when no longer needed

## UI Features
- Dark/Light mode toggle for eye comfort
- Full bilingual support (English/Arabic) with language switcher
- Responsive design for cross-device use
- Intuitive drag-and-drop interface for file uploads

## Screenshots

![zip2prompt](https://raw.githubusercontent.com/Zizwar/zip2prompt/main/screen/IMG_0860.png)  
![zip2prompt](https://raw.githubusercontent.com/Zizwar/zip2prompt/main/screen/image.png)  
![zip2prompt](https://raw.githubusercontent.com/Zizwar/zip2prompt/main/screen/Screenshot_20240720-204349_Chrome.jpg)

## Try It Now

[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/Zizwar/zip2prompt)

## Contribution

Contributions are welcome! Feel free to submit pull requests.

## License

This project is licensed under the ISC License.