const POMODORO_STATE_KEY = 'sidebar-pomodoro-state';

function loadState() {
    const defaultState = {
        timeLeft: 25 * 60,
        isWork: true,
        isRunning: false,
        lastUpdated: Date.now()
    };
    try {
        const saved = JSON.parse(localStorage.getItem(POMODORO_STATE_KEY));
        if (saved) {
            // Apply missed time
            if (saved.isRunning) {
                const now = Date.now();
                const elapsedSeconds = Math.floor((now - saved.lastUpdated) / 1000);
                saved.timeLeft = Math.max(0, saved.timeLeft - elapsedSeconds);
                saved.lastUpdated = now;
            }
            return saved;
        }
    } catch (e) { }
    return defaultState;
}

function saveState(state) {
    state.lastUpdated = Date.now();
    localStorage.setItem(POMODORO_STATE_KEY, JSON.stringify(state));
}

export function renderPomodoro() {
    const widgetWrapper = document.createElement('div');
    widgetWrapper.className = 'pomodoro-widget';

    const title = document.createElement('h3');
    title.textContent = 'Pomodoro';

    const timerDisplay = document.createElement('div');
    timerDisplay.className = 'pomodoro-timer';
    timerDisplay.style.fontSize = '2.5rem';
    timerDisplay.style.fontWeight = 'bold';
    timerDisplay.style.textAlign = 'center';
    timerDisplay.style.margin = '10px 0';
    timerDisplay.style.fontFamily = 'monospace';

    const statusDisplay = document.createElement('div');
    statusDisplay.className = 'pomodoro-status';
    statusDisplay.style.textAlign = 'center';
    statusDisplay.style.fontSize = '0.9rem';
    statusDisplay.style.opacity = '0.8';
    statusDisplay.style.marginBottom = '15px';

    const controls = document.createElement('div');
    controls.className = 'pomodoro-controls';
    controls.style.display = 'flex';
    controls.style.justifyContent = 'center';
    controls.style.gap = '10px';

    const playPauseBtn = document.createElement('button');
    playPauseBtn.className = 'ghost-button';
    playPauseBtn.style.padding = '5px 15px';

    const resetBtn = document.createElement('button');
    resetBtn.className = 'ghost-button';
    resetBtn.textContent = 'Reset';
    resetBtn.style.padding = '5px 15px';

    const modes = document.createElement('div');
    modes.className = 'pomodoro-modes';
    modes.style.display = 'flex';
    modes.style.justifyContent = 'center';
    modes.style.gap = '10px';
    modes.style.marginTop = '15px';

    const workModeBtn = document.createElement('button');
    workModeBtn.className = 'ghost-button active-mode';
    workModeBtn.textContent = 'Work';
    workModeBtn.style.fontSize = '0.8rem';
    workModeBtn.style.padding = '2px 8px';

    const breakModeBtn = document.createElement('button');
    breakModeBtn.className = 'ghost-button';
    breakModeBtn.textContent = 'Break';
    breakModeBtn.style.fontSize = '0.8rem';
    breakModeBtn.style.padding = '2px 8px';

    let state = loadState();
    let interval = null;

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function updateDocTitle() {
        if (state.isRunning) {
            document.title = `(${formatTime(state.timeLeft)}) New Tab`;
        } else {
            document.title = `New Tab`;
        }
    }

    function updateUI() {
        timerDisplay.textContent = formatTime(state.timeLeft);
        statusDisplay.textContent = state.isWork ? 'Focus Time' : 'Break Time';
        playPauseBtn.textContent = state.isRunning ? 'Pause' : 'Start';

        if (state.isWork) {
            workModeBtn.style.opacity = '1';
            workModeBtn.style.background = 'var(--text-color, rgba(128,128,128,0.2))';
            breakModeBtn.style.opacity = '0.5';
            breakModeBtn.style.background = 'transparent';
        } else {
            breakModeBtn.style.opacity = '1';
            breakModeBtn.style.background = 'var(--text-color, rgba(128,128,128,0.2))';
            workModeBtn.style.opacity = '0.5';
            workModeBtn.style.background = 'transparent';
        }
        updateDocTitle();
    }

    function tick() {
        if (state.timeLeft > 0) {
            state.timeLeft--;
            saveState(state);
            updateUI();
        } else {
            clearInterval(interval);
            state.isRunning = false;
            // Play sound? (can't easily bundle audio, maybe simple beeps)
            playEndSound();
            // Auto switch mode
            state.isWork = !state.isWork;
            state.timeLeft = state.isWork ? 25 * 60 : 5 * 60;
            saveState(state);
            updateUI();
        }
    }

    function playEndSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) { }
    }

    function toggleTimer() {
        state.isRunning = !state.isRunning;
        if (state.isRunning) {
            state.lastUpdated = Date.now();
            interval = setInterval(tick, 1000);
        } else {
            clearInterval(interval);
        }
        saveState(state);
        updateUI();
    }

    function resetTimer() {
        clearInterval(interval);
        state.isRunning = false;
        state.timeLeft = state.isWork ? 25 * 60 : 5 * 60;
        saveState(state);
        updateUI();
    }

    function setMode(isWork) {
        state.isWork = isWork;
        resetTimer();
    }

    playPauseBtn.addEventListener('click', toggleTimer);
    resetBtn.addEventListener('click', resetTimer);
    workModeBtn.addEventListener('click', () => setMode(true));
    breakModeBtn.addEventListener('click', () => setMode(false));

    controls.appendChild(playPauseBtn);
    controls.appendChild(resetBtn);

    modes.appendChild(workModeBtn);
    modes.appendChild(breakModeBtn);

    widgetWrapper.appendChild(title);
    widgetWrapper.appendChild(modes);
    widgetWrapper.appendChild(timerDisplay);
    widgetWrapper.appendChild(statusDisplay);
    widgetWrapper.appendChild(controls);

    if (state.isRunning) {
        interval = setInterval(tick, 1000);
    }

    // Ensure document title resets if unmounted or tab visibility changes
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            // Keep timer running but we can't easily sync multiple tabs perfectly without service worker
            // We just let the active tab handle UI updates and logic upon refocus
        } else {
            state = loadState();
            updateUI();
        }
    });

    updateUI();

    return widgetWrapper;
}
