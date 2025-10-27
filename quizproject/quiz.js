// Store user data and track the current session
let userList = JSON.parse(localStorage.getItem('quiz_users') || '[]');


// It will stores which user is currently logged in
let activeUser = null;


// important elements from HTML
const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');
const toggleLeft = document.querySelector('.toggle-left');
const toggleRight = document.querySelector('.toggle-right');


// When "Register" button clicked - show signup form
if (registerBtn) registerBtn.addEventListener('click', () => container.classList.add('active'));

// When "Login" button clicked → show login form
if (loginBtn) loginBtn.addEventListener('click', () => container.classList.remove('active'));

// Also make toggle panels clickable (UX improve karne ke liye)
if (toggleRight) toggleRight.addEventListener('click', () => container.classList.add('active'));
if (toggleLeft) toggleLeft.addEventListener('click', () => container.classList.remove('active'));

// Show error text near input field
function showError(element, message) {
  if (!element) return;
  element.textContent = message;
  element.style.display = 'block';
}

// Hide error text
function hideError(element) {
  if (!element) return;
  element.textContent = '';
  element.style.display = 'none';
}


// Handle Signup (Register) Form


const signupForm = document.getElementById('signup-form');
signupForm.addEventListener('submit', (e) => {
  e.preventDefault(); // stop form reload

  // Take values from input fields
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim().toLowerCase();
  const password = document.getElementById('signup-password').value;

  // Get error message areas
  const errName = document.getElementById('err-signup-name');
  const errEmail = document.getElementById('err-signup-email');
  const errPass = document.getElementById('err-signup-password');

  // Hide all previous errors
  hideError(errName); hideError(errEmail); hideError(errPass);

  // Validation check
  let isValid = true;
  if (!name) { showError(errName, 'Please enter your name'); isValid = false; }
  if (!email) { showError(errEmail, 'Email is required'); isValid = false; }
  if (!password) { showError(errPass, 'Password is required'); isValid = false; }

  if (!isValid) return;

  // Check if email already registered (duplicate check)
  if (userList.find(u => u.email === email)) {
    showError(errEmail, 'This email is already registered. Try logging in.');
    return;
  }

  // Save new user to local storage
  const newUser = { name, email, password };
  userList.push(newUser);
  localStorage.setItem('quiz_users', JSON.stringify(userList));

  // Auto-login after signup
  activeUser = newUser;
  startQuiz();
});



// Handle Login (Sign In) Form


const signinForm = document.getElementById('signin-form');
signinForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get user inputs
  const email = document.getElementById('signin-email').value.trim().toLowerCase();
  const password = document.getElementById('signin-password').value;

  // Get error message areas
  const errEmail = document.getElementById('err-signin-email');
  const errPass = document.getElementById('err-signin-password');
  hideError(errEmail); hideError(errPass);

  // Validation check
  if (!email) { showError(errEmail, 'Please enter your email'); return; }
  if (!password) { showError(errPass, 'Please enter your password'); return; }

  // Find user in stored userList
  const user = userList.find(u => u.email === email && u.password === password);
  if (!user) {
    showError(errPass, 'Incorrect email or password');
    return;
  }

  // Login successful
  activeUser = user;
  startQuiz();
});


// -----------------------------------------------------------

// -----------------------------------------------------------

const quizZone = document.getElementById('quiz-zone');
const quizArea = document.getElementById('quiz-area');
const quizWelcome = document.getElementById('quiz-welcome');
const quizTime = document.getElementById('quiz-time');
const btnNext = document.getElementById('btn-next');
const btnPrev = document.getElementById('btn-prev');
const quizResult = document.getElementById('quiz-result');
const resultTitle = document.getElementById('result-title');
const resultSummary = document.getElementById('result-summary');
const resultTableWrap = document.getElementById('result-table-wrap');
const btnRestart = document.getElementById('btn-restart');

