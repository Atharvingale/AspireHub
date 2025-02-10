let currentQuestionIndex = 0;
let questions = [];
let userAnswers = [];
let timeLeft = 10800; // 9 minutes and 9 seconds
let timerInterval;

const questionNumberElement = document.getElementById('question-number');
const questionTextElement = document.getElementById('question-text');
const optionsElement = document.getElementById('options');
const timerElement = document.getElementById('timer');
const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');
const testContent = document.getElementById('test-content');
const resultContainer = document.getElementById('result-container');
const finalScoreElement = document.getElementById('final-score');
const resultDetailsElement = document.getElementById('result-details');

// Fetch questions from JSON file
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        questions = await response.json();
        userAnswers = new Array(questions.length).fill(null);
        loadQuestion();
    } catch (error) {
        console.error('Error loading questions:', error);
        questionTextElement.textContent = 'Failed to load questions. Please try again later.';
    }
}

// Load the current question
function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endTest();
        return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    questionNumberElement.textContent = `Question ${currentQuestionIndex + 1}`;
    questionTextElement.textContent = currentQuestion.question;
    optionsElement.innerHTML = '';

    currentQuestion.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.addEventListener('click', () => selectAnswer(option, currentQuestion.answer));
        optionsElement.appendChild(button);
    });

    updateNavigationButtons();
}

// Handle answer selection
function selectAnswer(selectedOption, correctAnswer) {
    userAnswers[currentQuestionIndex] = selectedOption;
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    } else {
        endTest();
    }
}

// Update navigation buttons
function updateNavigationButtons() {
    prevButton.disabled = currentQuestionIndex === 0;
    nextButton.disabled = currentQuestionIndex === questions.length - 1;
}

// Timer functionality
function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerElement.textContent = `Time Remaining: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        endTest();
    } else {
        timeLeft--;
    }
}

// End the test
function endTest() {
    clearInterval(timerInterval);
    testContent.classList.add('hidden');
    resultContainer.classList.remove('hidden');
    resultContainer.classList.add('visible'); // Add the fade-in animation

    // Calculate final score
    const score = userAnswers.reduce((acc, answer, index) => {
        return acc + (answer === questions[index].answer ? 1 : 0);
    }, 0);

    // Animate the score
    animateScore(score, questions.length);

    // Display detailed results
    resultDetailsElement.innerHTML = questions.map((q, i) => `
        <div class="result-item ${userAnswers[i] === q.answer ? 'correct' : 'incorrect'}">
            <p><strong>Question ${i + 1}:</strong> ${q.question}</p>
            <p><strong>Your Answer:</strong> ${userAnswers[i] || 'Not answered'}</p>
            <p><strong>Correct Answer:</strong> ${q.answer}</p>
        </div>
    `).join('');

    // Draw the result on the canvas
    drawCanvasResults();
}

// Animate score
function animateScore(finalScore, totalQuestions) {
    let score = 0;
    const finalScoreElement = document.getElementById('final-score');
    const interval = setInterval(() => {
        if (score < finalScore) {
            score++;
            finalScoreElement.textContent = `Your Score: ${score}/${totalQuestions}`;
        } else {
            clearInterval(interval);
        }
    }, 50); // Change the interval for speed
}

// Draw the result on canvas
function drawCanvasResults() {
    const correctAnswers = userAnswers.filter(answer => answer === 'correct').length;
    const incorrectAnswers = userAnswers.length - correctAnswers;

    const canvas = document.getElementById('result-canvas');
    const ctx = canvas.getContext('2d');

    // Draw Pie Chart for Correct vs Incorrect Answers
    const total = correctAnswers + incorrectAnswers;
    const correctPercentage = (correctAnswers / total) * 100;
    const incorrectPercentage = 100 - correctPercentage;

    // Draw correct answers (Green)
    ctx.beginPath();
    ctx.arc(200, 200, 150, 0, Math.PI * 2 * (correctPercentage / 100));
    ctx.lineTo(200, 200);
    ctx.fillStyle = '#28a745';
    ctx.fill();

    // Draw incorrect answers (Red)
    ctx.beginPath();
    ctx.arc(200, 200, 150, 0, Math.PI * 2 * (incorrectPercentage / 100));
    ctx.lineTo(200, 200);
    ctx.fillStyle = '#f44336';
    ctx.fill();

    // Draw text (Optional: Add percentage text to the center)
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${correctPercentage.toFixed(0)}% Correct`, 200, 200);
}

// Event listeners for navigation buttons
prevButton.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
});

nextButton.addEventListener('click', () => {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    }
});

// Initialize the test
loadQuestions();
timerInterval = setInterval(updateTimer, 1000);

// Enable webcam feed
const video = document.getElementById('webcam');

async function enableWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        console.error('Error accessing webcam:', err);
        document.getElementById('ai-alerts').textContent = 'Webcam access denied. AI monitoring disabled.';
    }
}

enableWebcam();
