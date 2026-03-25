const itemsArea = document.getElementById('items-area');
const claw = document.getElementById('claw-body');
const targetText = document.getElementById('target-answer');
const scoreText = document.getElementById('score');
const timerText = document.getElementById('timer');
const gameOverOverlay = document.getElementById('game-over-overlay');
const winOverlay = document.getElementById('win-overlay');
const finalScoreText = document.getElementById('final-score');

let playerName = "挑戰者"; 
let clawX = 225;
let score = 0;
let timeLeft = 600; 
let isDropping = false;
let isGameOver = false;
let gameTimer = null;
let currentCorrectAnswer = "";
let availableQuestions = [];

const antiFraudPool = [
    { q: "消費者服務專線的電話是？", options: ["📞 1950", "📞 110", "📞 119", "📞 123"], a: "📞 1950" },
    { q: "以下哪些是常見的詐騙手法？", options: ["💌 網路交友", "📈 假投資", "✅ 以上皆是", "🎁 領點數"], a: "✅ 以上皆是" },
    { q: "收到自稱檢察官電話說要監管帳戶？", options: ["☎️ 撥打 165", "💰 匯款給他", "🏦 操作 ATM"], a: "☎️ 撥打 165" },
    { q: "賄選檢舉專線為", options: ["📞 0800-024-099#4", "📞 113", "📞 2882-5252", "📞 119"], a: "📞 0800-024-099#4" },
    { q: "請幫文山區公所政風室點個讚", options: ["政風室，讚。"], a: "政風室，讚。" },
    { q: "透明晶質獎是哪個機關辦理的？", options: ["法務部廉政署", "數發部", "農委會", "體育部"], a: "法務部廉政署" },
    { q: "發現賄選時，正確的處理方式是？", options: ["將鈔票收下", "告訴樁腳找其他鄰居", "保留證據，撥打檢舉專線"], a: "保留證據，撥打檢舉專線" },
    { q: "採購的公務人員可以收下承包廠商的年節送禮嗎？", options: ["當然可以", "應予拒絕或退還"], a: "應予拒絕或退還" },
    { q: "電腦開機密碼時常忘記，所以最好都不要換比較好？", options: ["對，我就懶(^y^)", "定期更換，保護機密安全", "看我心情(´ー`)"], a: "定期更換，公務機密人人有責" },
    { q: "公益揭弊者保護法中所稱的「揭弊者」是指？", options: ["政府機關（構）之人", "國營事業之人", "受政府控制之事業團體之人", "以上皆是"], a: "以上皆是" }
];

/* --- 控制功能 --- */

function moveLeft() {
    if (!isDropping && !isGameOver) {
        if (clawX > 30) { clawX -= 30; claw.style.left = clawX + 'px'; }
    }
}

function moveRight() {
    if (!isDropping && !isGameOver) {
        const maxRight = itemsArea.clientWidth - 60;
        if (clawX < maxRight) { clawX += 30; claw.style.left = clawX + 'px'; }
    }
}

function dropClaw() {
    if (isDropping || isGameOver) return;
    isDropping = true;
    const items = document.querySelectorAll('.item');
    const maxDropDepth = 280; 
    let caughtItem = null;
    let highestY = 999;

    items.forEach(item => {
        const itemCenterX = item.offsetLeft + (item.offsetWidth / 2);
        if (Math.abs(clawX + 25 - itemCenterX) < 45) {
            if (item.offsetTop < highestY) { highestY = item.offsetTop; caughtItem = item; }
        }
    });

    const stopDepth = caughtItem ? (highestY - 5) : maxDropDepth;
    claw.style.top = stopDepth + "px";

    setTimeout(() => {
        if (caughtItem) {
            caughtItem.style.transition = "top 0.7s";
            caughtItem.style.bottom = "auto";
            caughtItem.style.top = (stopDepth + 30) + "px";
            setTimeout(() => {
                caughtItem.style.top = "-150px";
                if (caughtItem.innerText === currentCorrectAnswer) {
                    score += 10;
                    scoreText.innerText = score;
                    if (score >= 100) winGame();
                    else { timeLeft += 5; timerText.innerText = timeLeft; setTimeout(initGame, 500); }
                } else {
                    alert("❌ 答錯了！");
                    caughtItem.remove();
                }
            }, 100);
        }
        claw.style.top = "0px";
        setTimeout(() => isDropping = false, 700);
    }, 750);
}

// 修正：純粹打亂位置，不換題目
function shufflePositions() {
    if (isDropping || isGameOver) return;
    const items = document.querySelectorAll('.item');
    items.forEach(item => {
        item.style.transition = "all 0.5s ease"; // 增加滑動效果
        item.style.left = Math.random() * (itemsArea.clientWidth - 110) + 'px';
        item.style.bottom = (Math.random() * 120 + 20) + 'px';
    });
}

/* --- 遊戲核心流程 --- */

window.onload = function() {
    document.getElementById('start-btn').onclick = startGameWithoutInput;
    document.getElementById('btn-left').onclick = moveLeft;
    document.getElementById('btn-right').onclick = moveRight;
    document.getElementById('btn-drop').onclick = dropClaw;

    document.addEventListener('keydown', function(e) {
        if (isGameOver) return;
        if (e.code === 'ArrowLeft') moveLeft();
        if (e.code === 'ArrowRight') moveRight();
        if (e.code === 'Space') { e.preventDefault(); dropClaw(); }
    });
};

function startGameWithoutInput() {
    document.getElementById('user-display').innerText = "挑戰者：" + playerName;
    document.getElementById('login-overlay').style.display = 'none';
    restartGame();
}

function restartGame() {
    score = 0; timeLeft = 600; isGameOver = false; isDropping = false; clawX = 225;
    availableQuestions = [...antiFraudPool];
    scoreText.innerText = "0";
    timerText.innerText = "600";
    claw.style.left = "225px"; claw.style.top = "0px";
    gameOverOverlay.style.display = 'none';
    winOverlay.style.display = 'none';
    initGame();
    startTimer();
}

function startTimer() {
    clearInterval(gameTimer);
    gameTimer = setInterval(() => {
        if (!isGameOver) {
            timeLeft--;
            timerText.innerText = timeLeft;
            if (timeLeft <= 0) endGame();
        }
    }, 1000);
}

function initGame() {
    itemsArea.innerHTML = '';
    if (availableQuestions.length === 0) availableQuestions = [...antiFraudPool];
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const currentLevel = availableQuestions[randomIndex];
    availableQuestions.splice(randomIndex, 1); 
    targetText.innerText = currentLevel.q;
    currentCorrectAnswer = currentLevel.a;

    currentLevel.options.forEach((text) => {
        const item = document.createElement('div');
        item.className = 'item';
        item.innerText = text;
        itemsArea.appendChild(item);
        // 初始化隨機位置
        item.style.left = Math.random() * (itemsArea.clientWidth - 110) + 'px';
        item.style.bottom = (Math.random() * 120 + 20) + 'px';
    });
}

function endGame() { 
    isGameOver = true; clearInterval(gameTimer); 
    finalScoreText.innerText = score;
    gameOverOverlay.style.display = 'flex'; 
}

function winGame() { 
    isGameOver = true; clearInterval(gameTimer); 
    winOverlay.style.display = 'flex'; 
}

function confirmReset() { if (confirm("確定重新開始？")) restartGame(); }

(function() {
    document.addEventListener('touchstart', function(event) {
        if (event.touches.length > 1) event.preventDefault();
    }, { passive: false });
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            if (event.target.tagName !== 'BUTTON') event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
})();
