const STORAGE_KEY = 'taxi_wrongQuestions_v1';

let allWrongQuestions = [];
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) allWrongQuestions = JSON.parse(saved);
} catch (e) { console.warn('localStorage 讀取失敗'); }

function saveWrongQuestions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allWrongQuestions));
  } catch (e) { console.warn('localStorage 儲存失敗'); }
}

function updateWrongCount() {
  const countEl = document.getElementById('wrong-count');
  if (countEl) countEl.textContent = allWrongQuestions.length;
}

// ==================== 測驗核心 ====================
let currentQuestions = [];
let currentIndex = 0;
let score = 0;

const districtPool = [...new Set(questions.filter(q => q.type === "district").map(q => q.a))];
const streetPool = [...new Set(questions.filter(q => q.type === "street").map(q => q.a))];

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function showScreen(screen) {
  // 隱藏所有畫面
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('quiz-screen').classList.add('hidden');
  document.getElementById('result-screen').classList.add('hidden');
  document.getElementById('wrong-bank-screen').classList.add('hidden');

  // 顯示指定的畫面
  if (screen === 'start') document.getElementById('start-screen').classList.remove('hidden');
  if (screen === 'quiz') document.getElementById('quiz-screen').classList.remove('hidden');
  if (screen === 'result') document.getElementById('result-screen').classList.remove('hidden');
  if (screen === 'wrong-bank') document.getElementById('wrong-bank-screen').classList.remove('hidden');
}

function startQuiz() {
  currentQuestions = shuffle([...questions]);
  currentIndex = 0;
  score = 0;
  showScreen('quiz');
  loadQuestion();
}

function loadQuestion() {
  const q = currentQuestions[currentIndex];
  document.getElementById('current').textContent = currentIndex + 1;
  document.getElementById('total').textContent = currentQuestions.length;
  document.getElementById('question-text').innerHTML = `以下地方的位置是？<br><strong>${q.q}</strong>`;

  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = "";

  let pool = q.type === "district" ? districtPool : streetPool;
  let wrongs = pool.filter(a => a !== q.a);
  wrongs = shuffle(wrongs).slice(0, 2);
  let opts = shuffle([q.a, ...wrongs]);

  opts.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => checkAnswer(opt, q.a, q);
    optionsDiv.appendChild(btn);
  });
}

function checkAnswer(selected, correct, question) {
  const btns = document.querySelectorAll("#options button");
  btns.forEach(b => b.disabled = true);

  const isCorrect = selected === correct;

  if (isCorrect) {
    btns.forEach(b => { if (b.textContent === correct) b.classList.add("correct"); });
  } else {
    btns.forEach(b => {
      if (b.textContent === correct) b.classList.add("correct");
      if (b.textContent === selected) b.classList.add("wrong");
    });
    if (!allWrongQuestions.find(w => w.id === question.id)) {
      allWrongQuestions.push(question);
      saveWrongQuestions();
      updateWrongCount();
    }
  }

  // 顯示結果
  showScreen('result');

  document.getElementById('feedback').innerHTML = isCorrect 
    ? `<span style="color:green; font-size:24px;">✅ 正確！</span>` 
    : `<span style="color:red; font-size:24px;">❌ 錯誤</span>`;

  document.getElementById('correct-answer').innerHTML = `正確答案：<strong>${correct}</strong>`;

  const mapQuery = encodeURIComponent(question.q + ", Hong Kong");
  document.getElementById('map-container').innerHTML = `
    <p>📍 位置地圖：</p>
    <a href="https://www.google.com/maps/search/?api=1&query=${mapQuery}" 
       target="_blank" style="font-size:18px; color:#1a5f8a; text-decoration:underline;">
      🔗 在 Google Maps 打開「<strong>${question.q}</strong>」
    </a>
    <br><br>
    <small>（精準顯示題目中的建築位置，例如「新都會廣場」）</small>`;
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex >= currentQuestions.length) {
    alert(`測驗結束！得分：${score} / ${currentQuestions.length}`);
    restartQuiz();
  } else {
    showScreen('quiz');
    loadQuestion();
  }
}

function restartQuiz() {
  // 徹底清除所有畫面殘留
  document.getElementById('question-text').innerHTML = '';
  document.getElementById('options').innerHTML = '';
  document.getElementById('feedback').innerHTML = '';
  document.getElementById('correct-answer').innerHTML = '';
  document.getElementById('map-container').innerHTML = '';

  // 重置變數
  currentQuestions = [];
  currentIndex = 0;
  score = 0;

  // 回到最乾淨的首頁
  showScreen('start');
}

// ==================== 錯題庫 ====================
function showWrongBank() {
  const listDiv = document.getElementById('wrong-list');
  listDiv.innerHTML = "";
  document.getElementById('wrong-total').textContent = allWrongQuestions.length;

  if (allWrongQuestions.length === 0) {
    listDiv.innerHTML = "<p style='color:#666;text-align:center;padding:30px;'>目前沒有錯題～繼續努力！</p>";
  } else {
    allWrongQuestions.forEach(q => {
      const div = document.createElement('div');
      div.style = "border:1px solid #ddd; padding:12px; margin:8px 0; border-radius:8px;";
      div.innerHTML = `<strong>Q${q.id}：</strong> ${q.q}<br><span style="color:#d32f2f">正確答案：${q.a}</span>`;
      listDiv.appendChild(div);
    });
  }
  showScreen('wrong-bank');
}

function reviewAllWrong() {
  if (allWrongQuestions.length === 0) return alert("沒有錯題！");
  currentQuestions = shuffle([...allWrongQuestions]);
  currentIndex = 0;
  showScreen('quiz');
  loadQuestion();
}

function clearWrongBank() {
  if (confirm("確定要清空全部錯題庫嗎？")) {
    allWrongQuestions = [];
    saveWrongQuestions();
    updateWrongCount();
    showWrongBank();
  }
}

// 初始化
updateWrongCount();