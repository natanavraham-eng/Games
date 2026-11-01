/**
 * sound-effects.js
 * מנוע שמע וצלילים עצמאי מבוסס Web Audio API ומנוע הקראה קולית בעברית (Web Speech API).
 * כולל תמיכה מתקדמת באיתור קולות עבריים טבעיים (Microsoft Natural / Google Hebrew / Carmit),
 * סינון מבטאים זרים, ונרמול פונטי חכם של טקסטים מנוקדים למבטא ישראלי אותנטי!
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = localStorage.getItem('hebrew_reading_muted') === 'true';
        this.speechAvailable = 'speechSynthesis' in window;
        this.hebrewVoice = null;
        this.savedVoiceURI = localStorage.getItem('hebrew_reading_voice_uri') || null;
        this.speechRate = parseFloat(localStorage.getItem('hebrew_reading_speech_rate') || '0.9');

        this.initAudioContext();
        this.initVoices();
    }

    initAudioContext() {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
            }
        } catch (e) {
            console.warn('Web Audio API not supported on this browser', e);
        }
    }

    ensureContext() {
        if (!this.ctx) {
            this.initAudioContext();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // =========================================================================
    // ניהול קולות עבריים אותנטיים (Hebrew Voices Selection & Normalization)
    // =========================================================================
    isHebrewVoice(v) {
        if (!v) return false;
        const lang = (v.lang || '').toLowerCase();
        const name = (v.name || '').toLowerCase();

        // חסימת קולות אנגליים או שפות אחרות בעלי סיומת מחוזית IL (כמו en-IL) שגורמים למבטא זר!
        if (lang.startsWith('en') || lang.startsWith('ar') || lang.startsWith('ru') || lang.startsWith('fr') || lang.startsWith('es')) {
            return false;
        }

        return lang.startsWith('he') || lang.startsWith('iw') || name.includes('hebrew') || name.includes('עברית');
    }

    getVoiceScore(voice) {
        const name = (voice.name || '').toLowerCase();
        // 1. קולות טבעיים באיכות גבוהה במיוחד (Edge / Windows 11 / Azure Neural)
        if (name.includes('natural') || name.includes('online')) {
            if (name.includes('avri')) return 100; // אברי (Microsoft Avri Natural)
            if (name.includes('hila')) return 98;  // הילה (Microsoft Hila Natural)
            return 95;
        }
        // 2. קולות Google Hebrew ב-Chrome
        if (name.includes('google')) return 85;
        // 3. קולות Apple Hebrew (Carmit / Sara)
        if (name.includes('carmit') || name.includes('sara')) return 80;
        // 4. קולות מקומיים של Microsoft (Asaf, Hila שולחני)
        if (name.includes('asaf') || name.includes('hila')) return 75;
        // 5. כל קול אחר בעברית
        if (voice.lang && voice.lang.toLowerCase() === 'he-il') return 70;
        return 60;
    }

    getAvailableHebrewVoices() {
        if (!this.speechAvailable) return [];
        const allVoices = window.speechSynthesis.getVoices();
        const hebrewVoices = allVoices.filter(v => this.isHebrewVoice(v));

        hebrewVoices.sort((a, b) => this.getVoiceScore(b) - this.getVoiceScore(a));
        return hebrewVoices;
    }

    initVoices() {
        if (!this.speechAvailable) return;

        const update = () => {
            const hebrewVoices = this.getAvailableHebrewVoices();
            if (hebrewVoices.length > 0) {
                // בדיקה אם נבחר קול בעבר
                if (this.savedVoiceURI) {
                    const match = hebrewVoices.find(v => v.voiceURI === this.savedVoiceURI);
                    if (match) {
                        this.hebrewVoice = match;
                        return;
                    }
                }
                // ברירת מחדל: הקול האיכותי והטבעי ביותר הזמין במחשב
                this.hebrewVoice = hebrewVoices[0];
            } else {
                this.hebrewVoice = null;
            }
        };

        update();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = update;
        }
    }

    setVoice(voiceURI) {
        const hebrewVoices = this.getAvailableHebrewVoices();
        const found = hebrewVoices.find(v => v.voiceURI === voiceURI);
        if (found) {
            this.hebrewVoice = found;
            this.savedVoiceURI = voiceURI;
            localStorage.setItem('hebrew_reading_voice_uri', voiceURI);
            return true;
        }
        return false;
    }

    getSelectedVoice() {
        return this.hebrewVoice;
    }

    /**
     * נרמול פונטי חכם של טקסט בעברית עבור מנועי SpeechSynthesis:
     * - צלילים והברות בודדות מומרים לתעתיק מותאם כדי שהמנוע יבטא אותם במדויק.
     * - מילים ומשפטים שלמים: מנועי TTS בעברית מאומנים על כתיב חסר/מלא ומבטאים אותם
     *   במבטא ישראלי שוטף וטבעי, בעוד שתווי ניקוד Unicode משבשים את פעולת המודל.
     */
    normalizeTextForSpeech(text) {
        if (!text) return '';

        const trimmed = text.trim();

        // מפת פונטית להברות יחידות ותנועות (כדי שהמנוע יקרא "בָּ" כ-"בַּה" ולא כ-"בי" או "אות בית")
        const singlePhoneticMap = {
            'אָ': 'אַה', 'אַ': 'אַה',
            'בָּ': 'בַּה', 'בַּ': 'בַּה', 'בִּי': 'בִּי', 'בּוֹ': 'בּוֹ', 'בּוּ': 'בּוּ', 'בֵּ': 'בֶּה', 'בֶּ': 'בֶּה',
            'גָּ': 'גַּה', 'גַּ': 'גַּה', 'גִּי': 'גִּי', 'גוֹ': 'גוֹ', 'גוּ': 'גוּ', 'גֵּ': 'גֶּה', 'גֶּ': 'גֶּה',
            'דָּ': 'דַּה', 'דַּ': 'דַּה', 'דִּי': 'דִּי', 'דּוֹ': 'דּוֹ', 'דּוּ': 'דּוּ', 'דֵּ': 'דֶּה', 'דֶּ': 'דֶּה',
            'הָ': 'הַה', 'הַ': 'הַה',
            'וָ': 'וַה', 'וַ': 'וַה',
            'זָ': 'זַה', 'זַ': 'זַה',
            'חָ': 'חַה', 'חַ': 'חַה',
            'טָ': 'טַה', 'טַ': 'טַה',
            'יָ': 'יַה', 'יַ': 'יַה',
            'כָּ': 'כַּה', 'כַּ': 'כַּה', 'כּוֹ': 'כּוֹ', 'כּוּ': 'כּוּ',
            'לָ': 'לַה', 'לַ': 'לַה', 'לִי': 'לִי', 'לוֹ': 'לוֹ', 'לוּ': 'לוּ', 'לֵ': 'לֶה', 'לֶ': 'לֶה',
            'מָ': 'מַה', 'מַ': 'מַה', 'מִי': 'מִי', 'מוֹ': 'מוֹ', 'מוּ': 'מוּ', 'מֵ': 'מֶה', 'מֶ': 'מֶה',
            'נָ': 'נַה', 'נַ': 'נַה', 'נִי': 'נִי', 'נוֹ': 'נוֹ', 'נוּ': 'נוּ',
            'סָ': 'סַה', 'סַ': 'סַה', 'סִי': 'סִי', 'סוֹ': 'סוֹ', 'סוּ': 'סוּ', 'סֵ': 'סֶה', 'סֶ': 'סֶה',
            'עָ': 'עַה', 'עַ': 'עַה',
            'פָּ': 'פַּה', 'פַּ': 'פַּה', 'פִּי': 'פִּי', 'פּוֹ': 'פּוֹ', 'פּוּ': 'פּוּ', 'פֵּ': 'פֶּה', 'פֶּ': 'פֶּה',
            'צָ': 'צַה', 'צַ': 'צַה',
            'קָ': 'קַה', 'קַ': 'קַה',
            'רָ': 'רַה', 'רַ': 'רַה', 'רִי': 'רִי', 'רוֹ': 'רוֹ', 'רוּ': 'רוּ', 'רֵ': 'רֶה', 'רֶ': 'רֶה',
            'שָׁ': 'שָׁה', 'שַׁ': 'שָׁה', 'שִׁי': 'שִׁי', 'שׁוֹ': 'שׁוֹ', 'שׁוּ': 'שׁוּ', 'שֵׁ': 'שֶׁה', 'שֶׁ': 'שֶׁה',
            'תָּ': 'תַּה', 'תַּ': 'תַּה', 'תִּי': 'תִּי', 'תּוֹ': 'תּוֹ', 'תּוּ': 'תּוּ', 'תֵּ': 'תֶּה', 'תֶּ': 'תֶּה'
        };

        if (singlePhoneticMap[trimmed]) {
            return singlePhoneticMap[trimmed];
        }

        // עבור מילים ומשפטים רגילים (מעל 2 תווים):
        // הסרת סימני ניקוד יוניקוד (U+0591 עד U+05BD, U+05BF עד U+05C7)
        // כדי שמנוע הדיבור העברי יקרא בצורה טבעית ללא גמגום
        if (trimmed.length > 2) {
            return trimmed.replace(/[\u0591-\u05BD\u05BF-\u05C7]/g, '');
        }

        return trimmed;
    }

    // =========================================================================
    // השמעת קול (Speech)
    // =========================================================================
    speakText(text, options = {}) {
        if (this.muted || !this.speechAvailable) return;

        window.speechSynthesis.cancel(); // עצירת הקראה קודמת

        const cleanText = this.normalizeTextForSpeech(text);
        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'he-IL';
        utterance.rate = options.rate || this.speechRate; // קצב טבעי
        utterance.pitch = options.pitch || 1.0; // טון דיבור אנושי טבעי

        // וידוא שהקול העברי הנבחר מעודכן
        if (!this.hebrewVoice) {
            const hebrewVoices = this.getAvailableHebrewVoices();
            if (hebrewVoices.length > 0) this.hebrewVoice = hebrewVoices[0];
        }

        if (this.hebrewVoice) {
            utterance.voice = this.hebrewVoice;
        }

        if (options.onStart) utterance.onstart = options.onStart;
        if (options.onEnd) utterance.onend = options.onEnd;
        if (options.onBoundary) utterance.onboundary = options.onBoundary;

        window.speechSynthesis.speak(utterance);
    }

    testVoice(voiceURI) {
        if (voiceURI) this.setVoice(voiceURI);
        this.speakText(`שָׁלוֹם! זֶהוּ קוֹל עִבְרִי בְּמִבְטָא יִשְׂרְאֵלִי.`);
    }

    stopSpeech() {
        if (this.speechAvailable) {
            window.speechSynthesis.cancel();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('hebrew_reading_muted', this.muted);
        if (this.muted && this.speechAvailable) {
            window.speechSynthesis.cancel();
        }
        return this.muted;
    }

    isMuted() {
        return this.muted;
    }

    // =========================================================================
    // סינתיסייזר צלילי משחק עצמאי (Web Audio API Synthesizer)
    // =========================================================================
    playClick() {
        if (this.muted) return;
        this.ensureContext();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.05);
        } catch (e) {}
    }

    playPop() {
        if (this.muted) return;
        this.ensureContext();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(450, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);

            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.1);
        } catch (e) {}
    }

    playSuccess() {
        if (this.muted) return;
        this.ensureContext();
        if (!this.ctx) return;

        try {
            const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
            const now = this.ctx.currentTime;

            notes.forEach((freq, index) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const noteTime = now + (index * 0.09);

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, noteTime);

                gain.gain.setValueAtTime(0, noteTime);
                gain.gain.linearRampToValueAtTime(0.2, noteTime + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(noteTime);
                osc.stop(noteTime + 0.35);
            });
        } catch (e) {}
    }

    playStar() {
        if (this.muted) return;
        this.ensureContext();
        if (!this.ctx) return;

        try {
            const notes = [1318.51, 1567.98, 2093.00]; // E6, G6, C7
            const now = this.ctx.currentTime;

            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const t = now + (idx * 0.07);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, t);

                gain.gain.setValueAtTime(0.18, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(t);
                osc.stop(t + 0.25);
            });
        } catch (e) {}
    }

    playTryAgain() {
        if (this.muted) return;
        this.ensureContext();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.linearRampToValueAtTime(260, now + 0.2);

            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.2);
        } catch (e) {}
    }

    playFanfare() {
        if (this.muted) return;
        this.ensureContext();
        if (!this.ctx) return;

        try {
            const chords = [
                { notes: [523.25, 659.25], delay: 0, duration: 0.2 },
                { notes: [523.25, 659.25], delay: 0.18, duration: 0.2 },
                { notes: [523.25, 659.25], delay: 0.36, duration: 0.2 },
                { notes: [659.25, 783.99, 1046.5], delay: 0.54, duration: 0.6 }
            ];

            const now = this.ctx.currentTime;

            chords.forEach(item => {
                item.notes.forEach(freq => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    const t = now + item.delay;

                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, t);

                    gain.gain.setValueAtTime(0.12, t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + item.duration);

                    osc.connect(gain);
                    gain.connect(this.ctx.destination);

                    osc.start(t);
                    osc.stop(t + item.duration);
                });
            });
        } catch (e) {}
    }
}

// יצירת מופע גלובלי
window.soundEngine = new SoundEngine();
