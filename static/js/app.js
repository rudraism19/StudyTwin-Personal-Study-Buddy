/**
 * StudyTwin — Personal AI Study Buddy Frontend Application
 */

// App State
let currentTab = 'ask';
let ollamaStatus = { online: false, models: [], default_model: 'llama3.2' };
let currentQuiz = {
  topic: '',
  questions: [],
  currentIndex: 0,
  userAnswers: {} // index -> selected option index
};
let pomodoroTimer = null;
let pomodoroSecondsLeft = 25 * 60;
let isPomodoroRunning = false;

// Friend's Name Configuration (Stored in localStorage for persistence)
const DEFAULT_FRIEND_NAME = "Rahul";
let currentFriendName = localStorage.getItem("studyTwin_friendName") || DEFAULT_FRIEND_NAME;

// ==========================================================================
// INITIALIZATION
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  initFriendName();
  checkOllamaStatus();
  initEventListeners();
});

function initFriendName() {
  const display = document.getElementById("friendNameDisplay");
  if (display) display.textContent = currentFriendName;
  const input = document.getElementById("friendNameInput");
  if (input) input.value = currentFriendName;
}

function initEventListeners() {
  // Allow Enter key to submit inputs
  document.getElementById("askTopicInput")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleExplain();
  });
  document.getElementById("quizTopicInput")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleGenerateQuiz();
  });
  document.getElementById("tipsTopicInput")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleGenerateTips();
  });
  document.getElementById("friendNameInput")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveFriendName();
  });
}

// ==========================================================================
// NAVIGATION & TABS
// ==========================================================================

function switchTab(tabId) {
  currentTab = tabId;

  // Update navbar buttons
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });

  // Update workspace tab buttons
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.id === `tab-${tabId}`);
  });

  // Update tab panels
  document.querySelectorAll(".tab-pane").forEach(pane => {
    pane.classList.toggle("active", pane.id === `pane-${tabId}`);
  });
}

function scrollToStudy(tabId) {
  switchTab(tabId);
  const workspace = document.getElementById("studyWorkspace");
  if (workspace) {
    workspace.scrollIntoView({ behavior: "smooth" });
  }
}

// ==========================================================================
// FRIEND CUSTOMIZATION
// ==========================================================================

function editFriendName() {
  const modal = document.getElementById("friendModal");
  if (modal) {
    modal.style.display = "flex";
    const input = document.getElementById("friendNameInput");
    if (input) {
      input.value = currentFriendName;
      input.focus();
    }
  }
}

function closeFriendModal() {
  const modal = document.getElementById("friendModal");
  if (modal) modal.style.display = "none";
}

function closeFriendModalOnBackdrop(e) {
  if (e.target.id === "friendModal") closeFriendModal();
}

function saveFriendName() {
  const input = document.getElementById("friendNameInput");
  const newName = input.value.trim();
  if (newName) {
    currentFriendName = newName;
    localStorage.setItem("studyTwin_friendName", newName);
    initFriendName();
  }
  closeFriendModal();
}

// ==========================================================================
// OLLAMA STATUS & MODEL SELECTION
// ==========================================================================

async function checkOllamaStatus() {
  const pill = document.getElementById("ollamaStatusPill");
  const dot = pill?.querySelector(".status-dot");
  const text = document.getElementById("statusText");

  try {
    const res = await fetch("/api/status");
    if (res.ok) {
      const data = await res.json();
      ollamaStatus = data;
      updateStatusUI();
      return;
    }
  } catch (err) {
    console.warn("Could not query Ollama status endpoint:", err);
  }

  ollamaStatus = { online: false, models: [], default_model: "llama3.2" };
  updateStatusUI();
}

