// 90s Vaporwave Time Service - Stopwatch & Timer JavaScript
(() => {
    // DOM Elements
    const stopwatchTimeEl = document.getElementById('stopwatchTime');
    const startStopBtn = document.getElementById('startStopBtn');
    const resetBtn = document.getElementById('resetBtn');
    const lapBtn = document.getElementById('lapBtn');
    const lapListEl = document.getElementById('lapList');

    const timerTimeEl = document.getElementById('timerTime');
    const hoursInput = document.getElementById('hours');
    const minutesInput = document.getElementById('minutes');
    const secondsInput = document.getElementById('seconds');
    const startTimerBtn = document.getElementById('startTimerBtn');
    const resetTimerBtn = document.getElementById('resetTimerBtn');
    const presetBtns = document.querySelectorAll('.preset-btn');

    // Stopwatch State
    let stopwatchRunning = false;
    let stopwatchStartTime = 0;
    let stopwatchElapsed = 0;
    let stopwatchAnimationId = null;
    let lapTimes = [];

    // Timer State
    let timerRunning = false;
    let timerStartTime = 0;
    let timerDuration = 0;
    let timerAnimationId = null;

    // Audio Context for retro beeps
    let audioContext = null;

    // Initialize
    function init() {
        setupStopwatchEvents();
        setupTimerEvents();
        setupKeyboardShortcuts();
        setupAudioContext();
        updateStopwatchDisplay();
        updateTimerDisplay();
        console.log('⏱️ Stopwatch & Timer initialized');
    }

    // Setup audio context for retro sound effects
    function setupAudioContext() {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('⚠️ Audio context not available:', error);
        }
    }

    // Play retro beep sound
    function playBeep(frequency = 440, duration = 200, type = 'square') {
        if (!audioContext) return;

        try {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = type;

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration / 1000);
        } catch (error) {
            console.warn('⚠️ Beep sound failed:', error);
        }
    }

    // Format time as HH:MM:SS.mmm
    function formatStopwatchTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const ms = Math.floor((milliseconds % 1000) / 10);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}0`;
    }

    // Format time as HH:MM:SS
    function formatTimerTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Stopwatch Functions
    function startStopwatch() {
        if (!stopwatchRunning) {
            stopwatchStartTime = performance.now() - stopwatchElapsed;
            stopwatchRunning = true;
            startStopBtn.textContent = 'STOP';
            startStopBtn.classList.remove('start-btn');
            lapBtn.disabled = false;
            resetBtn.disabled = true;
            playBeep(880, 100, 'sine');
            updateStopwatchLoop();
        } else {
            stopStopwatch();
        }
    }

    function stopStopwatch() {
        stopwatchRunning = false;
        startStopBtn.textContent = 'START';
        startStopBtn.classList.add('start-btn');
        lapBtn.disabled = true;
        resetBtn.disabled = false;
        playBeep(440, 200, 'square');

        if (stopwatchAnimationId) {
            cancelAnimationFrame(stopwatchAnimationId);
            stopwatchAnimationId = null;
        }
    }

    function resetStopwatch() {
        stopStopwatch();
        stopwatchElapsed = 0;
        lapTimes = [];
        startStopBtn.textContent = 'START';
        resetBtn.disabled = true;
        updateStopwatchDisplay();
        updateLapDisplay();
        playBeep(220, 300, 'sawtooth');
    }

    function recordLap() {
        if (!stopwatchRunning) return;

        const lapTime = stopwatchElapsed;
        const lapNumber = lapTimes.length + 1;
        const previousLap = lapTimes.length > 0 ? lapTimes[lapTimes.length - 1].time : 0;
        const splitTime = lapTime - previousLap;

        lapTimes.push({
            number: lapNumber,
            time: lapTime,
            split: splitTime
        });

        updateLapDisplay();
        playBeep(660, 150, 'triangle');
    }

    function updateStopwatchLoop() {
        if (!stopwatchRunning) return;

        stopwatchElapsed = performance.now() - stopwatchStartTime;
        updateStopwatchDisplay();
        stopwatchAnimationId = requestAnimationFrame(updateStopwatchLoop);
    }

    function updateStopwatchDisplay() {
        stopwatchTimeEl.textContent = formatStopwatchTime(stopwatchElapsed);

        // Add visual effects at certain intervals
        if (stopwatchRunning && stopwatchElapsed > 0) {
            const seconds = Math.floor(stopwatchElapsed / 1000);
            if (seconds > 0 && seconds % 10 === 0 && stopwatchElapsed % 1000 < 50) {
                addPulseEffect(stopwatchTimeEl);
            }
        }
    }

    function updateLapDisplay() {
        if (lapTimes.length === 0) {
            lapListEl.innerHTML = '<div class="no-laps">No lap times recorded</div>';
            return;
        }

        const lapItems = lapTimes
            .slice()
            .reverse()
            .map(lap => `
                <div class="lap-item">
                    <span>Lap ${lap.number}</span>
                    <span>${formatStopwatchTime(lap.time)}</span>
                    <span class="lap-split">+${formatStopwatchTime(lap.split)}</span>
                </div>
            `)
            .join('');

        lapListEl.innerHTML = lapItems;
    }

    // Timer Functions
    function startTimer() {
        if (!timerRunning) {
            const hours = parseInt(hoursInput.value) || 0;
            const minutes = parseInt(minutesInput.value) || 0;
            const seconds = parseInt(secondsInput.value) || 0;

            timerDuration = hours * 3600 + minutes * 60 + seconds;

            if (timerDuration <= 0) {
                alert('Please set a timer duration!');
                return;
            }

            timerStartTime = performance.now();
            timerRunning = true;
            startTimerBtn.textContent = 'STOP TIMER';
            startTimerBtn.classList.remove('start-btn');
            resetTimerBtn.disabled = true;
            disableTimerInputs(true);
            playBeep(880, 100, 'sine');
            updateTimerLoop();
        } else {
            stopTimer();
        }
    }

    function stopTimer() {
        timerRunning = false;
        startTimerBtn.textContent = 'START TIMER';
        startTimerBtn.classList.add('start-btn');
        resetTimerBtn.disabled = false;
        disableTimerInputs(false);
        playBeep(440, 200, 'square');

        if (timerAnimationId) {
            cancelAnimationFrame(timerAnimationId);
            timerAnimationId = null;
        }
    }

    function resetTimer() {
        stopTimer();
        hoursInput.value = 0;
        minutesInput.value = 5;
        secondsInput.value = 0;
        timerDuration = 0;
        updateTimerDisplay();
        playBeep(220, 300, 'sawtooth');
    }

    function updateTimerLoop() {
        if (!timerRunning) return;

        const elapsed = (performance.now() - timerStartTime) / 1000;
        const remaining = Math.max(0, timerDuration - elapsed);

        if (remaining <= 0) {
            timerComplete();
            return;
        }

        updateTimerDisplay(Math.ceil(remaining));

        // Visual effects for last 10 seconds
        if (remaining <= 10 && remaining > 0) {
            addPulseEffect(timerTimeEl);
            if (Math.ceil(remaining) !== Math.ceil(remaining - 0.1)) {
                playBeep(800, 100, 'sine');
            }
        }

        timerAnimationId = requestAnimationFrame(updateTimerLoop);
    }

    function updateTimerDisplay(remainingSeconds = null) {
        if (remainingSeconds === null) {
            const hours = parseInt(hoursInput.value) || 0;
            const minutes = parseInt(minutesInput.value) || 0;
            const seconds = parseInt(secondsInput.value) || 0;
            remainingSeconds = hours * 3600 + minutes * 60 + seconds;
        }

        timerTimeEl.textContent = formatTimerTime(remainingSeconds);

        // Color coding
        if (remainingSeconds <= 10) {
            timerTimeEl.style.color = 'var(--neon-pink)';
        } else if (remainingSeconds <= 60) {
            timerTimeEl.style.color = 'var(--neon-cyan)';
        } else {
            timerTimeEl.style.color = 'var(--neon-purple)';
        }
    }

    function timerComplete() {
        stopTimer();
        timerTimeEl.textContent = '00:00:00';
        timerTimeEl.style.color = 'var(--neon-pink)';

        // Celebration effect
        addCelebrationEffect();
        playTimerCompleteSound();

        // Show notification
        if (Notification.permission === 'granted') {
            new Notification('⏰ Timer Complete!', {
                body: 'Your countdown timer has finished.',
                icon: '/static/favicon.ico'
            });
        }

        alert('⏰ Timer Complete! Time\'s up!');
    }

    function disableTimerInputs(disabled) {
        hoursInput.disabled = disabled;
        minutesInput.disabled = disabled;
        secondsInput.disabled = disabled;
        presetBtns.forEach(btn => btn.disabled = disabled);
    }

    function setTimerPreset(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        hoursInput.value = hours;
        minutesInput.value = minutes;
        secondsInput.value = seconds;

        updateTimerDisplay();
        playBeep(550, 100, 'triangle');
    }

    // Visual Effects
    function addPulseEffect(element) {
        element.style.transform = 'scale(1.05)';
        element.style.transition = 'transform 0.1s ease';

        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 100);
    }

    function addCelebrationEffect() {
        // Rainbow text effect
        let colorIndex = 0;
        const colors = ['var(--neon-pink)', 'var(--neon-cyan)', 'var(--neon-green)', 'var(--neon-purple)'];

        const celebrationInterval = setInterval(() => {
            timerTimeEl.style.color = colors[colorIndex % colors.length];
            colorIndex++;
        }, 200);

        setTimeout(() => {
            clearInterval(celebrationInterval);
            timerTimeEl.style.color = 'var(--neon-purple)';
        }, 2000);
    }

    function playTimerCompleteSound() {
        // Play a sequence of beeps
        const notes = [440, 554, 659, 880];
        notes.forEach((freq, index) => {
            setTimeout(() => {
                playBeep(freq, 300, 'sine');
            }, index * 200);
        });
    }

    // Event Listeners
    function setupStopwatchEvents() {
        startStopBtn.addEventListener('click', startStopwatch);
        resetBtn.addEventListener('click', resetStopwatch);
        lapBtn.addEventListener('click', recordLap);
    }

    function setupTimerEvents() {
        startTimerBtn.addEventListener('click', startTimer);
        resetTimerBtn.addEventListener('click', resetTimer);

        // Input validation
        [hoursInput, minutesInput, secondsInput].forEach(input => {
            input.addEventListener('input', () => {
                let value = parseInt(input.value);
                if (isNaN(value) || value < 0) {
                    input.value = 0;
                } else if (input === hoursInput && value > 23) {
                    input.value = 23;
                } else if ((input === minutesInput || input === secondsInput) && value > 59) {
                    input.value = 59;
                }
                updateTimerDisplay();
            });

            input.addEventListener('change', updateTimerDisplay);
        });

        // Preset buttons
        presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const time = parseInt(btn.dataset.time);
                setTimerPreset(time);
            });
        });
    }

    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
                return;
            }

            switch (e.key.toLowerCase()) {
                case ' ':
                    e.preventDefault();
                    startStopBtn.click();
                    break;

                case 'r':
                    e.preventDefault();
                    resetBtn.click();
                    break;

                case 'l':
                    e.preventDefault();
                    if (!lapBtn.disabled) {
                        lapBtn.click();
                    }
                    break;

                case 'enter':
                    e.preventDefault();
                    startTimerBtn.click();
                    break;

                case 'escape':
                    e.preventDefault();
                    resetTimerBtn.click();
                    break;

                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                    e.preventDefault();
                    const presetIndex = parseInt(e.key) - 1;
                    if (presetBtns[presetIndex]) {
                        presetBtns[presetIndex].click();
                    }
                    break;
            }
        });

        console.log('⌨️ Stopwatch keyboard shortcuts enabled');
        console.log('  Space: Start/Stop Stopwatch');
        console.log('  R: Reset Stopwatch');
        console.log('  L: Record Lap');
        console.log('  Enter: Start/Stop Timer');
        console.log('  Esc: Reset Timer');
        console.log('  1-5: Timer Presets');
    }

    // Request notification permission
    function requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log('🔔 Notification permission:', permission);
            });
        }
    }

    // Add some retro console styling
    console.log('%c⏱️ CYBER STOPWATCH & TIMER ⏱️',
        'color: #8a2be2; font-size: 18px; font-weight: bold; text-shadow: 0 0 10px #8a2be2;');
    console.log('%cPrecision timing for the digital age!',
        'color: #00ffff; font-size: 12px; text-shadow: 0 0 5px #00ffff;');

    // Initialize the application
    init();
    requestNotificationPermission();

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (stopwatchAnimationId) {
            cancelAnimationFrame(stopwatchAnimationId);
        }
        if (timerAnimationId) {
            cancelAnimationFrame(timerAnimationId);
        }
        if (audioContext) {
            audioContext.close();
        }
    });

})();