const STORAGE_KEYS = {
    data: 'wordPracticeSourceData',
    settings: 'wordPracticeSettings'
};

const state = {
    parsedItems: [],
    invalidItems: [],
    currentIndex: 0,
    score: 0,
    deck: [],
    results: [],
    answered: false,
    previewRequestId: 0,
    study: {
        deck: [],
        currentIndex: 0,
        flipped: false
    }
};

const els = {
    sourceInput: document.getElementById('sourceInput'),
    parseInfo: document.getElementById('parseInfo'),
    loadSampleBtn: document.getElementById('loadSampleBtn'),
    clearInputBtn: document.getElementById('clearInputBtn'),
    saveInputBtn: document.getElementById('saveInputBtn'),
    startBtn: document.getElementById('startBtn'),
    startStudyBtn: document.getElementById('startStudyBtn'),
    randomOrder: document.getElementById('randomOrder'),
    ignoreSpaces: document.getElementById('ignoreSpaces'),
    ignoreCase: document.getElementById('ignoreCase'),
    studyRandomOrder: document.getElementById('studyRandomOrder'),
    parsedCount: document.getElementById('parsedCount'),
    invalidCount: document.getElementById('invalidCount'),
    previewHint: document.getElementById('previewHint'),
    previewList: document.getElementById('previewList'),
    quizSection: document.getElementById('quizSection'),
    studySection: document.getElementById('studySection'),
    resultSection: document.getElementById('resultSection'),
    studyProgressText: document.getElementById('studyProgressText'),
    studyProgressBar: document.getElementById('studyProgressBar'),
    studyModeBadge: document.getElementById('studyModeBadge'),
    studyCard: document.getElementById('studyCard'),
    flashcardFrontLabel: document.getElementById('flashcardFrontLabel'),
    flashcardFrontText: document.getElementById('flashcardFrontText'),
    flashcardBackLabel: document.getElementById('flashcardBackLabel'),
    flashcardBackText: document.getElementById('flashcardBackText'),
    studyHintText: document.getElementById('studyHintText'),
    studyPrevBtn: document.getElementById('studyPrevBtn'),
    flipCardBtn: document.getElementById('flipCardBtn'),
    studyNextBtn: document.getElementById('studyNextBtn'),
    studyRestartBtn: document.getElementById('studyRestartBtn'),
    shuffleStudyBtn: document.getElementById('shuffleStudyBtn'),
    progressText: document.getElementById('progressText'),
    scoreText: document.getElementById('scoreText'),
    progressBar: document.getElementById('progressBar'),
    modeBadge: document.getElementById('modeBadge'),
    questionGuide: document.getElementById('questionGuide'),
    questionText: document.getElementById('questionText'),
    answerInput: document.getElementById('answerInput'),
    checkBtn: document.getElementById('checkBtn'),
    showAnswerBtn: document.getElementById('showAnswerBtn'),
    skipBtn: document.getElementById('skipBtn'),
    nextBtn: document.getElementById('nextBtn'),
    restartBtn: document.getElementById('restartBtn'),
    feedback: document.getElementById('feedback'),
    answerReveal: document.getElementById('answerReveal'),
    resultSummary: document.getElementById('resultSummary'),
    reviewList: document.getElementById('reviewList'),
    retryWrongBtn: document.getElementById('retryWrongBtn')
};

function escapeHtml(value = '') {
    return String(value).replace(/[&<>"']/g, (char) => {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return map[char] || char;
    });
}

function cleanSpacing(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
}

function debounce(callback, delay = 250) {
    let timeoutId;
    return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => callback(...args), delay);
    };
}

function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function getSelectedMode() {
    const selected = document.querySelector('input[name="mode"]:checked');
    return selected ? selected.value : 'en-to-ko';
}

function getSelectedStudyMode() {
    const selected = document.querySelector('input[name="studyMode"]:checked');
    return selected ? selected.value : 'ko-front';
}

