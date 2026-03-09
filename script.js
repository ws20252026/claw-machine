const itemsArea = document.getElementById('items-area');
const claw = document.getElementById('claw-body');
const targetText = document.getElementById('target-answer');
const scoreText = document.getElementById('score');
const timerText = document.getElementById('timer');
const gameOverOverlay = document.getElementById('game-over-overlay');
const winOverlay = document.getElementById('win-overlay');
const finalScoreText = document.getElementById('final-score');

let playerName = "";
let clawX = 250;
let score = 0;
let timeLeft = 60; 
let isDropping = false;
let isGameOver = false;
let gameTimer = null;
let currentCorrectAnswer = "";

// 原始題庫
const antiFraudPool = [
    { q: "消費者服務專線的電話是？", options: ["📞 1950", "📞 110", "📞 119", "📞 123"], a: "📞 1950" },
    { q: "以下哪些是常見的詐騙手法？", options: ["💌 網路交友", "📈 假投資", "✅ 以上皆是", "🎁 領點數"], a: "✅ 以上皆是" },
    { q: "收到自稱檢察官電話說要監管帳戶？", options: ["☎️ 撥打 165", "💰 匯款給他", "🏦 操作 ATM", ], a: "☎️ 撥打 165" },
    { q: "賄選檢舉專線為", options: ["📞 0800-024-099#4", "📞 2936-5522", "📞 2882-5252", "📞 119"], a: "📞 0800-024-099#4" },
    { q: "公務員赴大陸事後返臺上班多久內應填寫「返臺通報表」？", options: ["一星期內", "不用填(ﾟ∀。)", "一年後", "一年內"], a: "一星期內" },
    { q: "透明晶質獎的執行機關是？", options: ["廉政署", "數發部", "文山區公所", "體育部"], a: "廉政署" },
    { q: "透明晶質獎舉辦目的是？", options: ["推動廉能治理", "激勵行政團隊", "樹立標竿學習", "以上皆是"], a: "以上皆是" },
    { q: "依規定，公務員收受與職務有利害關係者之餽贈，市價在多少以下為例外？", options: ["新臺幣200元", "新臺幣1000元", "辛巴威幣500000元", "新臺幣2000元"], a: "新臺幣200元" },
    { q: "電腦開機密碼時常忘記，所以最好都不要換比較好？", options: ["對，我就懶(^y^)", "定期更換，公務機密人人有責", "看我心情(´ー`)"], a: "定期更換，公務機密人人有責" },
    { q: "公益揭弊者保護法的所保護「揭弊的人」為？", options: ["政府機關（構）", "國營事業", "受政府控制之事業團體", "以上皆是"], a: "以上皆是" }
];

// 【關鍵修改 1】定義剩餘題庫副本
let availableQuestions = [];

function startGameWithLogin() {
    const input = document.getElementById('player-name');
    if (input.value.trim() === "") {
        alert("請輸入挑戰者姓名！");
        return;
    }
    playerName = input.value;
    document.getElementById('user-display').innerText = "挑戰者：" + playerName;
    document.getElementById('winner-name-display').innerText = playerName;
    document.getElementById('login-overlay').style.display = 'none';
    restartGame();
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

function endGame() {
    isGameOver = true;
    clearInterval(gameTimer);
    gameOverOverlay.style.display = 'flex';
    finalScoreText.innerText = score;
}

function winGame() {
    isGameOver = true;
    clearInterval(gameTimer);
    winOverlay.style.display = 'flex';
}

function confirmReset() {
    if (isGameOver || !playerName) return;
    if (confirm("確定要重頭開始遊戲嗎？")) {
        restartGame();
    }
}

function restartGame() {
    score = 0;
    timeLeft = 60; 
    isGameOver = false;
    isDropping = false;
    clawX = 250;
    
    // 【關鍵修改 2】重新開始時重置題庫
    availableQuestions = [...antiFraudPool]; 
    
    scoreText.innerText = "0";
    timerText.innerText = "60";
    claw.style.left = "250px";
    claw.style.top = "0px";
    gameOverOverlay.style.display = 'none';
    winOverlay.style.display = 'none';
    
    initGame();
    startTimer();
}

function initGame() {
    itemsArea.innerHTML = '';

    // 【關鍵修改 3】檢查題目是否用完，用完就重來
    if (availableQuestions.length === 0) {
        availableQuestions = [...antiFraudPool];
    }

    // 隨機選一題並從副本移除
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const currentLevel = availableQuestions[randomIndex];
    availableQuestions.splice(randomIndex, 1);

    targetText.innerHTML = currentLevel.q; // 支援 HTML 換行
    currentCorrectAnswer = currentLevel.a;
    
    const placedItems = [];
    currentLevel.options.forEach((text) => {
        const item = document.createElement('div');
        item.className = 'item';
        item.innerText = text;
        itemsArea.appendChild(item);

        let randomLeft, randomBottom, attempts = 0;
        do {
            randomLeft = Math.floor(Math.random() * (itemsArea.offsetWidth - 100)) + 25;
            randomBottom = Math.floor(Math.random() * 200) + 40; 
            let isOverlapping = false;
            for (let other of placedItems) {
                if (Math.abs(randomLeft - other.left) < 100 && Math.abs(randomBottom - other.bottom) < 50) {
                    isOverlapping = true;
                    break;
                }
            }
            if (!isOverlapping || attempts > 50) break;
            attempts++;
        } while (true);

        placedItems.push({ left: randomLeft, bottom: randomBottom });
        item.style.left = randomLeft + 'px';
        item.style.bottom = randomBottom + 'px';
    });
}

window.addEventListener('keydown', (e) => {
    if (isDropping || isGameOver || !playerName) return;
    if (e.key === "ArrowLeft" && clawX > 40) clawX -= 25;
    if (e.key === "ArrowRight" && clawX < 480) clawX += 25;
    if (e.key === " " || e.code === "Space") {
        e.preventDefault(); 
        dropClaw(); 
    }
    claw.style.left = clawX + 'px';
});

function dropClaw() {
    if (isDropping || isGameOver) return;
    isDropping = true;
    const items = document.querySelectorAll('.item');
    const maxDropDepth = 430; 
    let caughtItem = null;
    let highestY = 999; 

    items.forEach(item => {
        const itemCenterX = item.offsetLeft + 40; 
        const distX = Math.abs(clawX - itemCenterX);
        if (distX < 50) { 
            if (item.offsetTop < highestY) {
                highestY = item.offsetTop;
                caughtItem = item;
            }
        }
    });

    const stopDepth = caughtItem ? (highestY - 5) : maxDropDepth;
    claw.style.top = stopDepth + "px";

    setTimeout(() => {
        if (caughtItem) {
            caughtItem.style.transition = "top 0.7s";
            caughtItem.style.bottom = "auto";
            caughtItem.style.top = (stopDepth + 35) + "px";
            
            setTimeout(() => {
                caughtItem.style.top = "-100px"; 
                if (caughtItem.innerText === currentCorrectAnswer) {
                    score += 10; 
                    scoreText.innerText = score;
                    if (score >= 100) { 
                        winGame();
                    } else {
                        timeLeft += 8; 
                        timerText.innerText = timeLeft;
                        setTimeout(() => {
                            initGame();
                        }, 500);
                    }
                } else {
                    alert("⚠️ 答錯！選項移除。"); 
                    caughtItem.remove(); 
                }
            }, 50);
        }
        claw.style.top = "0px";
        setTimeout(() => { isDropping = false; }, 700);
    }, 750);
}