function updateStatusUI() {
  const pill = document.getElementById("ollamaStatusPill");
  const dot = pill?.querySelector(".status-dot");
  const text = document.getElementById("statusText");

  if (!dot || !text) return;

  dot.className = "status-dot";
  if (ollamaStatus.ollama_online) {
    dot.classList.add("status-online");
    const activeModel = ollamaStatus.models[0] || ollamaStatus.default_model;
    text.textContent = `Ollama: ${activeModel}`;
  } else {
    dot.classList.add("status-offline");
    text.textContent = "Ollama: Offline (Demo Mode)";
  }

  // Update modal content if open
  const modalDot = document.getElementById("modalStatusDot");
  const modalHead = document.getElementById("modalStatusHeadline");
  const modalMsg = document.getElementById("modalStatusMessage");
  const modelSelect = document.getElementById("modelSelect");

  if (modalDot && modalHead && modalMsg) {
    modalDot.className = "status-dot";
    if (ollamaStatus.ollama_online) {
      modalDot.classList.add("status-online");
      modalHead.textContent = "Ollama is Online & Connected";
      modalMsg.innerHTML = `Connected to local server. Found <strong>${ollamaStatus.models.length}</strong> installed model(s).`;
      
      // Update options if models found
      if (modelSelect && ollamaStatus.models.length > 0) {
        modelSelect.innerHTML = "";
        ollamaStatus.models.forEach(m => {
          const opt = document.createElement("option");
          opt.value = m;
          opt.textContent = m;
          modelSelect.appendChild(opt);
        });
      }
    } else {
      modalDot.classList.add("status-offline");
      modalHead.textContent = "Ollama is Offline";
      modalMsg.innerHTML = "StudyTwin is operating in <strong>Smart Offline Demo Mode</strong>. Start Ollama locally for custom deep LLM generations.";
    }
  }
}

function openModelModal() {
  const modal = document.getElementById("modelModal");
  if (modal) {
    modal.style.display = "flex";
    updateStatusUI();
  }
}

function closeModelModal() {
  const modal = document.getElementById("modelModal");
  if (modal) modal.style.display = "none";
}

function closeModalOnBackdrop(e) {
  if (e.target.id === "modelModal") closeModelModal();
}

async function refreshOllamaStatus() {
  const btn = event?.currentTarget;
  if (btn) btn.disabled = true;
  await checkOllamaStatus();
  if (btn) btn.disabled = false;
}

function getSelectedModel() {
  const sel = document.getElementById("modelSelect");
  return sel ? sel.value : "llama3.2";
}

// ==========================================================================
// FEATURE 1: ASK AI (EXPLAINER)
// ==========================================================================

function pickTopic(topic) {
  const input = document.getElementById("askTopicInput");
  if (input) {
    input.value = topic;
    handleExplain();
  }
}

async function handleExplain() {
  const input = document.getElementById("askTopicInput");
  const topic = input ? input.value.trim() : "";
  if (!topic) {
    alert("Please enter a topic or question to explain!");
    return;
  }

  const styleInput = document.querySelector('input[name="explainStyle"]:checked');
  const style = styleInput ? styleInput.value : "simple_english";
  const model = getSelectedModel();

  const btn = document.getElementById("btnExplain");
  const btnText = document.getElementById("explainBtnText");
  const spinner = document.getElementById("explainSpinner");
  const resultArea = document.getElementById("explanationResultArea");

  // Loading state
  if (btn) btn.disabled = true;
  if (btnText) btnText.textContent = "StudyTwin is thinking...";
  if (spinner) spinner.style.display = "inline-block";

  try {
    const res = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, style, model })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      displayExplanation(data);
    } else {
      alert("Error: " + (data.error || "Failed to generate explanation."));
    }
  } catch (err) {
    console.error("Explain error:", err);
    alert("Could not reach backend server. Please verify Flask is running.");
  } finally {
    if (btn) btn.disabled = false;
    if (btnText) btnText.textContent = "Explain Concept";
    if (spinner) spinner.style.display = "none";
  }
}

