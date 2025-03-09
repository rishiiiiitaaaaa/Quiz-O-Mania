const startBtn = document.getElementById('start-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const categorySelect = document.getElementById('category');
const difficultySelect = document.getElementById('difficulty');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const timerElement = document.getElementById('timer');
const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const scoreElement = document.getElementById('score');
const reviewList = document.getElementById('review-list');
const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;

startBtn.onclick = () => {
    const category = categorySelect.value;
    const difficulty = difficultySelect.value;
    fetchQuestions(category, difficulty);
};

playAgainBtn.onclick = () => location.reload();

async function fetchQuestions(category, difficulty) {
    startScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    const response = await fetch(`https://opentdb.com/api.php?amount=20&category=${getCategoryId(category)}&difficulty=${difficulty}&type=multiple`);
    questions = (await response.json()).results;
    score = 0;
    currentQuestionIndex = 0;
    reviewList.innerHTML = ''; // Clear previous review list
    showQuestion();
}

function getCategoryId(category) {
    const categories = {
        "General Knowledge": 9,
        "Books": 10,
        "Film": 11,
        "Music": 12,
        "Musicals & Theatres": 13,
        "Television": 14,
        "Video Games": 15,
        "Board Games": 16,
        "Science & Nature": 17,
        "Computers": 18,
        "Sports": 21,
        "Geography": 22,
        "History": 23
    };
    return categories[category];
}

function showQuestion() {
    resetState();
    const question = questions[currentQuestionIndex];
    questionElement.innerHTML = question.question;

    const answers = [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5);

    answers.forEach(answer => {
        const btn = document.createElement('button');
        btn.innerText = answer;
        btn.onclick = (event) => selectAnswer(event, answer, question.correct_answer);
        optionsElement.appendChild(btn);
    });

    startTimer();
}

function startTimer() {
    let time = 15;
    timerElement.innerText = time;
    clearInterval(timer);
    timer = setInterval(() => {
        if (--time <= 0) {
            clearInterval(timer);
            addReview(questionElement.innerText, "No Answer", questions[currentQuestionIndex].correct_answer);
            nextQuestion();
        }
        timerElement.innerText = time;
    }, 1000);
}

function selectAnswer(event, selectedAnswer, correctAnswer) {
    clearInterval(timer);

    if (selectedAnswer === correctAnswer) {
        score++;
        playSound(correctSound);
        showPlusOne(event.clientX, event.clientY);
    } else {
        playSound(wrongSound);
        addReview(questionElement.innerText, selectedAnswer, correctAnswer);
    }

    nextQuestion();
}

function playSound(audioElement) {
    if (audioElement) {
        audioElement.currentTime = 0; // Reset sound to start
        audioElement.play().catch(error => console.error("Audio playback error:", error));
    }
}


function showPlusOne(x, y) {
    const plusOne = document.createElement('div');
    plusOne.innerText = '+1';
    plusOne.className = 'plus-one';
    plusOne.style.left = `${x}px`;
    plusOne.style.top = `${y}px`;
    document.body.appendChild(plusOne);
    setTimeout(() => plusOne.remove(), 1000);
}

function nextQuestion() {
    if (++currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        endGame();
    }
}

function endGame() {
    gameScreen.style.display = 'none';
    endScreen.style.display = 'block';
    scoreElement.innerText = `Score: ${score} / ${questions.length}`;
}

function addReview(question, userAnswer, correctAnswer) {
    const reviewItem = document.createElement('li');
    reviewItem.innerHTML = `<strong>Q:</strong> <b>${question}</b><br>
                            <strong>Your Answer:</strong> <b>${userAnswer}</b><br>
                            <strong>Correct Answer:</strong> <b>${correctAnswer}</b>`;
    reviewList.appendChild(reviewItem);
}

function resetState() {
    optionsElement.innerHTML = '';
}