// List of quiz questions
const questions = [
  { q: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Text Machine Language", "Hyper Transfer Markup Language", "None"], answer: 0 },
  { q: "What does CSS stand for?", options: ["Cascading Style Sheets", "Colorful Style Sheet", "Creative Style System", "Computer Style Sheet"], answer: 0 },
  { q: "Which language is used for web apps?", options: ["Python", "Java", "PHP", "All"], answer: 3 },
  { q: "What year was JavaScript launched?", options: ["1996", "1995", "1994", "None"], answer: 1 },
  { q: "What does SQL stand for?", options: ["Structured Query Language", "Stylish Question Language", "Statement Question Language", "None"], answer: 0 },
  { q: "Which tag is used for a line break in HTML?", options: ["<br>", "<lb>", "<break>", "<b>"], answer: 0 },
  { q: "Which CSS property changes text color?", options: ["text-color", "fgcolor", "color", "font-color"], answer: 2 },
  { q: "Which company developed Java?", options: ["Sun Microsystems", "Microsoft", "Apple", "Google"], answer: 0 },
  { q: "What is the extension of JavaScript files?", options: [".js", ".java", ".jv", ".javascript"], answer: 0 },
  { q: "Which keyword declares a constant in JS?", options: ["var", "let", "const", "constant"], answer: 2 },
];



//  Quiz Variables


let currentQuestion = 0;                    // current question index
let userAnswers = new Array(questions.length).fill(null); // stores selected answers
let timer = 10;                             // 10 seconds timer
let timerInterval = null;                   // store timer reference





function startQuiz() {
  document.getElementById('container').style.display = 'none'; // hide login
  quizZone.style.display = 'block';                            // show quiz
  quizResult.style.display = 'none';                           // hide results
  quizWelcome.textContent = `Welcome, ${activeUser.name || activeUser.email}`;
  
  currentQuestion = 0;
  userAnswers = new Array(questions.length).fill(null);
  showQuestion();
  startTimer();
}


//Show Current Question


function showQuestion() {
  clearInterval(timerInterval); // stop old timer

  const q = questions[currentQuestion];
  let html = `<div class="quiz-card"><h3>Q${currentQuestion+1}. ${safeText(q.q)}</h3><div class="options">`;

  // Create each option button dynamically
  q.options.forEach((opt, i) => {
    const optId = `q${currentQuestion}_opt${i}`;
    const checked = userAnswers[currentQuestion] === i ? 'checked' : '';
    html += `
      <label class="option-label" for="${optId}">
        <input type="radio" id="${optId}" name="option" value="${i}" ${checked} />
        <span class="opt-text">${safeText(opt)}</span>
      </label>`;
  });
  html += `</div></div>`;
  quizArea.innerHTML = html;

  // Update navigation buttons
  btnPrev.disabled = currentQuestion === 0;
  btnNext.textContent = currentQuestion < questions.length - 1 ? 'Next' : 'Submit';

  // When user selects an option
  const optionInputs = quizArea.querySelectorAll('input[name="option"]');
  optionInputs.forEach(inp => {
    inp.addEventListener('change', (e) => {
      userAnswers[currentQuestion] = Number(e.target.value); // save answer
      optionInputs.forEach(i2 => i2.parentElement.classList.remove('selected'));
      e.target.parentElement.classList.add('selected');
    });
    if (inp.checked) inp.parentElement.classList.add('selected');
  });

  startTimer(); // restart timer for this question
}



//Timer per Question

function startTimer() {
  clearInterval(timerInterval);
  timer = 20;
  quizTime.textContent = timer;
  timerInterval = setInterval(() => {
    timer--;
    quizTime.textContent = timer;
    if (timer <= 0) {
      clearInterval(timerInterval);
      moveToNext();
    }
  }, 1200);
}



// Move to Next Question


function moveToNext() {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    showQuestion();
  } else {
    showResults(); // last question → show results
  }
}



//  Navigation Buttons


btnNext.addEventListener('click', () => {
  clearInterval(timerInterval);
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    showQuestion();
  } else {
    showResults();
  }
});

btnPrev.addEventListener('click', () => {
  clearInterval(timerInterval);
  if (currentQuestion > 0) {
    currentQuestion--;
    showQuestion();
  }
});

// Show Quiz Results


function showResults() {
  clearInterval(timerInterval);
  quizArea.innerHTML = '';
  quizResult.style.display = 'block';

  const total = questions.length;
  let correct = 0;
  resultTableWrap.innerHTML = '';

  // Build results table
  let table = '<table><thead><tr><th>#</th><th>Question</th><th>Your Answer</th><th>Correct Answer</th><th>Result</th></tr></thead><tbody>';
  questions.forEach((q, i) => {
    const ua = userAnswers[i];
    const uaText = (ua === null || ua === undefined) ? 'No answer' : q.options[ua];
    const caText = q.options[q.answer];
    const isCorrect = ua === q.answer;
    if (isCorrect) correct++;

    table += `<tr>
      <td>${i+1}</td>
      <td style="max-width:240px">${safeText(q.q)}</td>
      <td>${safeText(uaText)}</td>
      <td>${safeText(caText)}</td>
      <td class="${isCorrect ? 'correct' : 'wrong'}">${isCorrect ? 'Correct' : 'Incorrect'}</td>
    </tr>`;
  });
  table += '</tbody></table>';
  resultTableWrap.innerHTML = table;

  resultTitle.textContent = `Well Done, ${activeUser.name || activeUser.email}!`;
  resultSummary.innerHTML = `<strong>Score:</strong> ${correct} / ${total}`;
  btnNext.disabled = true;
  btnPrev.disabled = true;
}



// Restart Quiz Button


btnRestart.addEventListener('click', () => {
  quizResult.style.display = 'none';
  currentQuestion = 0;
  userAnswers = new Array(questions.length).fill(null);
  btnNext.disabled = false;
  btnPrev.disabled = false;
  showQuestion();
});



// safe Text Function 


function safeText(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}



// Remove error when user starts typing


const allInputs = document.querySelectorAll('input');
allInputs.forEach(inp => {
  inp.addEventListener('input', () => {
    const next = inp.nextElementSibling;
    if (next && next.classList && next.classList.contains('error')) {
      hideError(next);
    }
  });
});