function saveSettings() {
    const settings = {
        mode: getSelectedMode(),
        studyMode: getSelectedStudyMode(),
        randomOrder: els.randomOrder.checked,
        studyRandomOrder: els.studyRandomOrder.checked,
        ignoreSpaces: els.ignoreSpaces.checked,
        ignoreCase: els.ignoreCase.checked
    };

    try {
        localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    } catch (error) {
        console.warn('설정을 저장하지 못했습니다.', error);
    }
}

function loadSettings() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.settings);
        if (!raw) return;
        const settings = JSON.parse(raw);

        if (settings.mode) {
            const radio = document.querySelector(`input[name="mode"][value="${settings.mode}"]`);
            if (radio) radio.checked = true;
        }
        if (settings.studyMode) {
            const radio = document.querySelector(`input[name="studyMode"][value="${settings.studyMode}"]`);
            if (radio) radio.checked = true;
        }
        if (typeof settings.randomOrder === 'boolean') els.randomOrder.checked = settings.randomOrder;
        if (typeof settings.studyRandomOrder === 'boolean') els.studyRandomOrder.checked = settings.studyRandomOrder;
        if (typeof settings.ignoreSpaces === 'boolean') els.ignoreSpaces.checked = settings.ignoreSpaces;
        if (typeof settings.ignoreCase === 'boolean') els.ignoreCase.checked = settings.ignoreCase;
    } catch (error) {
        console.warn('설정을 불러오지 못했습니다.', error);
    }
}

function saveInputData() {
    try {
        localStorage.setItem(STORAGE_KEYS.data, els.sourceInput.value);
    } catch (error) {
        console.warn('입력값을 저장하지 못했습니다.', error);
    }
}

function loadInputData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.data);
        els.sourceInput.value = saved && saved.trim() ? saved : (window.__APP__?.sampleData || '');
    } catch (error) {
        els.sourceInput.value = window.__APP__?.sampleData || '';
    }
}

function normalizeText(text, direction) {
    let value = String(text || '').trim();
    value = value
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/[\[\]]/g, '')
        .replace(/[.,!?;:。！？]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    if (direction === 'ko-to-en' && els.ignoreCase.checked) {
        value = value.toLowerCase();
    }

    if (els.ignoreSpaces.checked) {
        value = value.replace(/\s+/g, '');
    }

    return value;
}

function expandBracketVariants(text) {
    const results = new Set();

    function helper(str) {
        const open = str.indexOf('[');
        if (open === -1) {
            const cleaned = cleanSpacing(str);
            if (cleaned) results.add(cleaned);
            return;
        }

        const close = str.indexOf(']', open);
        if (close === -1) {
            const cleaned = cleanSpacing(str.replace(/[\[\]]/g, ''));
            if (cleaned) results.add(cleaned);
            return;
        }

        const before = str.slice(0, open);
        const inside = str.slice(open + 1, close);
        const after = str.slice(close + 1);
        const options = inside.split(/[|/]/).map((part) => cleanSpacing(part)).filter(Boolean);

        const attachedWordMatch = before.match(/(\S+)$/);
        if (attachedWordMatch && before && !/\s$/.test(before)) {
            const attachedWord = attachedWordMatch[1];
            const prefix = before.slice(0, before.length - attachedWord.length);
            helper(prefix + attachedWord + after);
            options.forEach((option) => helper(prefix + option + after));
        } else {
            helper(before + after);
            options.forEach((option) => helper(before + option + after));
        }
    }

    helper(String(text || ''));
    const cleanedOriginal = cleanSpacing(String(text || '').replace(/[\[\]]/g, ''));
    if (cleanedOriginal) results.add(cleanedOriginal);
    return [...results];
}

function buildAcceptedAnswers(card) {
    const rawAnswer = card.direction === 'en-to-ko' ? card.korean : card.english;
    const set = new Set();

    if (card.direction === 'ko-to-en') {
        rawAnswer.split('|').map((part) => cleanSpacing(part)).filter(Boolean).forEach((part) => {
            expandBracketVariants(part).forEach((variant) => set.add(variant));
        });
    } else {
        rawAnswer.split('|').map((part) => cleanSpacing(part)).filter(Boolean).forEach((part) => {
            if (part) set.add(part);
        });
    }

    set.add(cleanSpacing(rawAnswer));
    return [...set].filter(Boolean);
}

