// AI Quiz Generator - Main Application Logic

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');
    const fileNameDisplay = document.getElementById('file-name');
    const uploadSection = document.getElementById('upload-section');
    const previewSection = document.getElementById('preview-section');
    const fileInfo = document.getElementById('file-info');
    const slidesContainer = document.getElementById('slides-container');
    const generateQuizBtn = document.getElementById('generate-quiz-btn');
    const quizSection = document.getElementById('quiz-section');
    const quizTitle = document.getElementById('quiz-title');
    const questionsContainer = document.getElementById('questions-container');
    const submitQuizBtn = document.getElementById('submit-quiz');
    const resultSection = document.getElementById('result-section');
    const resultContainer = document.getElementById('result-container');

    let currentFilename = null;
    let extractedSlides = [];
    let currentQuiz = null;
    let selectedAnswers = {};

    // Update file name display when file is selected
    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            fileNameDisplay.textContent = this.files[0].name;
        } else {
            fileNameDisplay.textContent = 'No file chosen';
        }
    });

    // Handle file upload and text extraction
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const file = fileInput.files[0];
        if (!file) {
            showError('Please select a .pptx file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        // Show loading state
        const submitBtn = uploadForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Uploading...';
        submitBtn.disabled = true;

        try {
            // Step 1: Upload the file
            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const uploadData = await uploadResponse.json();

            if (!uploadResponse.ok) {
                throw new Error(uploadData.error || 'Upload failed');
            }

            // Step 2: Extract text from the uploaded PPTX
            submitBtn.textContent = 'Extracting text...';
            const extractResponse = await fetch('/api/extract-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: uploadData.filename })
            });

            const extractData = await extractResponse.json();

            if (!extractResponse.ok) {
                throw new Error(extractData.error || 'Text extraction failed');
            }

            currentFilename = extractData.filename;
            extractedSlides = extractData.slides;
            displayPreview(extractData);

        } catch (error) {
            showError(error.message);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // Display extracted content preview
    function displayPreview(data) {
        // File info
        fileInfo.innerHTML = `
            <div class="file-info-bar">
                <strong>File:</strong> ${data.filename} &nbsp;|&nbsp;
                <strong>Total Slides:</strong> ${data.total_slides}
            </div>
        `;

        // Slides content
        slidesContainer.innerHTML = '';
        data.slides.forEach(function(slide) {
            const slideCard = document.createElement('div');
            slideCard.className = 'slide-card';

            const header = document.createElement('div');
            header.className = 'slide-header';
            header.innerHTML = `<strong>Slide ${slide.slide_number}</strong>`;

            const content = document.createElement('div');
            content.className = 'slide-content';

            if (slide.text.trim()) {
                const lines = slide.text.split('\n');
                lines.forEach(function(line) {
                    const p = document.createElement('p');
                    p.textContent = line;
                    content.appendChild(p);
                });
            } else {
                content.innerHTML = '<p class="empty-slide">(No text content on this slide)</p>';
            }

            slideCard.appendChild(header);
            slideCard.appendChild(content);
            slidesContainer.appendChild(slideCard);
        });

        // Show the "Generate Quiz" button only if there's text content
        const hasContent = data.slides.some(function(s) { return s.text.trim(); });
        if (hasContent) {
            generateQuizBtn.style.display = 'inline-block';
        } else {
            generateQuizBtn.style.display = 'none';
        }

        // Show preview section, hide upload
        uploadSection.style.display = 'none';
        previewSection.style.display = 'block';
    }

    // Handle "Generate Quiz" button click
    generateQuizBtn.addEventListener('click', function() {
        // Combine all slide text into one content string
        const allText = extractedSlides
            .map(function(s) { return s.text; })
            .filter(function(t) { return t.trim(); })
            .join('\n\n');

        if (!allText.trim()) {
            showError('No textual content found in the presentation.');
            return;
        }

        // For now, generate a simple mock quiz using the extracted text
        // AI integration will be added later
        generateMockQuiz(allText);
    });

    // Generate mock quiz from extracted text (placeholder until AI is integrated)
    function generateMockQuiz(content) {
        const lines = content.split('\n').filter(function(l) { return l.trim(); });
        const sampleQuestions = [];

        // Create up to 5 questions based on the extracted content
        const numQuestions = Math.min(5, lines.length);
        for (let i = 0; i < numQuestions; i++) {
            const line = lines[i];
            sampleQuestions.push({
                id: i + 1,
                question: `Based on "${line.substring(0, 60)}...", what is the correct answer?`,
                options: ['Option A: Related concept', 'Option B: Unrelated concept', 'Option C: Opposite concept', 'Option D: General statement'],
                correct_answer: 'Option A: Related concept'
            });
        }

        // If too few lines, pad with general questions
        while (sampleQuestions.length < 3) {
            sampleQuestions.push({
                id: sampleQuestions.length + 1,
                question: 'What is the main topic of this presentation?',
                options: ['Topic A', 'Topic B', 'Topic C', 'Topic D'],
                correct_answer: 'Topic A'
            });
        }

        currentQuiz = {
            title: 'Quiz: ' + currentFilename,
            questions: sampleQuestions,
            total_questions: sampleQuestions.length
        };

        displayQuiz(currentQuiz);
    }

    // Display quiz questions
    function displayQuiz(quiz) {
        quizTitle.innerHTML = `<h3>${quiz.title}</h3>`;

        questionsContainer.innerHTML = '';
        selectedAnswers = {};

        quiz.questions.forEach(function(q, index) {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-item';
            questionDiv.innerHTML = `
                <h3>Question ${index + 1}: ${q.question}</h3>
                <ul class="options-list">
                    ${q.options.map(function(option, optIndex) {
                        return `
                            <li class="option-item">
                                <input type="radio" 
                                       name="question-${q.id}" 
                                       id="q${q.id}-opt${optIndex}" 
                                       value="${option}"
                                       data-question-id="${q.id}">
                                <label for="q${q.id}-opt${optIndex}">${option}</label>
                            </li>
                        `;
                    }).join('')}
                </ul>
            `;
            questionsContainer.appendChild(questionDiv);

            // Add event listeners to radio buttons
            const radioButtons = questionDiv.querySelectorAll('input[type="radio"]');
            radioButtons.forEach(function(radio) {
                radio.addEventListener('change', function() {
                    selectedAnswers[this.dataset.questionId] = this.value;
                    checkQuizCompletion();
                });
            });
        });

        // Show quiz section, hide preview
        previewSection.style.display = 'none';
        quizSection.style.display = 'block';
    }

    // Check if all questions are answered
    function checkQuizCompletion() {
        if (!currentQuiz) return;

        const answeredCount = Object.keys(selectedAnswers).length;
        if (answeredCount === currentQuiz.questions.length) {
            submitQuizBtn.style.display = 'block';
        } else {
            submitQuizBtn.style.display = 'none';
        }
    }

    // Handle quiz submission
    submitQuizBtn.addEventListener('click', function() {
        if (!currentQuiz) return;

        let score = 0;
        const results = [];

        currentQuiz.questions.forEach(function(q) {
            const userAnswer = selectedAnswers[q.id] || '';
            const isCorrect = userAnswer === q.correct_answer;

            if (isCorrect) score++;

            results.push({
                question: q.question,
                userAnswer: userAnswer,
                correctAnswer: q.correct_answer,
                isCorrect: isCorrect
            });
        });

        displayResults(score, results);
    });

    // Display quiz results
    function displayResults(score, results) {
        const totalQuestions = results.length;
        const percentage = Math.round((score / totalQuestions) * 100);

        resultContainer.innerHTML = `
            <div class="score-display">
                <h3>Your Score</h3>
                <div class="score-value">${score}/${totalQuestions}</div>
                <p>${percentage}% - ${getGrade(percentage)}</p>
            </div>
            <div id="detailed-results"></div>
        `;

        const detailedResults = document.getElementById('detailed-results');

        results.forEach(function(result, index) {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'result-card ' + (result.isCorrect ? 'correct' : 'incorrect');
            resultDiv.innerHTML = `
                <h3>Question ${index + 1}: ${result.question}</h3>
                <p><strong>Your answer:</strong> ${result.userAnswer || 'Not answered'}</p>
                <p><strong>Correct answer:</strong> ${result.correctAnswer}</p>
                <div class="result-text ${result.isCorrect ? 'correct' : 'incorrect'}">
                    ${result.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                </div>
            `;
            detailedResults.appendChild(resultDiv);
        });

        // Add "Start Over" button
        const startOverBtn = document.createElement('button');
        startOverBtn.className = 'btn btn-primary';
        startOverBtn.textContent = 'Upload Another PPTX';
        startOverBtn.addEventListener('click', function() {
            resetApplication();
        });
        resultContainer.appendChild(startOverBtn);

        // Show result section
        quizSection.style.display = 'none';
        resultSection.style.display = 'block';
    }

    // Get grade based on percentage
    function getGrade(percentage) {
        if (percentage >= 90) return 'A - Excellent!';
        if (percentage >= 80) return 'B - Great!';
        if (percentage >= 70) return 'C - Good';
        if (percentage >= 60) return 'D - Needs Improvement';
        return 'F - Try Again';
    }

    // Reset application to initial state
    function resetApplication() {
        currentFilename = null;
        extractedSlides = [];
        currentQuiz = null;
        selectedAnswers = {};

        uploadSection.style.display = 'block';
        previewSection.style.display = 'none';
        quizSection.style.display = 'none';
        resultSection.style.display = 'none';

        fileInput.value = '';
        fileNameDisplay.textContent = 'No file chosen';

        // Scroll to top
        window.scrollTo(0, 0);
    }

    // Show error message
    function showError(message) {
        // Remove any existing error messages
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'card error-message';
        errorDiv.style.cssText = 'background: #fff5f5; border: 1px solid #f56565;';
        errorDiv.innerHTML = `
            <h2 style="color: #9b2c2c;">Error</h2>
            <p style="color: #742a2a;">${message}</p>
            <button class="btn btn-primary" onclick="this.closest('.error-message').remove()" style="margin-top: 10px;">
                Dismiss
            </button>
        `;

        // Insert after the visible section
        const visibleSection = document.querySelector('section.card:not([style*="display: none"])');
        if (visibleSection) {
            visibleSection.parentNode.insertBefore(errorDiv, visibleSection.nextSibling);
        } else {
            document.querySelector('main').appendChild(errorDiv);
        }
    }
});