// Select screens
const startScreen = document.querySelector(".start-screen");
const quizScreen = document.querySelector(".quiz");
const endScreen = document.querySelector(".end-screen");

// Buttons
const startBtn = document.querySelector(".start");
const submitBtn = document.querySelector(".submit");
const restartBtn = document.querySelector(".restart");

// Quiz elements
const questionText = document.querySelector(".question");
const answersWrapper = document.querySelector(".answer-wrapper");
const currentQuestionSpan = document.querySelector(".current");
const totalQuestionsSpan = document.querySelector(".total");
const finalScore = document.querySelector(".final-score");
const totalScore = document.querySelector(".total-score");
const percentageEl = document.querySelector(".percentage");

// Settings
const numQuestionsSelect = document.getElementById("num-questions");
const categorySelect = document.getElementById("category");
const difficultySelect = document.getElementById("difficulty");
const timeSelect = document.getElementById("time");

const progressBar = document.querySelector(".progress-bar");
const progressText = document.querySelector(".progress-text");

let questions = [];
let currentIndex = 0;
let score = 0;
let selectedAnswer = null;
let timer;
let timePerQuestion = 15;
let timeLeft = 15;

// Start Quiz
startBtn.addEventListener("click", async () => {
  const amount = numQuestionsSelect.value;
  const category = categorySelect.value;
  const difficulty = difficultySelect.value;
  timePerQuestion = parseInt(timeSelect.value) || 15;

  let apiUrl = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;
  if (category) apiUrl += `&category=${category}`;
  if (difficulty) apiUrl += `&difficulty=${difficulty}`;

  const res = await fetch(apiUrl);
  const data = await res.json();
  questions = data.results;

  if (questions.length === 0) {
    alert("No questions found for your settings. Try different options.");
    return;
  }

  score = 0;
  currentIndex = 0;
  totalQuestionsSpan.textContent = `/${questions.length}`;
  totalScore.textContent = `/${questions.length}`;

  startScreen.classList.add("hide");
  endScreen.classList.add("hide");
  quizScreen.classList.remove("hide");

  loadQuestion();
});

// Load Question
function loadQuestion() {
  clearInterval(timer);
  submitBtn.disabled = true;
  selectedAnswer = null;
  timeLeft = timePerQuestion;
  updateTimer();

  const q = questions[currentIndex];
  questionText.innerHTML = decodeHTML(q.question);
  currentQuestionSpan.textContent = currentIndex + 1;

  let answers = [...q.incorrect_answers, q.correct_answer];
  answers = shuffleArray(answers);

  answersWrapper.innerHTML = "";
  answers.forEach(ans => {
    const div = document.createElement("div");
    div.classList.add("answer");
    div.innerHTML = `
      <span class="text">${decodeHTML(ans)}</span>
      <span class="checkbox"><span class="icon"></span></span>
    `;
    div.addEventListener("click", () => selectAnswer(div, ans, q.correct_answer));
    answersWrapper.appendChild(div);
  });

  // Start countdown
  timer = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      clearInterval(timer);
      autoSubmit(q.correct_answer);
    }
  }, 1000);
}

// Timer
function updateTimer() {
  const percent = (timeLeft / timePerQuestion) * 100;
  progressBar.style.width = `${percent}%`;
  progressText.textContent = `${timeLeft}s`;
}

// Select answer
function selectAnswer(div, answer, correctAnswer) {
  document.querySelectorAll(".answer").forEach(a => a.classList.remove("selected"));
  div.classList.add("selected");
  selectedAnswer = { element: div, answer, correctAnswer };
  submitBtn.disabled = false;
}

// Submit
submitBtn.addEventListener("click", () => {
  if (selectedAnswer) checkAnswer(selectedAnswer.answer, selectedAnswer.correctAnswer, selectedAnswer.element);
});

// Auto submit
function autoSubmit(correctAnswer) {
  document.querySelectorAll(".answer").forEach(a => {
    if (a.querySelector(".text").textContent === decodeHTML(correctAnswer)) {
      a.classList.add("correct");
      a.querySelector(".icon").textContent = "✔";
      a.querySelector(".icon").style.opacity = "1";
    }
    a.style.pointerEvents = "none";
  });
  setTimeout(nextQuestion, 1200);
}

// Check answer
function checkAnswer(answer, correctAnswer, element) {
  clearInterval(timer);
  submitBtn.disabled = true;

  if (answer === correctAnswer) {
    element.classList.add("correct");
    element.querySelector(".icon").textContent = "✔";
    element.querySelector(".icon").style.opacity = "1";
    score++;
  } else {
    element.classList.add("wrong");
    element.querySelector(".icon").textContent = "✖";
    element.querySelector(".icon").style.opacity = "1";

    document.querySelectorAll(".answer").forEach(a => {
      if (a.querySelector(".text").textContent === decodeHTML(correctAnswer)) {
        a.classList.add("correct");
        a.querySelector(".icon").textContent = "✔";
        a.querySelector(".icon").style.opacity = "1";
      }
    });
  }

  document.querySelectorAll(".answer").forEach(a => a.style.pointerEvents = "none");
  setTimeout(nextQuestion, 1200);
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex < questions.length) {
    loadQuestion();
  } else {
    endQuiz();
  }
}

// End Quiz
function endQuiz() {
  quizScreen.classList.add("hide");
  endScreen.classList.remove("hide");
  finalScore.textContent = score;
  totalScore.textContent = `/${questions.length}`;
  const percent = Math.round((score / questions.length) * 100);
  percentageEl.textContent = `Percentage = ${percent}%`;
}

// Restart
restartBtn.addEventListener("click", () => {
  endScreen.classList.add("hide");
  startScreen.classList.remove("hide");
});

// Helpers
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

// Theme toggle
document.querySelectorAll(".theme-toggle").forEach(btn => {
  btn.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    document.querySelectorAll(".theme-toggle").forEach(b => {
      b.textContent = document.body.classList.contains("light-theme") ? "☀️" : "🌙";
    });
  });
});
