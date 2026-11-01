/**
 * app.js
 * הלוגיקה המרכזית של אפליקציית "אוֹתִיּוֹת וְקַסְמִים"
 * מנהל את כל מצבי המשחק, צבירת כוכבים, אנימציות, הקראה ומדבקות.
 */

class ReadingApp {
    constructor() {
        // טעינת נתונים שמורים
        this.stars = parseInt(localStorage.getItem('hebrew_reading_stars') || '0', 10);
        this.avatar = localStorage.getItem('hebrew_reading_avatar') || '👦';
        this.childName = localStorage.getItem('hebrew_reading_child_name') || 'הַקּוֹרֵא הָאַלּוּף';
        this.selectedAvatar = this.avatar;
        this.unlockedStickers = JSON.parse(localStorage.getItem('hebrew_reading_stickers') || '[]');
        this.completedLetters = JSON.parse(localStorage.getItem('hebrew_reading_letters_done') || '[]');
        
        // הגדרות תצוגה
        this.fontScales = [1, 1.15, 1.3];
        this.currentScaleIdx = 0;
        this.highlightNiqqud = localStorage.getItem('hebrew_reading_highlight_niqqud') === 'true';

        // מצב פעיל
        this.currentZone = 'letters';
        this.currentLetterFilter = 'all';
        this.currentStoryFilter = 'all';
        
        // נתוני משחקים
        this.syllableIndex = 0;
        this.currentWordSlots = [];
        this.bubbleGameActive = false;
        this.bubbleTarget = null;
        this.bubbleScore = 0;
        this.bubbleInterval = null;
        
        // נתוני סיפור
        this.activeStory = null;
        this.isReadingStory = false;
        this.readingTimeouts = [];

        // קנבס קונפטי
        this.confettiCanvas = document.getElementById('confetti-canvas');
        this.confettiCtx = this.confettiCanvas ? this.confettiCanvas.getContext('2d') : null;
        this.particles = [];

        this.init();
    }

    init() {
        this.updateHeaderStats();
        this.setupEventListeners();
        this.initConfetti();
        
        // טעינת אזורים
        this.renderLetters();
        this.renderVowels();
        this.initSyllableLab();
        this.renderStories();
        this.renderStickers();

        if (this.highlightNiqqud) {
            document.body.classList.add('highlight-niqqud');
        }

        // בדיקה האם כבר הוזן שם בעבר
        const hasSavedName = localStorage.getItem('hebrew_reading_child_name');
        if (!hasSavedName) {
            // כניסה ראשונה: נפתח בעדינות את מודאל הזנת השם
            setTimeout(() => {
                this.openProfileModal();
            }, 700);
        } else {
            // ברכת שלום אישית מהינשוף
            setTimeout(() => {
                this.setMascotMessage(`שָׁלוֹם ${this.childName}! אֵיזֶה כֵּיף שֶׁבָּאתָ לִקְרוֹא אִתִּי! בַּחֲרוּ פְּעִילוּת וְנַתְחִיל! 🦉✨`);
            }, 600);
        }
    }

    // =========================================================================
    // ניהול ניקוד, כוכבים ומדבקות
    // =========================================================================
    addStars(amount) {
        this.stars += amount;
        localStorage.setItem('hebrew_reading_stars', this.stars);
        this.updateHeaderStats();
        window.soundEngine.playStar();
        
        // אנימציית קפיצה למספר הכוכבים
        const counterEl = document.getElementById('stars-count');
        if (counterEl) {
            counterEl.style.transform = 'scale(1.4)';
            setTimeout(() => counterEl.style.transform = 'scale(1)', 300);
        }

        this.checkStickerUnlocks();
    }

    updateHeaderStats() {
        const starsEl = document.getElementById('stars-count');
        const avatarEl = document.getElementById('current-avatar-btn');
        const nameEl = document.getElementById('player-name-display');
        const certNameEl = document.getElementById('cert-child-name');

        if (starsEl) starsEl.textContent = this.stars;
        if (avatarEl) avatarEl.textContent = this.avatar;
        if (nameEl) nameEl.textContent = this.childName;
        if (certNameEl) certNameEl.textContent = this.childName;
    }

    checkStickerUnlocks() {
        READING_DATA.stickers.forEach(sticker => {
            if (!this.unlockedStickers.includes(sticker.id) && this.stars >= sticker.starsNeeded) {
                this.unlockedStickers.push(sticker.id);
                localStorage.setItem('hebrew_reading_stickers', JSON.stringify(this.unlockedStickers));
                this.showRewardModal(sticker);
            }
        });
        this.renderStickers();
    }

    showRewardModal(sticker) {
        window.soundEngine.playFanfare();
        this.triggerConfetti();

        const iconEl = document.getElementById('reward-modal-icon');
        const titleEl = document.getElementById('reward-modal-title');
        const descEl = document.getElementById('reward-modal-desc');

        if (iconEl) iconEl.textContent = sticker.icon;
        if (titleEl) titleEl.textContent = sticker.title;
        if (descEl) descEl.textContent = `תְּעוּדַת אַלּוּף הַקְּרִיאָה מוענקת לְ-${this.childName}! ${sticker.desc}`;

        this.openModal('reward-modal');
    }