async function requestParse(content) {
    const response = await fetch('/api/cards/parse', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
    });

    if (!response.ok) {
        throw new Error('parse failed');
    }

    return response.json();
}

function renderParseInfo(data) {
    if (!els.sourceInput.value.trim()) {
        els.parseInfo.innerHTML = '문장을 입력하면 자동으로 형식을 확인합니다.';
        return;
    }

    const invalidPreview = (data.invalid || []).slice(0, 2).map((item) => {
        return `${item.lineNo}번 줄: ${escapeHtml(item.text)}`;
    });

    let html = `<strong>${data.itemCount}</strong>개 문장을 인식했습니다.`;

    if (data.invalidCount > 0) {
        html += `<br><strong>${data.invalidCount}</strong>개 줄은 형식을 다시 확인해 주세요.`;
        html += `<br>${invalidPreview.join(' / ')}`;
    } else {
        html += '<br>형식이 정상입니다. 바로 퀴즈나 카드 학습을 시작할 수 있어요.';
    }

    els.parseInfo.innerHTML = html;
}

function renderPreviewList(data) {
    els.parsedCount.textContent = String(data.itemCount || 0);
    els.invalidCount.textContent = String(data.invalidCount || 0);

    const previews = [];
    const items = data.items || [];
    const invalid = data.invalid || [];

    if (!items.length && !invalid.length) {
        els.previewHint.textContent = '입력하면 여기서 바로 카드 미리보기를 볼 수 있습니다.';
        els.previewList.innerHTML = '';
        return;
    }

    els.previewHint.textContent = items.length
        ? '처음 몇 개 카드만 미리 보여 주고, 실제 퀴즈는 전체 카드로 진행됩니다.'
        : '정상적으로 인식된 카드가 아직 없습니다.';

    items.slice(0, 5).forEach((item, index) => {
        previews.push(`
            <article class="preview-item">
                <strong>${index + 1}. ${escapeHtml(item.english)}</strong>
                <span>${escapeHtml(item.korean)}</span>
            </article>
        `);
    });

    invalid.slice(0, 2).forEach((item) => {
        previews.push(`
            <article class="preview-item invalid">
                <strong>${item.lineNo}번 줄 형식 확인</strong>
                <p>${escapeHtml(item.text)}</p>
            </article>
        `);
    });

    els.previewList.innerHTML = previews.join('');
}

function applyParseResult(data) {
    state.parsedItems = data.items || [];
    state.invalidItems = data.invalid || [];
    renderParseInfo(data);
    renderPreviewList(data);
}

function showParseError() {
    els.parseInfo.innerHTML = '미리보기를 불러오지 못했습니다. 서버가 켜져 있는지 확인해 주세요.';
    els.previewHint.textContent = '서버 응답이 없어서 미리보기를 보여주지 못했습니다.';
    els.previewList.innerHTML = '';
}

async function refreshPreview(content) {
    const requestId = ++state.previewRequestId;

    if (!content.trim()) {
        state.parsedItems = [];
        state.invalidItems = [];
        renderParseInfo({ itemCount: 0, invalidCount: 0, items: [], invalid: [] });
        renderPreviewList({ itemCount: 0, invalidCount: 0, items: [], invalid: [] });
        return { items: [], invalid: [], itemCount: 0, invalidCount: 0 };
    }

    try {
        const data = await requestParse(content);
        if (requestId !== state.previewRequestId) {
            return data;
        }
        applyParseResult(data);
        return data;
    } catch (error) {
        if (requestId === state.previewRequestId) {
            showParseError();
        }
        throw error;
    }
}

const debouncedRefreshPreview = debounce(() => {
    refreshPreview(els.sourceInput.value).catch(() => {});
}, 280);

async function getLatestItems() {
    const data = await refreshPreview(els.sourceInput.value);
    return data.items || [];
}