function displayExplanation(data) {
  const resultArea = document.getElementById("explanationResultArea");
  const content = document.getElementById("explanationContent");
  const topicBadge = document.getElementById("resultTopicBadge");
  const styleBadge = document.getElementById("resultStyleBadge");
  const sourceBadge = document.getElementById("resultSourceBadge");

  if (!resultArea || !content) return;

  topicBadge.textContent = data.topic;
  styleBadge.textContent = formatStyleName(data.style);
  
  if (data.source === "ollama") {
    sourceBadge.className = "badge badge-success";
    sourceBadge.textContent = `Ollama (${data.model || "Local LLM"})`;
  } else {
    sourceBadge.className = "badge badge-neutral";
    sourceBadge.textContent = "Smart Fallback Engine";
  }

  content.innerHTML = renderMarkdown(data.explanation);
  resultArea.style.display = "block";
  resultArea.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function formatStyleName(style) {
  switch (style) {
    case "hinglish": return "🇮🇳 Hinglish";
    case "eli10": return "🎈 Like I'm 10";
    default: return "🇬🇧 Simple English";
  }
}

function copyExplanation() {
  const content = document.getElementById("explanationContent");
  if (!content) return;
  const text = content.innerText;
  navigator.clipboard.writeText(text).then(() => {
    alert("Explanation copied to clipboard! 📋");
  }).catch(() => {
    alert("Copied!");
  });
}

function startQuizFromTopic() {
  const topicBadge = document.getElementById("resultTopicBadge");
  const topic = topicBadge ? topicBadge.textContent : "";
  if (topic) {
    pickQuizTopic(topic);
  } else {
    switchTab("quiz");
  }
}

// ==========================================================================
// FEATURE 2: GENERATE QUIZ (STEPPER & REVIEW)
// ==========================================================================

function pickQuizTopic(topic) {
  switchTab("quiz");
  const input = document.getElementById("quizTopicInput");
  if (input) {
    input.value = topic;
    handleGenerateQuiz();
  }
}

async function handleGenerateQuiz() {
  const input = document.getElementById("quizTopicInput");
  const topic = input ? input.value.trim() : "";
  if (!topic) {
    alert("Please enter a topic for the quiz!");
    return;
  }

  const model = getSelectedModel();
  const btn = document.getElementById("btnGenQuiz");
  const btnText = document.getElementById("quizBtnText");
  const spinner = document.getElementById("quizSpinner");

  if (btn) btn.disabled = true;
  if (btnText) btnText.textContent = "Generating 5 MCQs...";
  if (spinner) spinner.style.display = "inline-block";

  try {
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, model })
    });

    const data = await res.json();
    if (res.ok && data.success && data.questions && data.questions.length > 0) {
      startQuizSession(data.topic, data.questions);
    } else {
      alert("Error: " + (data.error || "Could not generate questions. Please try again."));
    }
  } catch (err) {
    console.error("Quiz error:", err);
    alert("Could not reach backend server for quiz generation.");
  } finally {
    if (btn) btn.disabled = false;
    if (btnText) btnText.textContent = "Generate 5 MCQs";
    if (spinner) spinner.style.display = "none";
  }
}

function startQuizSession(topic, questions) {
  currentQuiz = {
    topic: topic,
    questions: questions,
    currentIndex: 0,
    userAnswers: {}
  };

  // Hide input form & results screen, show playground
  document.getElementById("quizInputForm").style.display = "none";
  document.getElementById("quizResultsScreen").style.display = "none";
  document.getElementById("quizPlayground").style.display = "block";

  document.getElementById("quizCurrentTopic").textContent = `Topic: ${topic}`;
  renderCurrentQuestion();
}

function renderCurrentQuestion() {
  const q = currentQuiz.questions[currentQuiz.currentIndex];
  if (!q) return;

  const total = currentQuiz.questions.length;
  const currentNum = currentQuiz.currentIndex + 1;

  // Update counters and progress bar
  document.getElementById("quizStepCounter").textContent = `Question ${currentNum} of ${total}`;
  const pct = Math.round((currentNum / total) * 100);
  document.getElementById("quizProgressBar").style.width = `${pct}%`;

  // Update question text
  document.getElementById("quizQuestionText").textContent = q.question;

  // Render 4 option cards
  const optionsGrid = document.getElementById("quizOptionsContainer");
  optionsGrid.innerHTML = "";

  const optionLetters = ["A", "B", "C", "D"];
  const currentAnswer = currentQuiz.userAnswers[currentQuiz.currentIndex];

  q.options.forEach((optText, idx) => {
    // Strip leading "A. " or "A) " if LLM included it
    const cleanOpt = optText.replace(/^[A-Da-d][\.\)]\s*/, "");

    const card = document.createElement("div");
    card.className = "quiz-option-card";
    if (currentAnswer === idx) {
      card.classList.add("selected");
    }

    card.innerHTML = `
      <div class="option-badge">${optionLetters[idx]}</div>
      <div class="option-text">${cleanOpt}</div>
    `;

    card.onclick = () => selectOption(idx);
    optionsGrid.appendChild(card);
  });

  // Feedback box resets for current question
  const feedbackBox = document.getElementById("questionFeedbackBox");
  feedbackBox.style.display = "none";

  // Update Navigation buttons
  const btnPrev = document.getElementById("btnPrevQuestion");
  const btnNext = document.getElementById("btnNextQuestion");
  const hintMsg = document.getElementById("quizHintMsg");

  btnPrev.disabled = currentQuiz.currentIndex === 0;

  if (currentQuiz.currentIndex === total - 1) {
    btnNext.textContent = "Submit Quiz 🎉";
  } else {
    btnNext.textContent = "Next Question →";
  }

  if (currentAnswer !== undefined) {
    btnNext.disabled = false;
    hintMsg.textContent = "Selection saved. Click next to proceed.";
  } else {
    btnNext.disabled = true;
    hintMsg.textContent = "Choose an option to continue";
  }
}