    setMascotMessage(text, speak = false) {
        const textEl = document.getElementById('mascot-text-display');
        if (textEl) {
            textEl.textContent = text;
            textEl.parentElement.style.animation = 'none';
            void textEl.offsetWidth; // trigger reflow
            textEl.parentElement.style.animation = 'popIn 0.3s ease';
        }
        if (speak) {
            window.soundEngine.speakText(text);
        }
    }

    // =========================================================================
    // ניווט בין אזורי משחק (Zones)
    // =========================================================================
    showZone(zoneName) {
        window.soundEngine.playClick();
        this.currentZone = zoneName;

        // עדכון לשוניות
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.zone === zoneName);
        });

        // החלפת אזורים
        document.querySelectorAll('.game-zone').forEach(zone => {
            zone.classList.remove('active');
        });
        const targetZone = document.getElementById(`zone-${zoneName}`);
        if (targetZone) targetZone.classList.add('active');

        // עצירת משחק בועות או הקראה פעילה אם יצאנו מהאזור
        if (zoneName !== 'bubbles') this.stopBubbleGame();
        if (zoneName !== 'stories') this.stopStoryReading();

        // הודעת ינשוף תואמת לאזור
        const messages = {
            letters: 'הִנֵּה כָּל אוֹתִיּוֹת הָאָלֶף-בֵּית! לַחֲצוּ עַל אוֹת וּנְגַלֶּה מָה הַצְּלִיל שֶׁלָּהּ! 🏰',
            vowels: 'מַמְלֶכֶת הַנִּיקּוּד! כָּאן נִלְמַד אֵיךְ שָׁרִים קָמָץ, פַּתָּח, חִירִיק וְחוֹלָם! 👑',
            syllables: 'מַעְבֶּדֶת הַהֲבָרוֹת! חַבְּרוּ אֶת הַחֲלָקִים כְּדֵי לִבְנוֹת מִילָה שְׁלֵמָה! 🧩',
            bubbles: 'אֲתַגַּר פִּצּוּץ הַבּוּעוֹת! הַקְשִׁיבוּ הֵיטֵב לַצְּלִיל וּפוֹצְצוּ מַהֵר! 🫧',
            stories: 'סִפְרִיַּת הַקְּרִיאָה הַמְּדֹרֶגֶת! מַתְחִילִים בְּשָׁלָב 1 עִם קָמָץ-פַּתָּח וּמִתְקַדְּמִים צַעַד אַחַר צַעַד! 📚✨',
            stickers: 'אַלְבּוֹם הַפְּרָסִים וְהַמַּדְבְּקוֹת! כָּל כּוֹכָב מְקָרֵב אוֹתָנוּ לִפְרָס חָדָשׁ! 🏆'
        };
        this.setMascotMessage(messages[zoneName] || 'בּוֹאוּ נִלְמַד קְרִיאָה בְּכֵיף!');
    }

    // =========================================================================
    // 1. אזור האותיות והצלילים (Letters Zone)
    // =========================================================================
    renderLetters() {
        const container = document.getElementById('letters-grid-container');
        if (!container) return;
        container.innerHTML = '';

        const isSofit = (char) => ['ך', 'ם', 'ן', 'ף', 'ץ'].includes(char);

        const filtered = READING_DATA.letters.filter(item => {
            if (this.currentLetterFilter === 'regular') return !isSofit(item.char);
            if (this.currentLetterFilter === 'sofit') return isSofit(item.char);
            return true;
        });

        filtered.forEach(letter => {
            const card = document.createElement('div');
            card.className = 'letter-card';
            card.innerHTML = `
                <div class="letter-char">${letter.char}</div>
                <div class="letter-name">${letter.name}</div>
                <div class="letter-sample-word">
                    <span>${letter.emoji}</span>
                    <span>${letter.word}</span>
                </div>
            `;

            card.addEventListener('click', () => {
                this.openLetterDetail(letter);
            });

            container.appendChild(card);
        });
    }

    openLetterDetail(letter) {
        window.soundEngine.playPop();

        const charEl = document.getElementById('letter-modal-char');
        const nameEl = document.getElementById('letter-modal-name');
        const emojiEl = document.getElementById('letter-modal-emoji');
        const wordEl = document.getElementById('letter-modal-word');
        const hintEl = document.getElementById('letter-modal-hint');
        const speakBtn = document.getElementById('letter-modal-speak-btn');

        if (charEl) charEl.textContent = letter.char;
        if (nameEl) nameEl.textContent = `אוֹת ${letter.name}`;
        if (emojiEl) emojiEl.textContent = letter.emoji;
        if (wordEl) wordEl.textContent = letter.word;
        if (hintEl) hintEl.textContent = letter.hint;

        const pronounce = () => {
            window.soundEngine.speakText(`${letter.name}. ${letter.word}`);
        };

        if (speakBtn) {
            speakBtn.onclick = pronounce;
        }

        this.openModal('letter-modal');
        pronounce();

        // תגמול כוכב בפעם הראשונה שחוקרים אות
        if (!this.completedLetters.includes(letter.char)) {
            this.completedLetters.push(letter.char);
            localStorage.setItem('hebrew_reading_letters_done', JSON.stringify(this.completedLetters));
            this.addStars(1);
        }
    }

    // =========================================================================
    // 2. אזור ממלכת הניקוד (Vowels Kingdom)
    // =========================================================================
    renderVowels() {
        const container = document.getElementById('vowels-cards-container');
        if (!container) return;
        container.innerHTML = '';

        READING_DATA.vowels.forEach(vowel => {
            const card = document.createElement('div');
            card.className = 'vowel-card';
            card.style.borderTopColor = vowel.color;

            let samplesHtml = '';
            vowel.samples.forEach(sample => {
                samplesHtml += `
                    <button class="vowel-sample-chip" data-read="${sample.read}">
                        <span>${sample.letter}</span>
                        <span style="font-size: 0.9rem; color: #94A3B8;">🔊</span>
                    </button>
                `;
            });

            card.innerHTML = `
                <div class="vowel-header">
                    <div class="vowel-info">
                        <h3>${vowel.name}</h3>
                        <span class="vowel-sound-tag">${vowel.soundName}</span>
                    </div>
                    <div class="vowel-badge" style="background-color: ${vowel.color};">
                        ${vowel.symbol}
                    </div>
                </div>
                <div class="vowel-desc">
                    💡 ${vowel.description}
                </div>
                <div>
                    <div class="vowel-samples-title">דֻּגְמָאוֹת לִקְרִיאָה בְּקוֹל:</div>
                    <div class="vowel-samples-row">
                        ${samplesHtml}
                    </div>
                </div>
            `;

            // הוספת האזנה לשבבי הצליל
            card.querySelectorAll('.vowel-sample-chip').forEach(chip => {
                chip.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.soundEngine.playSuccess();
                    const textToRead = chip.getAttribute('data-read');
                    window.soundEngine.speakText(textToRead);
                    chip.style.transform = 'scale(1.2)';
                    setTimeout(() => chip.style.transform = 'scale(1)', 200);
                });
            });

            container.appendChild(card);
        });
    }

    // =========================================================================
    // 3. מעבדת ההברות והרכבת המילים (Syllable Lab)
    // =========================================================================
    initSyllableLab() {
        this.syllableIndex = 0;
        this.loadSyllableWord();

        const resetBtn = document.getElementById('builder-reset-btn');
        const nextBtn = document.getElementById('builder-next-btn');
        const listenBtn = document.getElementById('builder-listen-word-btn');

        if (resetBtn) resetBtn.onclick = () => this.resetSyllableWord();
        if (nextBtn) nextBtn.onclick = () => this.nextSyllableWord();
        if (listenBtn) listenBtn.onclick = () => {
            const current = READING_DATA.syllableWords[this.syllableIndex];
            if (current) window.soundEngine.speakText(current.fullWord);
        };
    }

    loadSyllableWord() {
        const item = READING_DATA.syllableWords[this.syllableIndex];
        if (!item) return;

        this.currentWordSlots = [];

        // עדכון כותרת ורמז
        const levelIndicator = document.getElementById('builder-level-indicator');
        const emojiEl = document.getElementById('builder-target-emoji');
        const hintEl = document.getElementById('builder-target-hint');
        const nextBtn = document.getElementById('builder-next-btn');

        if (levelIndicator) levelIndicator.textContent = `שָׁלָב ${this.syllableIndex + 1} מִתּוֹךְ ${READING_DATA.syllableWords.length}`;
        if (emojiEl) emojiEl.textContent = item.emoji;
        if (hintEl) hintEl.textContent = `רֶמֶז: ${item.hint}`;
        if (nextBtn) nextBtn.style.display = 'none';

        // בניית משבצות ריקות
        const slotsContainer = document.getElementById('builder-slots-container');
        if (slotsContainer) {
            slotsContainer.innerHTML = '';
            item.syllables.forEach((_, idx) => {
                const slot = document.createElement('div');
                slot.className = 'syllable-slot';
                slot.id = `slot-${idx}`;
                slot.textContent = '؟';
                slotsContainer.appendChild(slot);
            });
        }

        // ערבוב ההברות הנכונות עם מסיחים
        const bankContainer = document.getElementById('builder-bank-container');
        if (bankContainer) {
            bankContainer.innerHTML = '';
            const allChoices = [...item.syllables, ...item.distractors];
            this.shuffleArray(allChoices);

            allChoices.forEach((syllable, idx) => {
                const btn = document.createElement('button');
                btn.className = 'syllable-choice-btn';
                btn.textContent = syllable;
                btn.id = `bank-btn-${idx}`;
                btn.addEventListener('click', () => this.chooseSyllable(syllable, btn));
                bankContainer.appendChild(btn);
            });
        }
    }

    chooseSyllable(syllable, btnEl) {
        const item = READING_DATA.syllableWords[this.syllableIndex];
        if (this.currentWordSlots.length >= item.syllables.length) return;

        window.soundEngine.playPop();
        window.soundEngine.speakText(syllable);

        btnEl.classList.add('used');

        const nextSlotIndex = this.currentWordSlots.length;
        this.currentWordSlots.push({ syllable, btnEl });

        const slot = document.getElementById(`slot-${nextSlotIndex}`);
        if (slot) {
            slot.textContent = syllable;
            slot.classList.add('filled');
        }

        // בדיקה אם המילה הושלמה
        if (this.currentWordSlots.length === item.syllables.length) {
            this.checkSyllableWord();
        }
    }

    checkSyllableWord() {
        const item = READING_DATA.syllableWords[this.syllableIndex];
        const constructed = this.currentWordSlots.map(s => s.syllable).join('');
        const expected = item.syllables.join('');

        if (constructed === expected) {
            // הצלחה!
            window.soundEngine.playSuccess();
            this.triggerConfetti();
            this.addStars(3);

            // הדגשת משבצות בצבע ירוק
            item.syllables.forEach((_, idx) => {
                const slot = document.getElementById(`slot-${idx}`);
                if (slot) slot.classList.add('correct');
            });

            this.setMascotMessage(`נִפְלָא מְאוֹד, ${this.childName}! בָּנִיתָ אֶת הַמִּילָה: ${item.fullWord}! 🌟`, true);

            const nextBtn = document.getElementById('builder-next-btn');
            if (nextBtn) nextBtn.style.display = 'inline-flex';
        } else {
            // שגיאה עדינה
            window.soundEngine.playTryAgain();
            this.setMascotMessage('כִּמְעַט! נַסּוּ שׁוּב, תַּחְשְׁבוּ אֵיזֶה צְלִיל בָּא קֹדֶם! 😊');

            setTimeout(() => {
                this.resetSyllableWord();
            }, 1200);
        }
    }

    resetSyllableWord() {
        const item = READING_DATA.syllableWords[this.syllableIndex];
        this.currentWordSlots.forEach(s => {
            if (s.btnEl) s.btnEl.classList.remove('used');
        });
        this.currentWordSlots = [];

        item.syllables.forEach((_, idx) => {
            const slot = document.getElementById(`slot-${idx}`);
            if (slot) {
                slot.textContent = '؟';
                slot.className = 'syllable-slot';
            }
        });
    }

    nextSyllableWord() {
        window.soundEngine.playClick();
        this.syllableIndex = (this.syllableIndex + 1) % READING_DATA.syllableWords.length;
        this.loadSyllableWord();
    }

    // =========================================================================
    // 4. אתגר פיצוץ בועות צליל (Bubble Game)
    // =========================================================================
    startBubbleGame() {
        this.bubbleGameActive = true;
        this.bubbleScore = 0;
        this.updateBubbleScore();

        const overlay = document.getElementById('bubble-start-overlay');
        if (overlay) overlay.style.display = 'none';

        this.pickNewBubbleTarget();

        // יצירת בועות רציפה
        if (this.bubbleInterval) clearInterval(this.bubbleInterval);
        this.bubbleInterval = setInterval(() => {
            if (this.bubbleGameActive) this.spawnBubble();
        }, 1300);
    }

    stopBubbleGame() {
        this.bubbleGameActive = false;
        if (this.bubbleInterval) {
            clearInterval(this.bubbleInterval);
            this.bubbleInterval = null;
        }

        // ניקוי בועות קיימות בארנה
        const arena = document.getElementById('bubble-arena');
        if (arena) {
            arena.querySelectorAll('.bubble-item').forEach(b => b.remove());
        }

        const overlay = document.getElementById('bubble-start-overlay');
        if (overlay) overlay.style.display = 'flex';
    }

    pickNewBubbleTarget() {
        const pool = ['בָּ', 'שָׁ', 'מַ', 'דִּי', 'לִי', 'תּוֹ', 'סוּ', 'רֶ', 'גָּ', 'פַּ'];
        this.bubbleTarget = pool[Math.floor(Math.random() * pool.length)];

        const targetEl = document.getElementById('bubble-target-sound');
        if (targetEl) targetEl.textContent = this.bubbleTarget;

        this.playBubblePrompt();
    }

    playBubblePrompt() {
        if (!this.bubbleTarget) return;
        window.soundEngine.speakText(`צליל: ${this.bubbleTarget}`);
    }

    spawnBubble() {
        const arena = document.getElementById('bubble-arena');
        if (!arena) return;

        const bubble = document.createElement('div');
        bubble.className = 'bubble-item';

        // 35% סיכוי שזו תהיה בועת המטרה, אחרת צליל אקראי
        const pool = ['בָּ', 'שָׁ', 'מַ', 'דִּי', 'לִי', 'תּוֹ', 'סוּ', 'רֶ', 'גָּ', 'פַּ', 'כּוֹ', 'נָ'];
        const isTarget = Math.random() < 0.35;
        const sound = isTarget ? this.bubbleTarget : pool[Math.floor(Math.random() * pool.length)];

        bubble.textContent = sound;

        // מיקום אופקי אקראי (10% עד 80%)
        const randomLeft = 10 + Math.random() * 75;
        bubble.style.left = `${randomLeft}%`;

        // משך עלייה אקראי (3.5 עד 5 שניות)
        const duration = 3.5 + Math.random() * 1.5;
        bubble.style.animationDuration = `${duration}s`;

        bubble.addEventListener('click', () => {
            this.onBubbleClick(bubble, sound);
        });

        arena.appendChild(bubble);

        // הסרה לאחר סיום האנימציה
        setTimeout(() => {
            if (bubble.parentNode) bubble.remove();
        }, duration * 1000);
    }

    onBubbleClick(bubbleEl, sound) {
        if (!this.bubbleGameActive) return;

        if (sound === this.bubbleTarget) {
            // פגיעה נכונה!
            window.soundEngine.playPop();
            window.soundEngine.playStar();
            this.bubbleScore += 2;
            this.updateBubbleScore();
            this.addStars(1);

            bubbleEl.style.transform = 'scale(1.4)';
            bubbleEl.style.opacity = '0';
            setTimeout(() => bubbleEl.remove(), 200);

            // בחירת מטרה חדשה מדי פעם
            if (Math.random() < 0.6) {
                this.pickNewBubbleTarget();
            }
        } else {
            // שגיאה
            window.soundEngine.playTryAgain();
            bubbleEl.style.backgroundColor = '#FCA5A5';
            setTimeout(() => {
                if (bubbleEl.parentNode) bubbleEl.remove();
            }, 300);
        }
    }

    updateBubbleScore() {
        const scoreEl = document.getElementById('bubble-score');
        if (scoreEl) scoreEl.textContent = this.bubbleScore;
    }

    // =========================================================================
    // 5. ספריית הסיפורים המדורגת לפי שלבי הניקוד (Storybook Library)
    // =========================================================================
    renderStories() {
        const container = document.getElementById('stories-grid-container');
        if (!container) return;
        container.innerHTML = '';

        const filter = this.currentStoryFilter || 'all';
        const filteredStories = READING_DATA.stories.filter(s => {
            if (filter === 'all') return true;
            return s.stage === filter;
        });

        filteredStories.forEach(story => {
            const card = document.createElement('div');
            card.className = 'story-preview-card';
            card.style.borderTop = `6px solid ${story.color}`;

            card.innerHTML = `
                <div class="story-card-top-tags">
                    <span class="story-badge" style="background-color: ${story.color};">${story.grade}</span>
                    <span class="story-vowels-pill">${story.vowelsAllowed}</span>
                </div>
                <div class="story-card-title">
                    <span>${story.emoji}</span>
                    <span>${story.title}</span>
                </div>
                <p class="story-card-desc">${story.summary}</p>
                <div class="story-card-preview-text">
                    "${story.sentences[0]}"
                </div>
                <button class="btn-primary" style="margin-top: 10px; font-size: 1.05rem; padding: 10px 20px; width: 100%; justify-content: center; background: ${story.color};">
                    <span>📖 בּוֹאוּ נִקְרָא יַחַד!</span>
                </button>
            `;

            card.addEventListener('click', () => this.openStoryReader(story));
            container.appendChild(card);
        });
    }

    openStoryReader(story) {
        this.activeStory = story;
        window.soundEngine.playClick();

        const gridView = document.getElementById('stories-grid-container');
        const filterBar = document.querySelector('.stories-filter-bar');
        const readerView = document.getElementById('story-reader-view');

        if (gridView) gridView.style.display = 'none';
        if (filterBar) filterBar.style.display = 'none';
        if (readerView) readerView.classList.add('active');

        // כותרת ותגיות
        const badgeEl = document.getElementById('reader-story-badge');
        const vowelsPill = document.getElementById('reader-vowels-pill');
        const titleEl = document.getElementById('reader-story-title');

        if (badgeEl) {
            badgeEl.textContent = story.grade;
            badgeEl.style.backgroundColor = story.color;
        }
        if (vowelsPill) {
            vowelsPill.textContent = `תְּנוּעוֹת בַּסִּפּוּר: ${story.vowelsAllowed}`;
        }
        if (titleEl) {
            titleEl.textContent = `${story.emoji} ${story.title}`;
        }

        // משפטים ומילים מנוקדות
        const sentencesContainer = document.getElementById('reader-sentences-container');
        if (sentencesContainer) {
            sentencesContainer.innerHTML = '';
            story.sentences.forEach((sentence, sIdx) => {
                const sDiv = document.createElement('div');
                sDiv.className = 'reader-sentence';
                sDiv.id = `sentence-${sIdx}`;

                // פירוק למילים כדי שניתן יהיה ללחוץ על כל מילה בנפרד
                const words = sentence.split(' ');
                words.forEach((word, wIdx) => {
                    const span = document.createElement('span');
                    span.className = 'reader-word';
                    span.id = `word-${sIdx}-${wIdx}`;
                    span.textContent = word + ' ';
                    
                    span.addEventListener('click', (e) => {
                        e.stopPropagation();
                        window.soundEngine.playClick();
                        window.soundEngine.speakText(word);
                        span.classList.add('reading-highlight');
                        setTimeout(() => span.classList.remove('reading-highlight'), 600);
                    });

                    sDiv.appendChild(span);
                });

                sentencesContainer.appendChild(sDiv);
            });
        }

        // חידון הבנת הנקרא
        this.setupStoryQuiz(story.quiz);
    }

    closeStoryReader() {
        this.stopStoryReading();
        const gridView = document.getElementById('stories-grid-container');
        const filterBar = document.querySelector('.stories-filter-bar');
        const readerView = document.getElementById('story-reader-view');

        if (gridView) gridView.style.display = 'grid';
        if (filterBar) filterBar.style.display = 'flex';
        if (readerView) readerView.classList.remove('active');
        this.activeStory = null;
    }

    playStoryReading() {
        if (!this.activeStory) return;
        this.stopStoryReading();
        this.isReadingStory = true;

        const allWords = [];
        this.activeStory.sentences.forEach((s, sIdx) => {
            const words = s.split(' ');
            words.forEach((w, wIdx) => {
                allWords.push({ word: w, id: `word-${sIdx}-${wIdx}` });
            });
        });

        // הקראה מלאה עם הדגשת מילים קריוקי
        const fullText = this.activeStory.sentences.join(' ');
        window.soundEngine.speakText(fullText, {
            rate: 0.8,
            onEnd: () => {
                this.stopStoryReading();
                this.addStars(5);
                this.setMascotMessage(`כָּל הַכָּבוֹד, ${this.childName}! קָרָאנוּ אֶת הַסִּפּוּר! כָּעֵת עֲנוּ עַל הַשְּׁאֵלָה לְמַטָּה! 👏`);
            }
        });

        // הדגשת קריוקי בקצב מתואם
        let delay = 0;
        const wordDuration = 700; // מילישניות ממוצע למילה
        allWords.forEach((item, idx) => {
            const tid = setTimeout(() => {
                if (!this.isReadingStory) return;
                document.querySelectorAll('.reader-word').forEach(w => w.classList.remove('reading-highlight'));
                const el = document.getElementById(item.id);
                if (el) el.classList.add('reading-highlight');
            }, delay);
            this.readingTimeouts.push(tid);
            delay += wordDuration;
        });
    }

    stopStoryReading() {
        this.isReadingStory = false;
        window.soundEngine.stopSpeech();
        this.readingTimeouts.forEach(t => clearTimeout(t));
        this.readingTimeouts = [];
        document.querySelectorAll('.reader-word').forEach(w => w.classList.remove('reading-highlight'));
    }

    setupStoryQuiz(quiz) {
        const qTitle = document.getElementById('story-quiz-question');
        const optionsContainer = document.getElementById('story-quiz-options');
        const feedbackEl = document.getElementById('story-quiz-feedback');

        if (qTitle) qTitle.textContent = `❓ שְׁאֵלַת הֲבָנָה: ${quiz.question}`;
        if (feedbackEl) {
            feedbackEl.style.display = 'none';
            feedbackEl.textContent = '';
        }

        if (optionsContainer) {
            optionsContainer.innerHTML = '';
            quiz.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'quiz-option-btn';
                btn.textContent = opt.text;

                btn.addEventListener('click', () => {
                    if (opt.correct) {
                        btn.classList.add('correct');
                        window.soundEngine.playSuccess();
                        this.triggerConfetti();
                        this.addStars(5);
                        if (feedbackEl) {
                            feedbackEl.style.display = 'block';
                            feedbackEl.style.color = '#065F46';
                            feedbackEl.textContent = `🎉 כָּל הַכָּבוֹד, ${this.childName}! ${quiz.explanation}`;
                        }
                    } else {
                        btn.classList.add('wrong');
                        window.soundEngine.playTryAgain();
                        if (feedbackEl) {
                            feedbackEl.style.display = 'block';
                            feedbackEl.style.color = '#991B1B';
                            feedbackEl.textContent = 'נַסּוּ שׁוּב! קִרְאוּ שׁוּב אֶת הַמִּשְׁפָּט הַמַּתְאִים בַּסִּפּוּר.';
                        }
                    }
                });

                optionsContainer.appendChild(btn);
            });
        }
    }

    // =========================================================================
    // 6. אלבום המדבקות וההישגים (Sticker Album)
    // =========================================================================
    renderStickers() {
        const container = document.getElementById('stickers-grid-container');
        if (!container) return;
        container.innerHTML = '';

        READING_DATA.stickers.forEach(sticker => {
            const isUnlocked = this.unlockedStickers.includes(sticker.id);
            const card = document.createElement('div');
            card.className = `sticker-card ${isUnlocked ? 'unlocked' : 'locked'}`;

            card.innerHTML = `
                <div class="sticker-icon-wrap">${isUnlocked ? sticker.icon : '🔒'}</div>
                <div class="sticker-title">${sticker.title}</div>
                <div class="sticker-desc">${sticker.desc}</div>
                <span class="sticker-status">
                    ${isUnlocked ? 'נִפְתַּח! ⭐' : `דּוֹרֵשׁ ${sticker.starsNeeded} כּוֹכָבִים`}
                </span>
            `;

            if (isUnlocked) {
                card.addEventListener('click', () => {
                    window.soundEngine.playStar();
                    this.setMascotMessage(`מַדְבָּקָה מְיֻחֶדֶת: "${sticker.title}"! כָּל הַכָּבוֹד! 🌟`);
                });
            }

            container.appendChild(card);
        });
    }

    // =========================================================================
    // מודאלים ועזרים (Modals, Profile & Avatars, Font, Confetti)
    // =========================================================================
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('open');
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('open');
        window.soundEngine.playClick();
    }

    openProfileModal() {
        this.selectedAvatar = this.avatar;
        const input = document.getElementById('child-name-input');
        if (input) {
            input.value = this.childName === 'הַקּוֹרֵא הָאַלּוּף' ? '' : this.childName;
        }
        this.highlightSelectedAvatarChoice(this.selectedAvatar);
        this.openModal('profile-modal');
        if (input) {
            setTimeout(() => input.focus(), 300);
        }
    }

    selectAvatarChoice(emoji) {
        this.selectedAvatar = emoji;
        window.soundEngine.playClick();
        this.highlightSelectedAvatarChoice(emoji);
    }

    highlightSelectedAvatarChoice(emoji) {
        document.querySelectorAll('.avatar-option-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.avatar === emoji);
        });
    }

    saveProfile() {
        const input = document.getElementById('child-name-input');
        const enteredName = input ? input.value.trim() : '';

        if (enteredName) {
            this.childName = enteredName;
            localStorage.setItem('hebrew_reading_child_name', this.childName);
        }

        if (this.selectedAvatar) {
            this.avatar = this.selectedAvatar;
            localStorage.setItem('hebrew_reading_avatar', this.avatar);
        }

        this.updateHeaderStats();
        this.closeModal('profile-modal');
        window.soundEngine.playSuccess();
        this.triggerConfetti();

        this.setMascotMessage(`שָׁלוֹם ${this.childName}! אֵיזֶה שֵׁם יָפֶה! כָּעֵת בּוֹאוּ נִלְמַד קְרִיאָה בְּכֵיף! 🦉🌟`, true);
    }

    openVoiceModal() {
        const selectEl = document.getElementById('voice-select-dropdown');
        if (selectEl) {
            selectEl.innerHTML = '';
            const hebrewVoices = window.soundEngine.getAvailableHebrewVoices();
            const currentVoice = window.soundEngine.getSelectedVoice();

            if (hebrewVoices.length === 0) {
                const opt = document.createElement('option');
                opt.value = '';
                opt.textContent = 'לא נמצא קול עברי ייעודי במכשיר (ראו טיפ למטה)';
                selectEl.appendChild(opt);
            } else {
                hebrewVoices.forEach(voice => {
                    const opt = document.createElement('option');
                    opt.value = voice.voiceURI;
                    
                    let label = voice.name;
                    if (voice.name.includes('Avri') || voice.name.includes('Natural') || voice.name.includes('Hila')) {
                        label += ' 🌟 (קול טבעי מומלץ במיוחד!)';
                    } else if (voice.name.includes('Google')) {
                        label += ' 🌐 (קול Google עברית)';
                    }
                    opt.textContent = label;

                    if (currentVoice && currentVoice.voiceURI === voice.voiceURI) {
                        opt.selected = true;
                    }
                    selectEl.appendChild(opt);
                });
            }
        }
        this.openModal('voice-modal');
    }

    testSelectedVoice() {
        const selectEl = document.getElementById('voice-select-dropdown');
        const uri = selectEl ? selectEl.value : null;
        window.soundEngine.testVoice(uri);
    }

    saveVoiceSelection() {
        const selectEl = document.getElementById('voice-select-dropdown');
        const uri = selectEl ? selectEl.value : null;
        if (uri) {
            window.soundEngine.setVoice(uri);
        }
        this.closeModal('voice-modal');
        window.soundEngine.playSuccess();
        this.setMascotMessage('מְעֻלֶּה! הַקּוֹל הָעִבְרִי הַמְּבֻקָּשׁ נִבְחַר בְּהַצְלָחָה! 🗣️✨', true);
    }

    toggleFontSize() {
        this.currentScaleIdx = (this.currentScaleIdx + 1) % this.fontScales.length;
        const scale = this.fontScales[this.currentScaleIdx];
        document.documentElement.style.setProperty('--font-scale', scale);
        window.soundEngine.playClick();
    }

    toggleNiqqudHighlight() {
        this.highlightNiqqud = !this.highlightNiqqud;
        localStorage.setItem('hebrew_reading_highlight_niqqud', this.highlightNiqqud);
        document.body.classList.toggle('highlight-niqqud', this.highlightNiqqud);
        window.soundEngine.playClick();
    }

    setupEventListeners() {
        // לשוניות ניווט
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.showZone(tab.dataset.zone);
            });
        });

        // כפתור פרופיל שחקן (שם ודמות)
        const profileTrigger = document.getElementById('player-profile-trigger');
        if (profileTrigger) profileTrigger.addEventListener('click', () => this.openProfileModal());

        // שמירה בלחיצה על Enter בשדה השם
        const nameInput = document.getElementById('child-name-input');
        if (nameInput) {
            nameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.saveProfile();
                }
            });
        }

        // כפתורי ראש הדף
        const voiceBtn = document.getElementById('voice-settings-btn');
        if (voiceBtn) voiceBtn.addEventListener('click', () => this.openVoiceModal());

        const soundBtn = document.getElementById('sound-toggle-btn');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                const muted = window.soundEngine.toggleMute();
                soundBtn.textContent = muted ? '🔇' : '🔊';
            });
            soundBtn.textContent = window.soundEngine.isMuted() ? '🔇' : '🔊';
        }

        const fontBtn = document.getElementById('font-size-btn');
        if (fontBtn) fontBtn.addEventListener('click', () => this.toggleFontSize());

        const niqqudBtn = document.getElementById('niqqud-color-btn');
        if (niqqudBtn) niqqudBtn.addEventListener('click', () => this.toggleNiqqudHighlight());

        // כפתור הקראת ינשוף
        const mascotSpeakBtn = document.getElementById('mascot-speak-btn');
        if (mascotSpeakBtn) {
            mascotSpeakBtn.addEventListener('click', () => {
                const textEl = document.getElementById('mascot-text-display');
                if (textEl) window.soundEngine.speakText(textEl.textContent);
            });
        }

        // סינון אותיות
        document.querySelectorAll('.letters-filter-bar .filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.letters-filter-bar .filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentLetterFilter = btn.dataset.filter;
                window.soundEngine.playClick();
                this.renderLetters();
            });
        });

        // סינון שלבי סיפורי קריאה
        document.querySelectorAll('.stories-filter-bar .filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.stories-filter-bar .filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentStoryFilter = btn.dataset.storyFilter;
                window.soundEngine.playClick();
                this.renderStories();
            });
        });

        // משחק בועות
        const bubbleStartBtn = document.getElementById('bubble-start-btn');
        if (bubbleStartBtn) bubbleStartBtn.addEventListener('click', () => this.startBubbleGame());

        const bubbleRepeatBtn = document.getElementById('bubble-repeat-sound-btn');
        if (bubbleRepeatBtn) bubbleRepeatBtn.addEventListener('click', () => this.playBubblePrompt());

        // נגן סיפורים
        const readerPlayBtn = document.getElementById('reader-play-btn');
        const readerStopBtn = document.getElementById('reader-stop-btn');
        const readerBackBtn = document.getElementById('reader-back-btn');

        if (readerPlayBtn) readerPlayBtn.addEventListener('click', () => this.playStoryReading());
        if (readerStopBtn) readerStopBtn.addEventListener('click', () => this.stopStoryReading());
        if (readerBackBtn) readerBackBtn.addEventListener('click', () => this.closeStoryReader());

        // סגירת מודאלים בלחיצה על הרקע
        document.querySelectorAll('.modal-backdrop').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('open');
            });
        });
    }

    // =========================================================================
    // אנימציית קונפטי עצמאית (Canvas Confetti)
    // =========================================================================
    initConfetti() {
        if (!this.confettiCanvas) return;
        const resize = () => {
            this.confettiCanvas.width = window.innerWidth;
            this.confettiCanvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();
    }

    triggerConfetti() {
        if (!this.confettiCtx) return;
        const colors = ['#4F46E5', '#EC4899', '#10B981', '#F59E0B', '#06B6D4', '#8B5CF6'];
        
        for (let i = 0; i < 90; i++) {
            this.particles.push({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                vx: (Math.random() - 0.5) * 14,
                vy: (Math.random() - 0.8) * 16,
                size: 6 + Math.random() * 8,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                vRot: (Math.random() - 0.5) * 10,
                opacity: 1
            });
        }

        if (!this.animatingConfetti) {
            this.animatingConfetti = true;
            this.renderConfettiFrame();
        }
    }

    renderConfettiFrame() {
        if (!this.confettiCtx || this.particles.length === 0) {
            this.animatingConfetti = false;
            if (this.confettiCtx) this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
            return;
        }

        this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.45; // כוח כבידה
            p.rotation += p.vRot;
            p.opacity -= 0.012;

            this.confettiCtx.save();
            this.confettiCtx.translate(p.x, p.y);
            this.confettiCtx.rotate((p.rotation * Math.PI) / 180);
            this.confettiCtx.fillStyle = p.color;
            this.confettiCtx.globalAlpha = Math.max(0, p.opacity);
            this.confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            this.confettiCtx.restore();

            if (p.opacity <= 0 || p.y > window.innerHeight) {
                this.particles.splice(i, 1);
            }
        }

        requestAnimationFrame(() => this.renderConfettiFrame());
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

// הפעלת האפליקציה בטעינת העמוד
window.addEventListener('DOMContentLoaded', () => {
    window.app = new ReadingApp();
});
