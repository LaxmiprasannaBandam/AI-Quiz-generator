# AI Quiz Generator

A Flask-based web application that generates quiz questions from PowerPoint (PPTX) presentations using AI capabilities.

## Features

- **Upload PPTX Files** – Upload PowerPoint presentations for processing.
- **Text Extraction** – Extract text content from all slides of a PPTX file.
- **AI-Powered Quiz Generation** – Generate quiz questions based on the extracted content (AI integration ready).
- **RESTful API** – Well-defined API endpoints for seamless frontend-backend communication.
- **Responsive UI** – Modern, user-friendly interface for an optimal experience.

## Tech Stack

- **Backend**: Python (Flask)
- **Frontend**: HTML, CSS, JavaScript
- **File Processing**: python-pptx
- **Dependencies**: See [requirements.txt](requirements.txt)

## Project Structure

```
AI Quiz Generator/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── static/
│   ├── css/           # Stylesheet files
│   └── js/            # JavaScript files
├── templates/
│   └── index.html     # Main HTML template
└── uploads/           # Uploaded PPTX files directory
```

## Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd AI-Quiz-Generator
   ```

2. **Create a virtual environment (recommended)**

   ```bash
   python -m venv venv
   ```

   - **Windows**: `venv\Scripts\activate`
   - **macOS/Linux**: `source venv/bin/activate`

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**

   ```bash
   python app.py
   ```

   The server will start at `http://localhost:5000`.

## API Endpoints

| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| GET    | `/`                   | Render the main page               |
| GET    | `/api/health`         | Health check endpoint              |
| POST   | `/api/upload`         | Upload a PPTX file                 |
| POST   | `/api/extract-text`   | Extract text from an uploaded PPTX |
| POST   | `/api/generate-quiz`  | Generate quiz questions from text  |

### API Usage Examples

#### Upload a file

```bash
curl -X POST -F "file=@presentation.pptx" http://localhost:5000/api/upload
```

#### Extract text from uploaded file

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"filename": "presentation.pptx"}' \
  http://localhost:5000/api/extract-text
```

#### Generate quiz

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"content": "Your text content here", "num_questions": 5}' \
  http://localhost:5000/api/generate-quiz
```

## Configuration

Environment variables (optional):

| Variable     | Description                     | Default                     |
|--------------|---------------------------------|-----------------------------|
| `SECRET_KEY` | Flask secret key                | `dev-secret-key-change-in-production` |

The application supports uploads up to **16 MB** and accepts only `.pptx` files.

## Development

To run the application in development mode with debugging enabled:

```bash
python app.py
```

The Flask debug mode is enabled by default for development. The server listens on `0.0.0.0:5000`.

## Future Enhancements

- Integration with AI/LLM services (e.g., OpenAI, Gemini) for intelligent question generation
- Support for multiple file formats (PDF, DOCX)
- User authentication and quiz history
- Export quizzes to various formats (PDF, JSON, QTI)
- Customizable question types (multiple choice, true/false, fill-in-the-blank)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.