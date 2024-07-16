# Zip 2 Prompt

Zip 2 Prompt is a web-based tool that allows users to extract and analyze the contents of ZIP files, making it easier to work with compressed file archives, especially for processing or understanding large codebases.

## Features

- **ZIP File Upload**: Users can upload ZIP files directly through the web interface.
- **File Structure Visualization**: The tool displays the hierarchical structure of the uploaded ZIP file, allowing users to easily navigate through directories and files.
- **Selective Extraction**: Users can choose specific files or directories they want to extract from the ZIP archive.
- **Content Merging**: Selected files are extracted and their contents are merged into a single text file, making it easy to analyze or process multiple files at once.
- **Download Extracted Content**: Users can download the merged content of selected files as a single text file.
- **Web-based Interface**: The entire process can be done through a user-friendly web interface, requiring no additional software installation.

## Technology Stack

- **Frontend**: HTML, CSS (Tailwind CSS), JavaScript (Alpine.js)
- **Backend**: Node.js with Hono.js framework
- **File Processing**: adm-zip for ZIP file handling

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (usually comes with Node.js)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Zizwar/zip2prompt.git
   cd zip2prompt
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

4. Open your web browser and navigate to `http://localhost:3000` to use the application.

## Usage

1. Click on the file upload area to select a ZIP file from your computer.
2. Once uploaded, you'll see the file structure of the ZIP archive.
3. Select the files you want to extract by checking the boxes next to their names.
4. Click the "Extract Selected Files" button to process the selected files.
5. The merged content of the selected files will appear in the text area on the right.
6. You can download the merged content by clicking the "Download Merged Content" button.

## Contributing

Contributions to Zip 2 Prompt are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Contact

If you have any questions or suggestions, please open an issue on the GitHub repository.

---

Happy coding with Zip 2 Prompt!