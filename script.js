const correctAnswersEl = document.getElementById("correct-answers");
const incorrectAnswersEl = document.getElementById("incorrect-answers");
const questionEl = document.getElementById("question");
const answerEl = document.getElementById("answer");
const revealAnswerBtn = document.getElementById("reveal-answer");
const nextQuestionBtn = document.getElementById("next-question");
const startGameBtn = document.getElementById("start-game");
const gameScreen = document.getElementById("game-screen");
const scoreEl = document.getElementById("score");
const guessInput = document.getElementById("guess");
const submitGuessBtn = document.getElementById("submit-guess");

const valueButtons = document.querySelectorAll('.value-button');
for(let button of valueButtons) {
  button.addEventListener('touchstart', function() {
    const value = this.value;
    showQuestionByValue(value);
  });
  button.addEventListener('click', function() {
    const value = this.value;
    showQuestionByValue(value);
  });
}

document.getElementById('random-value').addEventListener('click', function() {
  const values = [200, 400, 600, 800, 1000, 400, 800, 1200, 1600, 2000];
  const randomValue = values[Math.floor(Math.random() * values.length)];
  showQuestionByValue(randomValue);
});






let questions = [];
let score = 0;
let currentQuestion;
let correctAnswers = 0;
let incorrectAnswers = 0;

const loadingMessage = document.getElementById("loading-message");

function initializeGame() {
    loadingMessage.hidden = false;
    fetch("questions.json")
        .then((response) => response.json())
        .then((data) => {
            questions = data.filter(q => q.value);
            loadingMessage.hidden = true;
        });

    revealAnswerBtn.addEventListener("click", revealAnswer);
    nextQuestionBtn.addEventListener("click", nextQuestion);
    submitGuessBtn.addEventListener("click", submitGuess);
}


function showQuestionByValue(value) {
    const parsedValue = parseInt(value);
    const filteredQuestions = questions.filter(q => parseValue(q.value) === parsedValue);
  
    if (filteredQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
        currentQuestion = filteredQuestions[randomIndex];
        questionEl.textContent = `${currentQuestion.category} - ${currentQuestion.value}: ${currentQuestion.question}`;
        answerEl.textContent = currentQuestion.answer;
        answerEl.hidden = true;
        revealAnswerBtn.disabled = false;
    } else {
        // Handle case where there are no questions for a particular value
        console.log(`No questions found for value ${value}`);
    }
}



function revealAnswer() {
    answerEl.hidden = false;
    revealAnswerBtn.disabled = true;
    score -= parseValue(currentQuestion.value);
    incorrectAnswers++; // Increment incorrect answers when revealing the answer
    updateScore();
    updateAnswerCounts(); // Update the displayed incorrect answers count
    submitGuessBtn.disabled = true;
}

function nextQuestion() {
    showQuestionByValue(parseValue(currentQuestion.value));
    guessInput.value = "";
    submitGuessBtn.disabled = false;
}


function updateAnswerCounts() {
    correctAnswersEl.textContent = correctAnswers;
    incorrectAnswersEl.textContent = incorrectAnswers;
}

function submitGuess() {
    const guess = guessInput.value.trim().toLowerCase();
    const correctAnswer = currentQuestion.answer.trim().toLowerCase();
    const similarityThreshold = 0.5;

    if (areAnswersSimilar(guess, correctAnswer, similarityThreshold)) {
        score += parseValue(currentQuestion.value);
        correctAnswers += 1;
        alert("Correct!");
    } else {
        score -= parseValue(currentQuestion.value);
        incorrectAnswers += 1;
        alert(`Incorrect! The correct answer is:${currentQuestion.answer}`);
    }

    updateScore();
    updateAnswerCounts();
    guessInput.value = "";
    submitGuessBtn.disabled = true;
    revealAnswerBtn.disabled = true;
}


function updateScore() {
    scoreEl.textContent = score;
    console.log(`score: ${score}`);
}

function parseValue(value) {
    if (value) {
        return parseInt(value.replace("$", "").replace(",", ""));
    } else {
        // Return some default value (like 0) if value is null or undefined
        return 0;
    }
}


function areAnswersSimilar(answer1, answer2, threshold) {
    const words1 = answer1.split(/\s+/);
    const words2 = answer2.split(/\s+/);
    const commonWords = words1.filter((word) => words2.includes(word));
    const similarity = commonWords.length / Math.max(words1.length, words2.length);
    return similarity >= threshold;
}


startGameBtn.addEventListener("click", () => {
    initializeGame();
    gameScreen.hidden = false;
    startGameBtn.hidden = true;
    updateScore();
});