function selectOption(index) {
  currentQuiz.userAnswers[currentQuiz.currentIndex] = index;

  // Update option card visual states
  const cards = document.querySelectorAll(".quiz-option-card");
  cards.forEach((card, idx) => {
    card.classList.toggle("selected", idx === index);
  });

  // Enable Next button
  const btnNext = document.getElementById("btnNextQuestion");
  const hintMsg = document.getElementById("quizHintMsg");
  btnNext.disabled = false;
  hintMsg.textContent = "Option selected!";
}

function prevQuestion() {
  if (currentQuiz.currentIndex > 0) {
    currentQuiz.currentIndex--;
    renderCurrentQuestion();
  }
}

function nextQuestion() {
  const total = currentQuiz.questions.length;
  if (currentQuiz.currentIndex < total - 1) {
    currentQuiz.currentIndex++;
    renderCurrentQuestion();
  } else {
    // Submit Quiz
    submitQuiz();
  }
}

function submitQuiz() {
  let score = 0;
  const total = currentQuiz.questions.length;

  currentQuiz.questions.forEach((q, idx) => {
    if (currentQuiz.userAnswers[idx] === q.correct_index) {
      score++;
    }
  });

  // Hide playground, show results screen
  document.getElementById("quizPlayground").style.display = "none";
  const resultsScreen = document.getElementById("quizResultsScreen");
  resultsScreen.style.display = "block";

  // Populate Score
  document.getElementById("resultsScoreNum").textContent = score;
  document.getElementById("resultsTotalNum").textContent = total;

  const badge = document.getElementById("resultsBadge");
  const title = document.getElementById("resultsTitle");
  const comment = document.getElementById("resultsComment");

  if (score === total) {
    badge.textContent = "🏆";
    title.textContent = `Flawless, ${currentFriendName}!`;
    comment.textContent = "You scored 100%! You have completely mastered this concept.";
  } else if (score >= total * 0.6) {
    badge.textContent = "🎉";
    title.textContent = `Great Job, ${currentFriendName}!`;
    comment.textContent = "Solid score! Read the explanations below to iron out the remaining edge cases.";
  } else {
    badge.textContent = "💪";
    title.textContent = `Keep Going, ${currentFriendName}!`;
    comment.textContent = "Learning is an iterative process. Check the breakdown below to see what went wrong.";
  }

  // Populate Detailed Review List (Explain incorrect answers)
  renderReviewList();
  resultsScreen.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderReviewList() {
  const reviewContainer = document.getElementById("reviewItemsList");
  reviewContainer.innerHTML = "";

  const optionLetters = ["A", "B", "C", "D"];

  currentQuiz.questions.forEach((q, idx) => {
    const userChoiceIdx = currentQuiz.userAnswers[idx];
    const isCorrect = userChoiceIdx === q.correct_index;

    const userText = userChoiceIdx !== undefined 
      ? `${optionLetters[userChoiceIdx]}. ${q.options[userChoiceIdx].replace(/^[A-Da-d][\.\)]\s*/, "")}` 
      : "No answer selected";

    const correctText = `${optionLetters[q.correct_index]}. ${q.options[q.correct_index].replace(/^[A-Da-d][\.\)]\s*/, "")}`;

    const card = document.createElement("div");
    card.className = `review-card ${isCorrect ? "correct" : "incorrect"}`;

    card.innerHTML = `
      <div class="review-question-header">
        <div class="review-question-title">Q${idx + 1}. ${q.question}</div>
        <div class="review-outcome-pill">
          ${isCorrect ? "✅ Correct" : "❌ Needs Review"}
        </div>
      </div>

      <div class="review-answers-grid">
        <div class="review-answer-box user-choice">
          <strong>Your Answer:</strong><br>
          ${userText}
        </div>
        <div class="review-answer-box correct-choice">
          <strong>Correct Answer:</strong><br>
          ${correctText}
        </div>
      </div>

      <div class="review-explanation-box">
        <strong>💡 Why this is correct & concept breakdown:</strong><br>
        ${q.explanation || "Understanding this distinction helps avoid common exam traps."}
      </div>
    `;

    reviewContainer.appendChild(card);
  });
}

function retakeCurrentQuiz() {
  currentQuiz.currentIndex = 0;
  currentQuiz.userAnswers = {};
  document.getElementById("quizResultsScreen").style.display = "none";
  document.getElementById("quizPlayground").style.display = "block";
  renderCurrentQuestion();
}

function resetQuizView() {
  document.getElementById("quizResultsScreen").style.display = "none";
  document.getElementById("quizPlayground").style.display = "none";
  document.getElementById("quizInputForm").style.display = "block";
  const input = document.getElementById("quizTopicInput");
  if (input) {
    input.value = "";
    input.focus();
  }
}

// ==========================================================================
// FEATURE 3: STUDY TIPS & POMODORO
// ==========================================================================

async function handleGenerateTips() {
  const input = document.getElementById("tipsTopicInput");
  const topic = input ? input.value.trim() : "";
  const model = getSelectedModel();

  const btn = document.getElementById("btnGenTips");
  const btnText = document.getElementById("tipsBtnText");
  const spinner = document.getElementById("tipsSpinner");

  if (btn) btn.disabled = true;
  if (btnText) btnText.textContent = "Crafting Hacks...";
  if (spinner) spinner.style.display = "inline-block";

  try {
    const res = await fetch("/api/tips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, model })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      const resultBox = document.getElementById("tipsResultBox");
      const topicDisplay = document.getElementById("tipsTopicDisplay");
      const content = document.getElementById("tipsContent");

      topicDisplay.textContent = topic ? `Target: ${topic}` : "General Study Strategy";
      content.innerHTML = renderMarkdown(data.tips);
      resultBox.style.display = "block";
      resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  } catch (err) {
    console.error("Tips error:", err);
  } finally {
    if (btn) btn.disabled = false;
    if (btnText) btnText.textContent = "Generate Hacks";
    if (spinner) spinner.style.display = "none";
  }
}

// Pomodoro Timer Logic
function togglePomodoro() {
  const btn = document.getElementById("btnPomoToggle");
  if (isPomodoroRunning) {
    // Pause
    clearInterval(pomodoroTimer);
    isPomodoroRunning = false;
    if (btn) btn.textContent = "Resume Focus";
  } else {
    // Start
    isPomodoroRunning = true;
    if (btn) btn.textContent = "Pause";
    pomodoroTimer = setInterval(() => {
      if (pomodoroSecondsLeft > 0) {
        pomodoroSecondsLeft--;
        updatePomodoroDisplay();
      } else {
        clearInterval(pomodoroTimer);
        isPomodoroRunning = false;
        alert(`🔔 Pomodoro focus sprint complete, ${currentFriendName}! Time for a 5-minute breather.`);
        resetPomodoro();
      }
    }, 1000);
  }
}

function resetPomodoro() {
  clearInterval(pomodoroTimer);
  isPomodoroRunning = false;
  pomodoroSecondsLeft = 25 * 60;
  updatePomodoroDisplay();
  const btn = document.getElementById("btnPomoToggle");
  if (btn) btn.textContent = "Start Focus";
}

function updatePomodoroDisplay() {
  const display = document.getElementById("pomoTime");
  if (!display) return;
  const minutes = Math.floor(pomodoroSecondsLeft / 60);
  const seconds = pomodoroSecondsLeft % 60;
  display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ==========================================================================
// LIGHTWEIGHT MARKDOWN RENDERER
// ==========================================================================

function renderMarkdown(md) {
  if (!md) return "";

  let html = md;

  // Escape HTML entities to prevent XSS
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks: ```lang ... ```
  html = html.replace(/```([a-zA-Z0-9]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
  });

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Headers: ### Head
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // Unordered list items: - item or * item
  html = html.replace(/^\s*[-*]\s+(.*)$/gim, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>)/gim, "<ul>$1</ul>");
  // Clean adjacent lists
  html = html.replace(/<\/ul>\s*<ul>/g, "");

  // Ordered list items: 1. item
  html = html.replace(/^\s*(\d+)\.\s+(.*)$/gim, "<li>$2</li>");

  // Paragraphs for remaining newlines
  const paragraphs = html.split(/\n{2,}/);
  html = paragraphs.map(p => {
    p = p.trim();
    if (!p) return "";
    if (p.startsWith("<h") || p.startsWith("<pre") || p.startsWith("<ul") || p.startsWith("<ol")) {
      return p;
    }
    return `<p>${p.replace(/\n/g, "<br>")}</p>`;
  }).join("");

  return html;
}
