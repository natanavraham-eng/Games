/**
 * reading-data.js
 * מאגר תכנים פדגוגי מקיף ללימוד קריאה בעברית (כיתות א'-ב')
 * מותאם לשלבי רכישת הקריאה: אותיות, תנועות, הברות, מילים וסיפורים קצרים.
 */

const READING_DATA = {
    // 1. אותיות האלף-בית כולל אותיות סופיות
    letters: [
        { char: 'א', name: 'אָלֶף', sound: 'ah', word: 'אַרְנָב', meaning: 'Rabbit', emoji: '🐇', hint: 'א׳ היא האות הראשונה, לפעמים שקטה ולפעמים נשמעת עם תנועה!' },
        { char: 'ב', name: 'בֵּית', sound: 'b / v', word: 'בַּיִת', meaning: 'House', emoji: '🏠', hint: 'עם נקודה בבטן זו בּ (B), בלי נקודה זו בֿ (V)!' },
        { char: 'ג', name: 'גִּימֶל', sound: 'g', word: 'גָּמָל', meaning: 'Camel', emoji: '🐫', hint: 'ג׳ הולכת עם רגל אחת קדימה!' },
        { char: 'ד', name: 'דָּלֶת', sound: 'd', word: 'דֶּלֶת', meaning: 'Door', emoji: '🚪', hint: 'לד׳ יש גג ישר ורגל זקופה!' },
        { char: 'ה', name: 'הֵא', sound: 'h', word: 'הַר', meaning: 'Mountain', emoji: '⛰️', hint: 'לה׳ יש פתח קטן מצד שמאל כדי לנשום!' },
        { char: 'ו', name: 'וָאו', sound: 'v / o / u', word: 'וֶרֶד', meaning: 'Rose', emoji: '🌹', hint: 'ו׳ היא מקל ישר ומתוק שיכול להיות וָ, אוֹ, אוּ!' },
        { char: 'ז', name: 'זַיִן', sound: 'z', word: 'זְבוּב', meaning: 'Fly', emoji: '🪰', hint: 'ז׳ מזמזמת כמו דבורה קטנה!' },
        { char: 'ח', name: 'חֵית', sound: 'ch', word: 'חָתוּל', meaning: 'Cat', emoji: '🐱', hint: 'ח׳ סגורה מלמעלה לגמרי בלי פתח!' },
        { char: 'ט', name: 'טֵית', sound: 't', word: 'טַוָּס', meaning: 'Peacock', emoji: '🦚', hint: 'ט׳ נראית כמו קערה שמסתכלת ימינה!' },
        { char: 'י', name: 'יוֹד', sound: 'y', word: 'יָרֵחַ', meaning: 'Moon', emoji: '🌙', hint: 'י׳ היא האות הקטנה ביותר, כמו כוכב בשמיים!' },
        { char: 'כ', name: 'כַּף', sound: 'k / ch', word: 'כַּדּוּר', meaning: 'Ball', emoji: '⚽', hint: 'כ׳ עגולה כמו כדור, עם נקודה כּ (K), בלי נקודה כֿ (CH)!' },
        { char: 'ך', name: 'כַּף סוֹפִית', sound: 'ch (end)', word: 'מֶלֶךְ', meaning: 'King', emoji: '👑', hint: 'בסוף מילה כ׳ מותחת את הרגל למטה: ך!' },
        { char: 'ל', name: 'לָמֶד', sound: 'l', word: 'לֵב', meaning: 'Heart', emoji: '❤️', hint: 'ל׳ היא האות הגבוהה ביותר, שולחת צוואר לשמיים!' },
        { char: 'מ', name: 'מֵם', sound: 'm', word: 'מַיִם', meaning: 'Water', emoji: '💧', hint: 'מ׳ מתחילה מילים מתוקות כמו מַיִם וּמַתָּנָה!' },
        { char: 'ם', name: 'מֵם סוֹפִית', sound: 'm (end)', word: 'שָׁלוֹם', meaning: 'Peace/Hello', emoji: '🕊️', hint: 'בסוף מילה מ׳ נסגרת לריבוע מושלם: ם!' },
        { char: 'נ', name: 'נוּן', sound: 'n', word: 'נֵר', meaning: 'Candle', emoji: '🕯️', hint: 'נ׳ יושבת בנימוס עם רגל על השורה!' },
        { char: 'ן', name: 'נוּן סוֹפִית', sound: 'n (end)', word: 'בָּלוֹן', meaning: 'Balloon', emoji: '🎈', hint: 'בסוף מילה נ׳ עומדת זקופה וארוכה: ן!' },
        { char: 'ס', name: 'סָמֶךְ', sound: 's', word: 'סוּס', meaning: 'Horse', emoji: '🐴', hint: 'ס׳ עגולה ושמנמנה כמו גלגל!' },
        { char: 'ע', name: 'עַיִן', sound: 'a', word: 'עֵץ', meaning: 'Tree', emoji: '🌳', hint: 'לע׳ יש שתי עיניים שמסתכלות לצדדים!' },
        { char: 'פ', name: 'פֵּא', sound: 'p / f', word: 'פַּרְפַּר', meaning: 'Butterfly', emoji: '🦋', hint: 'עם נקודה פּ (P) פצצה! בלי נקודה פֿ (F) עפיפון!' },
        { char: 'ף', name: 'פֵּא סוֹפִית', sound: 'f (end)', word: 'תּוֹף', meaning: 'Drum', emoji: '🥁', hint: 'בסוף מילה פ׳ מורידה רגל ארוכה: ף!' },
        { char: 'צ', name: 'צָדִי', sound: 'ts', word: 'צָב', meaning: 'Turtle', emoji: '🐢', hint: 'צ׳ נראית כמו צבי שמקפץ!' },
        { char: 'ץ', name: 'צָדִי סוֹפִית', sound: 'ts (end)', word: 'עֵץ', meaning: 'Tree', emoji: '🪵', hint: 'בסוף מילה צ׳ עומדת ישר: ץ!' },
        { char: 'ק', name: 'קוֹף', sound: 'k', word: 'קוֹף', meaning: 'Monkey', emoji: '🐒', hint: 'לק׳ יש רגל ארוכה שיורדת מתחת לשורה!' },
        { char: 'ר', name: 'רֵישׁ', sound: 'r', word: 'רַכֶּבֶת', meaning: 'Train', emoji: '🚆', hint: 'לר׳ יש פינה עגולה ויפה בראש הגג!' },
        { char: 'ש', name: 'שִׁין / שִׂין', sound: 'sh / s', word: 'שֶׁמֶשׁ', meaning: 'Sun', emoji: '☀️', hint: 'נקודה בימין = שׁ (Sh כמו שמש), נקודה בשמאל = שׂ (S כמו שמחה)!' },
        { char: 'ת', name: 'תָּו', sound: 't', word: 'תַּפּוּחַ', meaning: 'Apple', emoji: '🍎', hint: 'ת׳ היא האות האחרונה בחבילה, עם שתי רגליים יציבות!' }
    ],

    // 2. תנועות הניקוד
    vowels: [
        {
            id: 'a',
            name: 'קָמָץ וּפַתָּח',
            symbol: 'ָ  /  ַ',
            soundName: 'תְּנוּעַת אָה (A)',
            color: '#FF5722',
            description: 'פותחים את הפה גדול כמו אצל הרופא ואומרים: "אָה!"',
            exampleLetter: 'בָּ / בַּ',
            exampleWord: 'בָּלָגָאן, עַנָן, יָד',
            samples: [
                { letter: 'בָּ', read: 'בָּה' },
                { letter: 'גַּ', read: 'גַּה' },
                { letter: 'דָּ', read: 'דָּה' },
                { letter: 'מַ', read: 'מַה' },
                { letter: 'שָׁ', read: 'שָׁה' }
            ]
        },
        {
            id: 'i',
            name: 'חִירִיק',
            symbol: 'ִ  (או ִי)',
            soundName: 'תְּנוּעַת אִי (I)',
            color: '#2196F3',
            description: 'מחייכים חיוך רחב ומצפצפים: "אִי!" עם נקודה אחת למטה.',
            exampleLetter: 'בִּי',
            exampleWord: 'אִמָּא, סִיר, שִׁיר',
            samples: [
                { letter: 'לִי', read: 'לִי' },
                { letter: 'מִי', read: 'מִי' },
                { letter: 'שִׁי', read: 'שִׁי' },
                { letter: 'דִּי', read: 'דִּי' },
                { letter: 'סִי', read: 'סִי' }
            ]
        },
        {
            id: 'o',
            name: 'חוֹלָם',
            symbol: 'ֹ  (או וֹ)',
            soundName: 'תְּנוּעַת אוֹ (O)',
            color: '#FF9800',
            description: 'מעגלים את השפתיים לעיגול עגול ואומרים: "אוֹ!" כמו הפתעה!',
            exampleLetter: 'בּוֹ',
            exampleWord: 'כּוֹכָב, שׁוֹר, שׁוֹקוֹלָד',
            samples: [
                { letter: 'בּוֹ', read: 'בּוֹ' },
                { letter: 'שׂוֹ', read: 'שׂוֹ' },
                { letter: 'דּוֹ', read: 'דּוֹ' },
                { letter: 'כּוֹ', read: 'כּוֹ' },
                { letter: 'רוֹ', read: 'רוֹ' }
            ]
        },
        {
            id: 'u',
            name: 'שׁוּרוּק וְקֻבּוּץ',
            symbol: 'וּ  /  ֻ',
            soundName: 'תְּנוּעַת אוּ (U)',
            color: '#9C27B0',
            description: 'מכווצים את השפתיים חזק כמו שריקה: "אוּ!"',
            exampleLetter: 'סוּס',
            exampleWord: 'כַּדּוּר, תַּפּוּז, סוּס',
            samples: [
                { letter: 'סוּ', read: 'סוּ' },
                { letter: 'תּוּ', read: 'תּוּ' },
                { letter: 'בּוּ', read: 'בּוּ' },
                { letter: 'גוּ', read: 'גוּ' },
                { letter: 'רוּ', read: 'רוּ' }
            ]
        },
        {
            id: 'e',
            name: 'סֶגוֹל וְצֵירֵה',
            symbol: 'ֶ  /  ֵ',
            soundName: 'תְּנוּעַת אֶה (E)',
            color: '#4CAF50',
            description: 'פותחים חצי חיוך רגוע ואומרים: "אֶה!" (שתיים או שלוש נקודות).',
            exampleLetter: 'סֵפֶר',
            exampleWord: 'כֶּלֶב, יֶלֶד, גֶּשֶׁם',
            samples: [
                { letter: 'סֵ', read: 'סֵה' },
                { letter: 'דֶּ', read: 'דֶּה' },
                { letter: 'רֶ', read: 'רֶה' },
                { letter: 'לֵ', read: 'לֵה' },
                { letter: 'בֵּ', read: 'בֵּה' }
            ]
        },
        {
            id: 'sheva',
            name: 'שְׁוָא',
            symbol: 'ְ',
            soundName: 'עֲצִירָה / שְׁוָא (ְ)',
            color: '#607D8B',
            description: 'שתי נקודות זו מעל זו. עוצרים לרגע את הנשימה או נותנים צליל קצרצר!',
            exampleLetter: 'פַּרְפַּר',
            exampleWord: 'מִכְתָּב, סְפָרִים, פַּרְפַּר',
            samples: [
                { letter: 'בְּ', read: 'בְּ' },
                { letter: 'סְ', read: 'סְ' },
                { letter: 'מְ', read: 'מְ' },
                { letter: 'פְּ', read: 'פְּ' },
                { letter: 'שְׁ', read: 'שְׁ' }
            ]
        }
    ],

    // 3. מילים מפורקות להברות (להרכבת מילים - Syllable Lab)
    syllableWords: [
        {
            id: 'word-1',
            level: 1,
            fullWord: 'בָּלוֹן',
            meaning: 'Balloon',
            emoji: '🎈',
            syllables: ['בָּ', 'לוֹן'],
            distractors: ['מָ', 'לִי', 'תּוֹ'],
            hint: 'מרחף גבוה בשמיים ועשוי מגומי צבעוני!'
        },
        {
            id: 'word-2',
            level: 1,
            fullWord: 'כֶּלֶב',
            meaning: 'Dog',
            emoji: '🐶',
            syllables: ['כֶּ', 'לֶב'],
            distractors: ['גַּ', 'סוּ', 'מִי'],
            hint: 'החבר הכי טוב של האדם, נובח הב-הב!'
        },
        {
            id: 'word-3',
            level: 1,
            fullWord: 'שֶׁמֶשׁ',
            meaning: 'Sun',
            emoji: '☀️',
            syllables: ['שֶׁ', 'מֶשׁ'],
            distractors: ['כָּ', 'בּוֹ', 'רִי'],
            hint: 'מאירה ומחממת אותנו בכל בוקר בצהוב זוהר!'
        },
        {
            id: 'word-4',
            level: 1,
            fullWord: 'פַּרְפַּר',
            meaning: 'Butterfly',
            emoji: '🦋',
            syllables: ['פַּרְ', 'פַּר'],
            distractors: ['גַּל', 'תּוֹ', 'כָּ'],
            hint: 'בעל כנפיים צבעוניות שעף מפרח לפרח!'
        },
        {
            id: 'word-5',
            level: 2,
            fullWord: 'גְּלִידָה',
            meaning: 'Ice cream',
            emoji: '🍦',
            syllables: ['גְּ', 'לִי', 'דָה'],
            distractors: ['בָּ', 'סֵ', 'רוּ'],
            hint: 'קינוח מתוק וקר שאוכלים בקיץ בגביע!'
        },
        {
            id: 'word-6',
            level: 2,
            fullWord: 'תַּפּוּחַ',
            meaning: 'Apple',
            emoji: '🍎',
            syllables: ['תַּ', 'פּוּ', 'אַח'],
            distractors: ['שָׁ', 'מֵ', 'רוֹ'],
            hint: 'פרי עגול, מתוק או חמצמץ, באדום או ירוק!'
        },
        {
            id: 'word-7',
            level: 2,
            fullWord: 'רַכֶּבֶת',
            meaning: 'Train',
            emoji: '🚆',
            syllables: ['רַ', 'כֶּ', 'בֶת'],
            distractors: ['קָ', 'לִי', 'נָא'],
            hint: 'נוסעת על פסים ארוכים עם קטר וקרונות!'
        },
        {
            id: 'word-8',
            level: 1,
            fullWord: 'בַּיִת',
            meaning: 'House',
            emoji: '🏠',
            syllables: ['בַּ', 'יִת'],
            distractors: ['דוֹ', 'שִׁי', 'נֶ'],
            hint: 'המקום החם שבו אנחנו גרים עם המשפחה!'
        },
        {
            id: 'word-9',
            level: 2,
            fullWord: 'כּוֹכָב',
            meaning: 'Star',
            emoji: '⭐',
            syllables: ['כּוֹ', 'כָב'],
            distractors: ['מָ', 'תּוּ', 'לֶ'],
            hint: 'נוצץ בלילה בשמיים השחורים!'
        },
        {
            id: 'word-10',
            level: 2,
            fullWord: 'סִפְרִיָּה',
            meaning: 'Library',
            emoji: '📚',
            syllables: ['סִפְ', 'רִי', 'יָה'],
            distractors: ['בֵּ', 'גַּם', 'קָה'],
            hint: 'מקום קסום מלא במאות ספרים לקריאה!'
        },
        {
            id: 'word-11',
            level: 1,
            fullWord: 'דָּג',
            meaning: 'Fish',
            emoji: '🐟',
            syllables: ['דָּג'],
            distractors: ['סוּס', 'יָד', 'בָּר'],
            hint: 'שוחה במים ונושם בעזרת זימים!'
        },
        {
            id: 'word-12',
            level: 1,
            fullWord: 'עֵץ',
            meaning: 'Tree',
            emoji: '🌳',
            syllables: ['עֵץ'],
            distractors: ['הַר', 'כַּד', 'שָׁב'],
            hint: 'צומח באדמה עם גזע חום וענפים ירוקים!'
        }
    ],

    // 4. משחקון זיהוי קריאה מהיר - מילה ותמונה (Read & Match)
    readAndMatch: [
        {
            word: 'חָתוּל',
            options: [
                { emoji: '🐱', label: 'חָתוּל', correct: true },
                { emoji: '🐶', label: 'כֶּלֶב', correct: false },
                { emoji: '🐰', label: 'אַרְנָב', correct: false },
                { emoji: '🐭', label: 'עַכְבָּר', correct: false }
            ]
        },
        {
            word: 'סוּס',
            options: [
                { emoji: '🦁', label: 'אַרְיֵה', correct: false },
                { emoji: '🐴', label: 'סוּס', correct: true },
                { emoji: '🐮', label: 'פָּרָה', correct: false },
                { emoji: '🐑', label: 'כֶּבֶשׂ', correct: false }
            ]
        },
        {
            word: 'סֵפֶר',
            options: [
                { emoji: '✏️', label: 'עִפָּרוֹן', correct: false },
                { emoji: '🎨', label: 'צְבָעִים', correct: false },
                { emoji: '📖', label: 'סֵפֶר', correct: true },
                { emoji: '🎒', label: 'יַלְקוּט', correct: false }
            ]
        },
        {
            word: 'פֶּרַח',
            options: [
                { emoji: '🌸', label: 'פֶּרַח', correct: true },
                { emoji: '🍃', label: 'עָלֶה', correct: false },
                { emoji: '🍄', label: 'פִּטְרִיָּה', correct: false },
                { emoji: '🌵', label: 'צַבָּר', correct: false }
            ]
        },
        {
            word: 'סִירָה',
            options: [
                { emoji: '🚗', label: 'מְכוֹנִית', correct: false },
                { emoji: '⛵', label: 'סִירָה', correct: true },
                { emoji: '✈️', label: 'מָטוֹס', correct: false },
                { emoji: '🚲', label: 'אוֹפַנַּיִם', correct: false }
            ]
        },
        {
            word: 'שָׁעוֹן',
            options: [
                { emoji: '⏰', label: 'שָׁעוֹן', correct: true },
                { emoji: '💡', label: 'מְנוֹרָה', correct: false },
                { emoji: '🔑', label: 'מַפְתֵּחַ', correct: false },
                { emoji: '📱', label: 'טֶלֶפוֹן', correct: false }
            ]
        },
        {
            word: 'עוּגָה',
            options: [
                { emoji: '🍕', label: 'פִּיצָה', correct: false },
                { emoji: '🎂', label: 'עוּגָה', correct: true },
                { emoji: '🍎', label: 'תַּפּוּחַ', correct: false },
                { emoji: '🍞', label: 'לֶחֶם', correct: false }
            ]
        },
        {
            word: 'צָב',
            options: [
                { emoji: '🐸', label: 'צְפַרְדֵּעַ', correct: false },
                { emoji: '🐌', label: 'חִלָּזוֹן', correct: false },
                { emoji: '🐢', label: 'צָב', correct: true },
                { emoji: '🦀', label: 'סַרְטָן', correct: false }
            ]
        }
    ],

    // 5. סיפורים קצרים לקריאה מודרכת - חלוקה פדגוגית מדורגת לפי שלבי הניקוד
    stories: [
        {
            id: 'story-stage-1',
            stage: 'kamatz-patach',
            stageNum: 1,
            grade: 'שָׁלָב 1 • קָמָץ וּפַתָּח',
            vowelsTag: 'תְּנוּעַת A בִּלְבַד (אָ, אַ)',
            vowelsAllowed: 'אָ  אַ',
            color: '#FF5722',
            title: 'דָּן וְסַבָּא בַּגַּן',
            emoji: '👴',
            summary: 'קטע מיוחד לראשית קריאה: כל המילים בנויות אך ורק מתנועות קמץ ופתח!',
            sentences: [
                'דָּן קָם.',
                'סַבָּא בָּא לַגַּן.',
                'דָּן רָץ לְסַבָּא.',
                'סַבָּא נָתַן לְדָן יָד.',
                'דָּן שָׂמַח וְשָׂר: "חַג שָׂמַח, סַבָּא!"'
            ],
            quiz: {
                question: 'מִי בָּא לַגַּן עִם דָּן?',
                options: [
                    { text: 'סַבָּא', correct: true },
                    { text: 'חָתוּל', correct: false },
                    { text: 'דּוֹד', correct: false }
                ],
                explanation: 'נָכוֹן מְאוֹד! בַּמִּשְׁפָּט הַשֵּׁנִי כָּתוּב: "סַבָּא בָּא לַגַּן".'
            }
        },
        {
            id: 'story-stage-2',
            stage: 'chiriq',
            stageNum: 2,
            grade: 'שָׁלָב 2 • הוֹסָפַת חִירִיק',
            vowelsTag: 'קָמָץ-פַּתָּח + חִירִיק (אָ, אַ, אִי)',
            vowelsAllowed: 'אָ  אַ  אִי',
            color: '#0284C7',
            title: 'אִמָּא וְדִינָה שָׁרוֹת שִׁיר',
            emoji: '🎶',
            summary: 'לאחר שלמדנו חיריק: משפטים המשלבים קמץ, פתח ותנועת חיריק (אי).',
            sentences: [
                'אִמָּא קָמָה וְרָצָה לַגַּן.',
                'דִּינָה שָׁרָה: "אִמָּא, שִׁירִי לִי שִׁיר!"',
                'אִמָּא שָׁרָה שִׁיר עַל סִירָה בַּיָּם.',
                'דִּינָה שָׁמְעָה אֶת הַשִּׁיר וְשָׂמְחָה: "אִמָּא, שִׁיר נָעִים!"'
            ],
            quiz: {
                question: 'עַל מָה שָׁרָה אִמָּא בַּשִּׁיר?',
                options: [
                    { text: 'עַל סִירָה בַּיָּם', correct: true },
                    { text: 'עַל פִּיל בַּיַּעַר', correct: false },
                    { text: 'עַל מַטּוֹס בַּשָּׁמַיִם', correct: false }
                ],
                explanation: 'מְצוּיָן! אִמָּא שָׁרָה עַל סִירָה בַּיָּם.'
            }
        },
        {
            id: 'story-stage-3',
            stage: 'cholam',
            stageNum: 3,
            grade: 'שָׁלָב 3 • הוֹסָפַת חוֹלָם',
            vowelsTag: 'קָמָץ, חִירִיק + חוֹלָם (אוֹ)',
            vowelsAllowed: 'אָ  אִי  אוֹ',
            color: '#EA580C',
            title: 'יוֹסִי וְהַבָּלוֹן הָאָדֹם',
            emoji: '🎈',
            summary: 'הוספת תנועת חולם (או): מילים מוכרות כמו בלון, כוכב, שלום, תוף.',
            sentences: [
                'יוֹסִי מָצָא בָּלוֹן אָדֹם וְגָדוֹל.',
                'הַבָּלוֹן עָף גָּבוֹהַּ עַד לַכּוֹכָבִים.',
                'בָּא דּוֹד שָׁלוֹם וְנָתַן לְיוֹסִי תּוֹף.',
                'יוֹסִי נָקַשׁ עַל הַתּוֹף וְשָׂר: "שָׁלוֹם, שָׁלוֹם בָּלוֹן אָדֹם!"'
            ],
            quiz: {
                question: 'מָה נָתַן דּוֹד שָׁלוֹם לְיוֹסִי?',
                options: [
                    { text: 'תּוֹף לִנְקוֹשׁ בּוֹ', correct: true },
                    { text: 'סֵפֶר חָדָשׁ', correct: false },
                    { text: 'מְכוֹנִית קְטַנָּה', correct: false }
                ],
                explanation: 'נָכוֹן! דּוֹד שָׁלוֹם נָתַן לְיוֹסִי תּוֹף.'
            }
        },
        {
            id: 'story-stage-4',
            stage: 'shuruk',
            stageNum: 4,
            grade: 'שָׁלָב 4 • הוֹסָפַת שׁוּרוּק וְקֻבּוּץ',
            vowelsTag: 'קָמָץ, חִירִיק, חוֹלָם + שׁוּרוּק (אוּ)',
            vowelsAllowed: 'אָ  אִי  אוֹ  אוּ',
            color: '#7C3AED',
            title: 'הַחָתוּל וְהַכַּדּוּר שֶׁל גּוּר',
            emoji: '🐱',
            summary: 'הוספת תנועת שורוק וקובוץ (או): מילים כמו חתול, כדור, סוס, תפוז.',
            sentences: [
                'חָתוּל חוּם וְחָמוּד רָץ בַּחֲצַר הַלּוּל.',
                'הַחָתוּל מָצָא כַּדּוּר קָטָן וְגִלְגֵּל אוֹתוֹ לַסּוּס.',
                'הַסּוּס נָחַר וְאָמַר: "אֵיזֶה כַּדּוּר מָתוֹק!"',
                'הַחָתוּל, הַגּוּר וְהַסּוּס שִׂחֲקוּ יַחַד וְאָכְלוּ תַּפּוּז.'
            ],
            quiz: {
                question: 'אֵיזֶה פְּרִי מָתוֹק אָכְלוּ הַחַיּוֹת בַּסּוֹף?',
                options: [
                    { text: 'תַּפּוּז', correct: true },
                    { text: 'תַּפּוּחַ', correct: false },
                    { text: 'עֲנָבִים', correct: false }
                ],
                explanation: 'יוֹפִי! הֵם שִׂחֲקוּ יַחַד וְאָכְלוּ תַּפּוּז מָתוֹק.'
            }
        },
        {
            id: 'story-stage-5',
            stage: 'segol',
            stageNum: 5,
            grade: 'שָׁלָב 5 • הוֹסָפַת סֶגוֹל וְצֵירֵה',
            vowelsTag: 'כָּל הַתְּנוּעוֹת! (סֶגוֹל, צֵירֵה וּשְׁוָא)',
            vowelsAllowed: 'אָ  אִי  אוֹ  אוּ  אֶ  אֵ',
            color: '#059669',
            title: 'הַיֶּלֶד וְהַכֶּלֶב תַּחַת הָעֵץ',
            emoji: '🐶',
            summary: 'השלמת כל תנועות העברית עם סגול וצירה (אה): ילד, כלב, ספר, עץ, גשם.',
            sentences: [
                'יֶלֶד עִם סֵפֶר יָשַׁב תַּחַת עֵץ רַעֲנָן בַּגַּן.',
                'כֶּלֶב נֶחְמָד רָץ אֵלָיו מִבֵּין עַרְפִלֵּי הַבֹּקֶר.',
                'הַיֶּלֶד פָּתַח אֶת הַסֵּפֶר וְקָרָא לַכֶּלֶב סִפּוּר מְרַתֵּק.',
                'כַּאֲשֶׁר יָרַד גֶּשֶׁם קַל, פָּתְחוּ מִטְרִיָּה וְרָצוּ יַחַד הַבַּיְתָה.'
            ],
            quiz: {
                question: 'מָה עָשָׂה הַיֶּלֶד תַּחַת הָעֵץ?',
                options: [
                    { text: 'קָרָא סֵפֶר לַכֶּלֶב', correct: true },
                    { text: 'עָלָה עַל רַכֶּבֶת', correct: false },
                    { text: 'הָלַךְ לִישׁוֹן', correct: false }
                ],
                explanation: 'כָּל הַכָּבוֹד! הַיֶּלֶד יָשַׁב תַּחַת הָעֵץ וְקָרָא סֵפֶר לַכֶּלֶב.'
            }
        },
        {
            id: 'story-stage-6',
            stage: 'fluent',
            stageNum: 6,
            grade: 'שָׁלָב 6 • קְרִיאָה שׁוֹטֶפֶת לְכִתָּה ב׳',
            vowelsTag: 'קְרִיאָה חָפְשִׁית וְעֲשִׁירָה',
            vowelsAllowed: 'עִבְרִית שְׁלֵמָה 🌟',
            color: '#4F46E5',
            title: 'מַסָּע אַל הַיָּרֵחַ וְהַכּוֹכָבִים',
            emoji: '🚀',
            summary: 'סיפור הרפתקאות מרתק עם אוצר מילים עשיר, משפטים מורכבים והבנת הנקרא.',
            sentences: [
                'דָּנִי חָלַם שֶׁהוּא טָס בַּחֲלָלִית כְּסוּפָה אֶל מֶרְחֲבֵי הֶחָלָל הַגְּדוֹלִים.',
                'מִבַּעַד לַחַלּוֹן הָעֲנָק הִבְרִיקוּ מִילְיוֹנֵי כּוֹכָבִים זְהֻבִּים וּמַרְהִיבִים בְּיָפְיָם.',
                'כַּאֲשֶׁר נָחֲתָה הַחֲלָלִית עַל אַדְמַת הַיָּרֵחַ, דָּנִי רִחֵף בָּאֲוִיר בְּקַלּוּת וּבְשִׂמְחָה רַבָּה.',
                'בַּבֹּקֶר הִתְעוֹרֵר דָּנִי עִם חִיּוּךְ רָחָב וְהֵבִין: הַקְּרִיאָה הִיא הַכְּנָפַיִם שֶׁל הַדִּמְיוֹן!'
            ],
            quiz: {
                question: 'מָה הֵבִין דָּנִי כַּאֲשֶׁר הִתְעוֹרֵר בַּבֹּקֶר?',
                options: [
                    { text: 'שֶׁהַקְּרִיאָה הִיא הַכְּנָפַיִם שֶׁל הַדִּמְיוֹן', correct: true },
                    { text: 'שֶׁהוּא עֲדַיִן עַל הַיָּרֵחַ', correct: false },
                    { text: 'שֶׁהוּא שָׁכַח אֶת הַחֲלָלִית', correct: false }
                ],
                explanation: 'נִפְלָא מְאוֹד! דָּנִי הֵבִין שֶׁבְּעֶזְרַת קְרִיאָה הַדִּמְיוֹן יָכוֹל לָטוּס לְכָל מָקוֹם!'
            }
        }
    ],
                ],
                explanation: 'כָּל הַכָּבוֹד! בְּעֶזְרַת שִׁתּוּף פְּעֻלָּה וַחֲבֵרוּת הֵם שִׁחְרְרוּ אֶת הַצַּב.'
            }
        }
    ],

    // 6. אלבום מדבקות ופרסים (Sticker Album)
    stickers: [
        { id: 'stk-1', title: 'אוֹת רִאשׁוֹנָה!', desc: 'הִשְׁלַמְתָּ אֶת תַּרְגִּיל הָאוֹתִיּוֹת הָרִאשׁוֹן', icon: '🌟', starsNeeded: 5 },
        { id: 'stk-2', title: 'נְסִיךְ הַנִּיקּוּד', desc: 'לָמַדְתָּ לְזַהוֹת קָמָץ, פַּתָּח וְחִירִיק', icon: '👑', starsNeeded: 10 },
        { id: 'stk-3', title: 'בּוֹנֶה מִילִים', desc: 'הִרְכַּבְתָּ 3 מִילִים מֵהֲבָרוֹת', icon: '🧩', starsNeeded: 15 },
        { id: 'stk-4', title: 'פּוֹצֵץ הַבּוּעוֹת', desc: 'שִׂחַקְתָּ בְּמִשְׂחַק הַבּוּעוֹת הַמָּהִיר', icon: '🫧', starsNeeded: 20 },
        { id: 'stk-5', title: 'סַפְרָן צָעִיר', desc: 'קָרָאתָ סִפּוּר רִאשׁוֹן עַד הַסּוֹף', icon: '📖', starsNeeded: 30 },
        { id: 'stk-6', title: 'אַלּוּף הַקְּרִיאָה!', desc: 'צָבַרְתָּ 50 כּוֹכָבִים נוֹצְצִים', icon: '🏆', starsNeeded: 50 },
        { id: 'stk-7', title: 'חָבֵר שֶׁל הַחַיּוֹת', desc: 'זִהִיתָ אֶת כָּל שְׁמוֹת הַחַיּוֹת הַמְּנֻקָּדוֹת', icon: '🦁', starsNeeded: 65 },
        { id: 'stk-8', title: 'טַיָּס חָלָל', desc: 'סִיַּמְתָּ אֶת הַסִּפּוּר עַל הַמַּסָּע לַיָּרֵחַ', icon: '🚀', starsNeeded: 80 },
        { id: 'stk-9', title: 'מָאסְטֶר הַקְּרִיאָה', desc: 'הִשְׁלַמְתָּ אֶת כָּל הַפְּעִילֻיּוֹת בָּאַפְּלִיקַצְיָה!', icon: '🌈', starsNeeded: 100 }
    ],

    // 7. משפטי עידוד של ינשוף הקריאה
    encouragements: [
        'כָּל הַכָּבוֹד! אַתָּה קוֹרֵא כְּמוֹ אַלּוּף! 🌟',
        'נִפְלָא מְאוֹד! מַמָּשׁ גֵּאֶה בְּךָ! 👏',
        'יוֹפִי שֶׁל דִּיּוּק! הַקְּרִיאָה שֶׁלְּךָ מִשְׁתַּפֶּרֶת בְּכָל רֶגַע! 🎯',
        'וָאוּ! עוֹד צַעַד בַּמַּסָּע לִהְיוֹת סַפְרָן אֲמִתִּי! 📚',
        'אֵיזֶה יֹפִי! הָאוֹתִיּוֹת שְׂמֵחוֹת שֶׁאַתָּה קוֹרֵא אוֹתָן! ✨'
    ]
};

if (typeof module !== 'undefined') {
    module.exports = READING_DATA;
}