function getCurrentCard() {
    return state.deck[state.currentIndex];
}

function getQuestionText(card) {
    return card.direction === 'en-to-ko' ? card.english : card.korean;
}

function getCorrectAnswer(card) {
    return card.direction === 'en-to-ko' ? card.korean : card.english;
}

function buildDeck(items) {
    const mode = getSelectedMode();
    let deck = items.map((item) => {
        const direction = mode === 'mixed'
            ? (Math.random() < 0.5 ? 'en-to-ko' : 'ko-to-en')
            : mode;

        return {
            ...item,
            direction
        };
    });

    if (els.randomOrder.checked) {
        deck = shuffle(deck);
    }

    return deck;
}

function getStudySideLabel(card, side) {
    const isKoreanFront = card.studyFront === 'ko-front';
    const frontLabel = isKoreanFront ? '한국어' : '영어';
    const backLabel = isKoreanFront ? '영어' : '한국어';
    return side === 'front' ? `앞면 · ${frontLabel}` : `뒷면 · ${backLabel}`;
}

function getStudySideText(card, side) {
    const isKoreanFront = card.studyFront === 'ko-front';
    if (side === 'front') {
        return isKoreanFront ? card.korean : card.english;
    }
    return isKoreanFront ? card.english : card.korean;
}

function getStudyModeText(card) {
    if (!card) return '한국어 먼저';
    return card.studyFront === 'ko-front' ? '한국어 먼저' : '영어 먼저';
}

function buildStudyDeck(items) {
    const mode = getSelectedStudyMode();
    let deck = items.map((item) => {
        const studyFront = mode === 'mixed'
            ? (Math.random() < 0.5 ? 'ko-front' : 'en-front')
            : mode;

        return {
            ...item,
            studyFront
        };
    });

    if (els.studyRandomOrder.checked) {
        deck = shuffle(deck);
    }

    return deck;
}

function updateStudyHeader() {
    const total = state.study.deck.length;
    const currentCard = state.study.deck[state.study.currentIndex];
    const progressPercent = total ? ((state.study.currentIndex + 1) / total) * 100 : 0;

    els.studyProgressText.textContent = total
        ? `카드 ${state.study.currentIndex + 1} / ${total}`
        : '카드 0 / 0';
    els.studyModeBadge.textContent = getStudyModeText(currentCard);
    els.studyProgressBar.style.width = `${progressPercent}%`;
}

function renderStudyCard() {
    const card = state.study.deck[state.study.currentIndex];
    if (!card) return;

    updateStudyHeader();
    els.studyCard.classList.toggle('is-flipped', state.study.flipped);
    els.flashcardFrontLabel.textContent = getStudySideLabel(card, 'front');
    els.flashcardBackLabel.textContent = getStudySideLabel(card, 'back');
    els.flashcardFrontText.textContent = getStudySideText(card, 'front');
    els.flashcardBackText.textContent = getStudySideText(card, 'back');
    els.studyHintText.textContent = state.study.flipped
        ? '현재 카드는 뒷면이 보이는 상태입니다. 다시 누르면 앞면으로 돌아갑니다.'
        : '현재 카드는 앞면이 보이는 상태입니다. 카드를 누르면 반대쪽 뜻이 나옵니다.';

    els.studyPrevBtn.disabled = state.study.currentIndex === 0;
    els.studyNextBtn.disabled = state.study.currentIndex === state.study.deck.length - 1;
}

