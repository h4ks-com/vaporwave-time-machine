// 90s Vaporwave Time Service - Main JavaScript
(() => {
    // DOM Elements
    const timeEl = document.getElementById('time');
    const dateEl = document.getElementById('date');
    const tzSelect = document.getElementById('tzSelect');
    const customTz = document.getElementById('customTz');
    const applyTz = document.getElementById('applyTz');
    const syncBtn = document.getElementById('syncBtn');
    const toggle12 = document.getElementById('toggle12');
    const toggleSeconds = document.getElementById('toggleSeconds');
    const copyBtn = document.getElementById('copyBtn');
    const guestCountEl = document.getElementById('guestCount');

    // State
    let tz = 'local';
    let use12 = false;
    let showSeconds = true;
    let offsetMs = 0;
    let userLocation = null;
    let animationId = null;

    // Initialize
    async function init() {
        await Promise.all([
            syncServerTime(),
            updateGuestCounter()
        ]);
        startTimeDisplay();
        setupEventListeners();
        setupKeyboardShortcuts();
    }

    // Fetch server time and compute offset
    async function syncServerTime() {
        try {
            updateSyncButton('Syncing...', true);

            const resp = await fetch('/time', { cache: 'no-store' });
            if (!resp.ok) throw new Error('Server response not OK');

            const data = await resp.json();
            const serverMs = Number(data.server_unix_ms);
            const nowMs = Date.now();
            offsetMs = serverMs - nowMs;

            console.log('🕐 Time sync complete:', {
                offset: offsetMs + 'ms',
                serverISO: data.iso
            });

            updateSyncButton('Synced ✓', false);
            setTimeout(() => updateSyncButton('SYNC', false), 2000);

        } catch (error) {
            console.error('❌ Time sync failed:', error);
            updateSyncButton('Sync Failed', false);
            setTimeout(() => updateSyncButton('SYNC', false), 3000);
        }
    }

    // Update guest counter
    async function updateGuestCounter() {
        try {
            const resp = await fetch('/api/counter');
            const data = await resp.json();

            if (guestCountEl) {
                // Animate counter update
                const currentCount = parseInt(guestCountEl.textContent) || 0;
                const newCount = data.count;

                if (newCount > currentCount) {
                    animateCounter(currentCount, newCount);
                } else {
                    guestCountEl.textContent = newCount;
                }
            }

        } catch (error) {
            console.error('❌ Counter update failed:', error);
        }
    }

    // Animate counter
    function animateCounter(start, end) {
        const duration = 1000;
        const startTime = Date.now();

        function update() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const current = Math.floor(start + (end - start) * progress);
            guestCountEl.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        update();
    }

    // Format time using Intl API
    function formatTime(date, timezone) {
        const options = {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: use12,
            timeZone: timezone === 'local' ? undefined : timezone
        };

        try {
            const formatter = new Intl.DateTimeFormat('en-US', options);
            let timeStr = formatter.format(date);

            // Remove seconds if not shown
            if (!showSeconds) {
                timeStr = timeStr.replace(/:\d{2}(\s|$)/, '$1');
            }

            return timeStr;
        } catch (error) {
            console.error('❌ Time formatting error:', error);
            return date.toLocaleTimeString();
        }
    }

    // Format date
    function formatDate(date, timezone) {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: timezone === 'local' ? undefined : timezone
        };

        try {
            return new Intl.DateTimeFormat('en-US', options).format(date);
        } catch (error) {
            console.error('❌ Date formatting error:', error);
            return date.toLocaleDateString();
        }
    }

    // Main time display loop
    function updateTimeDisplay() {
        const now = new Date(Date.now() + offsetMs);

        try {
            const timeStr = formatTime(now, tz);
            const dateStr = formatDate(now, tz);

            timeEl.textContent = timeStr;
            dateEl.textContent = dateStr;

            // Add glitch effect occasionally
            if (Math.random() < 0.001) {
                addGlitchEffect();
            }

        } catch (error) {
            console.error('❌ Display update error:', error);
            timeEl.textContent = '--:--:--';
            dateEl.textContent = 'Display Error';
        }

        animationId = requestAnimationFrame(updateTimeDisplay);
    }

    // Start time display
    function startTimeDisplay() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        updateTimeDisplay();
    }

    // Add retro glitch effect
    function addGlitchEffect() {
        timeEl.style.textShadow = `
            2px 0 #ff00ff,
            -2px 0 #00ffff,
            0 0 20px #ff00ff,
            0 0 30px #00ffff
        `;

        setTimeout(() => {
            timeEl.style.textShadow = `
                0 0 10px var(--neon-green),
                0 0 20px var(--neon-green),
                0 0 30px var(--neon-green)
            `;
        }, 100);
    }

    // Update timezone display
    function updateTimezoneDisplay() {
        const displayName = tz === 'local' ? 'Local Time' : tz;
        console.log('🌐 Timezone changed to:', displayName);
    }

    // Update sync button state
    function updateSyncButton(text, disabled) {
        syncBtn.textContent = text;
        syncBtn.disabled = disabled;

        if (disabled) {
            syncBtn.classList.remove('pulse');
        } else {
            syncBtn.classList.add('pulse');
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        // Toggle 12/24 hour format
        toggle12.addEventListener('click', () => {
            use12 = !use12;
            toggle12.textContent = use12 ? '12H' : '24H';
            console.log('🕐 Time format:', use12 ? '12-hour' : '24-hour');
        });

        // Toggle seconds display
        toggleSeconds.addEventListener('click', () => {
            showSeconds = !showSeconds;
            toggleSeconds.textContent = showSeconds ? 'SECONDS' : 'NO SEC';
            console.log('🕐 Seconds display:', showSeconds ? 'on' : 'off');
        });

        // Apply timezone
        applyTz.addEventListener('click', () => {
            const custom = customTz.value.trim();
            const newTz = custom || tzSelect.value || 'local';

            try {
                // Test the timezone by creating a date
                if (newTz !== 'local') {
                    new Intl.DateTimeFormat('en-US', { timeZone: newTz });
                }

                tz = newTz;
                updateTimezoneDisplay();

                // Clear custom input if timezone was applied
                if (custom) {
                    customTz.value = '';
                }

                // Add visual feedback
                applyTz.textContent = 'Applied ✓';
                setTimeout(() => {
                    applyTz.textContent = 'APPLY ZONE';
                }, 2000);

            } catch (error) {
                console.error('❌ Invalid timezone:', newTz);
                alert('Invalid timezone! Please enter a valid IANA timezone name.');
            }
        });

        // Sync server time
        syncBtn.addEventListener('click', syncServerTime);

        // Copy time to clipboard
        copyBtn.addEventListener('click', async () => {
            try {
                const timeText = timeEl.textContent;
                const dateText = dateEl.textContent;
                const locationText = locationEl.textContent;
                const fullText = `${timeText}\n${dateText}\n${locationText}`;

                await navigator.clipboard.writeText(fullText);

                copyBtn.textContent = 'Copied ✓';
                setTimeout(() => {
                    copyBtn.textContent = 'COPY';
                }, 2000);

                console.log('📋 Time copied to clipboard');

            } catch (error) {
                console.error('❌ Copy failed:', error);

                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = timeEl.textContent;
                document.body.appendChild(textArea);
                textArea.select();

                try {
                    document.execCommand('copy');
                    copyBtn.textContent = 'Copied ✓';
                } catch (fallbackError) {
                    copyBtn.textContent = 'Copy Failed';
                }

                document.body.removeChild(textArea);

                setTimeout(() => {
                    copyBtn.textContent = 'COPY';
                }, 2000);
            }
        });

        // Auto-refresh guest counter every 30 seconds
        setInterval(updateGuestCounter, 30000);
    }

    // Setup keyboard shortcuts
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Prevent shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
                return;
            }

            switch (e.key.toLowerCase()) {
                case 's':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        syncBtn.click();
                    }
                    break;

                case 't':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        toggle12.click();
                    }
                    break;

                case 'c':
                    if (e.ctrlKey || e.metaKey) {
                        // Let default copy behavior work, but also trigger our copy
                        setTimeout(() => copyBtn.click(), 10);
                    }
                    break;

                case ' ':
                    e.preventDefault();
                    toggleSeconds.click();
                    break;

                case 'enter':
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        applyTz.click();
                    }
                    break;
            }
        });

        console.log('⌨️ Keyboard shortcuts enabled');
        console.log('  Ctrl+S: Sync time');
        console.log('  Ctrl+T: Toggle 12/24 hour');
        console.log('  Ctrl+C: Copy time');
        console.log('  Space: Toggle seconds');
        console.log('  Enter: Apply timezone');
    }

    // Add some retro console styling
    console.log('%c🌈 90s VAPORWAVE TIME SERVICE 🌈',
        'color: #ff00ff; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px #ff00ff;');
    console.log('%cWelcome to the digital chronosphere!',
        'color: #00ffff; font-size: 14px; text-shadow: 0 0 5px #00ffff;');

    // Initialize the application
    init().catch(error => {
        console.error('❌ Application initialization failed:', error);
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    });

})();