async function startStudy(overrideDeck = null) {
    const items = overrideDeck ? [...overrideDeck] : await getLatestItems();
    const deck = overrideDeck ? [...overrideDeck] : buildStudyDeck(items);

    if (!deck.length) {
        alert('단어 카드로 만들 문장을 먼저 입력해 주세요.');
        return;
    }

    state.study.deck = deck;
    state.study.currentIndex = 0;
    state.study.flipped = false;

    els.studySection.classList.remove('hidden');
    renderStudyCard();
    els.studySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function flipStudyCard() {
    if (!state.study.deck.length) return;
    state.study.flipped = !state.study.flipped;
    renderStudyCard();
}

function goStudyNext() {
    if (!state.study.deck.length) return;
    if (state.study.currentIndex >= state.study.deck.length - 1) return;
    state.study.currentIndex += 1;
    state.study.flipped = false;
    renderStudyCard();
}

function goStudyPrev() {
    if (!state.study.deck.length) return;
    if (state.study.currentIndex <= 0) return;
    state.study.currentIndex -= 1;
    state.study.flipped = false;
    renderStudyCard();
}

function restartStudy() {
    if (!state.study.deck.length) return;
    state.study.currentIndex = 0;
    state.study.flipped = false;
    renderStudyCard();
    els.studySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function shuffleStudyCards() {
    const items = await getLatestItems();
    if (!items.length) {
        alert('단어 카드로 만들 문장을 먼저 입력해 주세요.');
        return;
    }
    startStudy(buildStudyDeck(items));
}

function setFeedback(type, html) {
    els.feedback.className = `feedback ${type}`;
    els.feedback.innerHTML = html;
    els.feedback.classList.remove('hidden');
}

function hideFeedback() {
    els.feedback.className = 'feedback hidden';
    els.feedback.innerHTML = '';
}

function renderAnswerReveal(card) {
    els.answerReveal.innerHTML = `
        <h3>정답</h3>
        <div class="answer-pair">
            <div><span class="chip">영어</span>${escapeHtml(card.english)}</div>
            <div><span class="chip">한국어</span>${escapeHtml(card.korean)}</div>
        </div>
    `;
    els.answerReveal.classList.remove('hidden');
}

function hideAnswerReveal() {
    els.answerReveal.classList.add('hidden');
    els.answerReveal.innerHTML = '';
}

function updateQuizHeader() {
    const total = state.deck.length;
    const solvedCount = state.results.length;
    const progressPercent = total ? (solvedCount / total) * 100 : 0;
    els.progressText.textContent = `문제 ${state.currentIndex + 1} / ${total}`;
    els.scoreText.textContent = `점수 ${state.score}`;
    els.progressBar.style.width = `${progressPercent}%`;
}

function renderQuestion() {
    const card = getCurrentCard();
    if (!card) return;

    state.answered = false;
    updateQuizHeader();
    hideFeedback();
    hideAnswerReveal();

    const isEnglishToKorean = card.direction === 'en-to-ko';
    els.modeBadge.textContent = isEnglishToKorean ? '영어 → 한국어' : '한국어 → 영어';
    els.questionGuide.textContent = isEnglishToKorean
        ? '영어 문장을 보고 한국어 뜻을 입력하세요.'
        : '한국어 뜻을 보고 영어 문장을 입력하세요.';
    els.questionText.textContent = getQuestionText(card);
    els.answerInput.value = '';
    els.answerInput.placeholder = isEnglishToKorean
        ? '한국어 뜻을 입력하세요'
        : '영어 문장을 입력하세요';
    els.answerInput.disabled = false;
    els.checkBtn.disabled = false;
    els.showAnswerBtn.disabled = false;
    els.skipBtn.disabled = false;
    els.nextBtn.disabled = true;
    els.nextBtn.textContent = state.currentIndex === state.deck.length - 1 ? '결과 보기' : '다음 문제';
    els.answerInput.focus();
}

async function startQuiz(overrideDeck = null) {
    const items = overrideDeck ? [...overrideDeck] : await getLatestItems();
    const deck = overrideDeck
        ? (els.randomOrder.checked ? shuffle(overrideDeck) : [...overrideDeck])
        : buildDeck(items);

    if (!deck.length) {
        alert('퀴즈로 만들 문장을 먼저 입력해 주세요.');
        return;
    }

    state.deck = deck;
    state.currentIndex = 0;
    state.score = 0;
    state.results = [];
    state.answered = false;

    els.quizSection.classList.remove('hidden');
    els.resultSection.classList.add('hidden');
    renderQuestion();
    els.quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function completeCurrentQuestion(isCorrect, userAnswer, feedbackHtml, feedbackType) {
    if (state.answered) return;

    const card = getCurrentCard();
    const correctAnswer = getCorrectAnswer(card);

    state.answered = true;
    if (isCorrect) {
        state.score += 1;
    }

    state.results.push({
        ...card,
        questionText: getQuestionText(card),
        correctAnswer,
        userAnswer: cleanSpacing(userAnswer),
        isCorrect
    });

    setFeedback(feedbackType, feedbackHtml);
    renderAnswerReveal(card);
    updateQuizHeader();

    els.answerInput.disabled = true;
    els.checkBtn.disabled = true;
    els.showAnswerBtn.disabled = true;
    els.skipBtn.disabled = true;
    els.nextBtn.disabled = false;
    els.nextBtn.focus();
}

function checkAnswer() {
    if (state.answered) return;

    const card = getCurrentCard();
    const userAnswer = els.answerInput.value.trim();
    if (!userAnswer) {
        alert('정답을 입력해 주세요.');
        els.answerInput.focus();
        return;
    }

    const normalizedUser = normalizeText(userAnswer, card.direction);
    const acceptedAnswers = buildAcceptedAnswers(card);
    const normalizedAcceptedAnswers = acceptedAnswers.map((answer) => normalizeText(answer, card.direction));
    const isCorrect = normalizedAcceptedAnswers.includes(normalizedUser);

    const feedbackHtml = isCorrect
        ? '<strong>정답입니다!</strong> 잘 맞혔어요.'
        : `<strong>오답입니다.</strong> 입력한 답: <strong>${escapeHtml(userAnswer)}</strong>`;

    completeCurrentQuestion(
        isCorrect,
        userAnswer,
        feedbackHtml,
        isCorrect ? 'success' : 'error'
    );
}

function showAnswerAsWrong(message, type = 'warning') {
    if (state.answered) return;
    const userAnswer = els.answerInput.value.trim();
    completeCurrentQuestion(false, userAnswer, message, type);
}

function goNext() {
    if (!state.answered) {
        alert('먼저 정답 확인을 하거나 정답 보기를 눌러 주세요.');
        return;
    }

    if (state.currentIndex >= state.deck.length - 1) {
        finishQuiz();
        return;
    }

    state.currentIndex += 1;
    renderQuestion();
}

function finishQuiz() {
    els.resultSection.classList.remove('hidden');
    const total = state.deck.length;
    const correct = state.score;
    const wrong = total - correct;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;

    els.resultSummary.innerHTML = `
        <div class="stats">
            <div class="stat-card"><strong>${correct}</strong><span>정답 수</span></div>
            <div class="stat-card"><strong>${wrong}</strong><span>오답 수</span></div>
            <div class="stat-card"><strong>${accuracy}%</strong><span>정답률</span></div>
        </div>
    `;

    const wrongItems = state.results.filter((item) => !item.isCorrect);
    els.retryWrongBtn.disabled = wrongItems.length === 0;
    renderReviewList();
    els.resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderReviewList() {
    if (!state.results.length) {
        els.reviewList.innerHTML = '';
        return;
    }

    els.reviewList.innerHTML = state.results.map((result, index) => {
        const statusClass = result.isCorrect ? 'correct' : 'wrong';
        const statusText = result.isCorrect ? '정답' : '오답';
        const directionText = result.direction === 'en-to-ko' ? '영어 → 한국어' : '한국어 → 영어';

        return `
            <article class="review-card ${statusClass}">
                <div class="review-head">
                    <strong>${index + 1}. ${escapeHtml(directionText)}</strong>
                    <span class="status-pill ${statusClass}">${statusText}</span>
                </div>
                <div class="line"><span class="label">문제</span>${escapeHtml(result.questionText)}</div>
                <div class="line"><span class="label">내 답</span>${result.userAnswer ? escapeHtml(result.userAnswer) : '<em>입력 없음</em>'}</div>
                <div class="line"><span class="label">정답</span>${escapeHtml(result.correctAnswer)}</div>
            </article>
        `;
    }).join('');
}

function retryWrongAnswers() {
    const wrongDeck = state.results
        .filter((result) => !result.isCorrect)
        .map((result) => ({
            id: result.id,
            english: result.english,
            korean: result.korean,
            direction: result.direction
        }));

    if (!wrongDeck.length) {
        alert('오답이 없어서 다시 풀 문제가 없습니다.');
        return;
    }

    startQuiz(wrongDeck);
}

function bindEvents() {
    els.sourceInput.addEventListener('input', () => {
        saveInputData();
        debouncedRefreshPreview();
    });

    els.loadSampleBtn.addEventListener('click', () => {
        els.sourceInput.value = window.__APP__?.sampleData || '';
        saveInputData();
        refreshPreview(els.sourceInput.value).catch(() => {});
    });

    els.clearInputBtn.addEventListener('click', () => {
        els.sourceInput.value = '';
        saveInputData();
        refreshPreview('').catch(() => {});
        els.sourceInput.focus();
    });

    els.saveInputBtn.addEventListener('click', () => {
        saveInputData();
        saveSettings();
        alert('현재 입력과 설정을 브라우저에 저장했습니다.');
    });

    document.querySelectorAll('input[name="mode"], #randomOrder, #ignoreSpaces, #ignoreCase, input[name="studyMode"], #studyRandomOrder').forEach((element) => {
        element.addEventListener('change', saveSettings);
    });

    els.startBtn.addEventListener('click', () => startQuiz().catch(() => {
        alert('입력 미리보기를 확인하지 못했습니다. 서버를 다시 확인해 주세요.');
    }));
    els.startStudyBtn.addEventListener('click', () => startStudy().catch(() => {
        alert('입력 미리보기를 확인하지 못했습니다. 서버를 다시 확인해 주세요.');
    }));
    els.shuffleStudyBtn.addEventListener('click', () => shuffleStudyCards().catch(() => {
        alert('카드를 섞지 못했습니다. 서버 상태를 확인해 주세요.');
    }));
    els.studyCard.addEventListener('click', flipStudyCard);
    els.flipCardBtn.addEventListener('click', flipStudyCard);
    els.studyPrevBtn.addEventListener('click', goStudyPrev);
    els.studyNextBtn.addEventListener('click', goStudyNext);
    els.studyRestartBtn.addEventListener('click', restartStudy);
    els.checkBtn.addEventListener('click', checkAnswer);
    els.showAnswerBtn.addEventListener('click', () => {
        showAnswerAsWrong('<strong>정답을 확인했습니다.</strong> 이 문제는 오답으로 기록됩니다.', 'warning');
    });
    els.skipBtn.addEventListener('click', () => {
        showAnswerAsWrong('<strong>건너뛰었습니다.</strong> 이 문제는 오답으로 기록됩니다.', 'warning');
    });
    els.nextBtn.addEventListener('click', goNext);
    els.restartBtn.addEventListener('click', () => startQuiz().catch(() => {
        alert('다시 시작하지 못했습니다. 서버 상태를 확인해 주세요.');
    }));
    els.retryWrongBtn.addEventListener('click', retryWrongAnswers);

    els.answerInput.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        if (state.answered) {
            goNext();
        } else {
            checkAnswer();
        }
    });

    document.addEventListener('keydown', (event) => {
        const active = document.activeElement;
        const tagName = active ? active.tagName : '';
        const isTyping = tagName === 'INPUT' || tagName === 'TEXTAREA';
        if (isTyping || els.studySection.classList.contains('hidden') || !state.study.deck.length) {
            return;
        }

        if (event.key === ' ' || event.key === 'Spacebar') {
            event.preventDefault();
            flipStudyCard();
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            goStudyNext();
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            goStudyPrev();
        }
    });
}

async function init() {
    loadSettings();
    loadInputData();
    bindEvents();
    await refreshPreview(els.sourceInput.value).catch(() => {});
}

init();
