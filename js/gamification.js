/* =========================================================
   NOVA FUTURE - GAMIFICATION SYSTEM
   XP + LEVELS + CHARACTER EVOLUTION + BADGES
   INTERACTIVE CHARACTER + FIREBASE
========================================================= */

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    increment,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


/* =========================================================
   SETTINGS
========================================================= */

const XP_PER_LEVEL = 100;


/* =========================================================
   CHARACTER EVOLUTION
========================================================= */

const CHARACTER_EVOLUTION = {

    chick: [
        {
            minLevel: 1,
            emoji: "🐣",
            name: "الكتكوت"
        },
        {
            minLevel: 3,
            emoji: "🐥",
            name: "الكتكوت المتطور"
        },
        {
            minLevel: 5,
            emoji: "🐔",
            name: "الدجاجة المقاتلة"
        },
        {
            minLevel: 10,
            emoji: "🦅",
            name: "النسر"
        }
    ],

    lion: [
        {
            minLevel: 1,
            emoji: "🦁",
            name: "الأسد"
        },
        {
            minLevel: 3,
            emoji: "🦁⭐",
            name: "الأسد المقاتل"
        },
        {
            minLevel: 5,
            emoji: "🦁🔥",
            name: "الأسد الناري"
        },
        {
            minLevel: 10,
            emoji: "👑🦁",
            name: "ملك الأسود"
        }
    ]

};


/* =========================================================
   BADGES
========================================================= */

const NOVA_BADGES = {

    firstLesson: {
        id: "firstLesson",
        icon: "🔥",
        name: "شرارة البداية",
        description: "أكملت أول درس"
    },

    fiveLessons: {
        id: "fiveLessons",
        icon: "📚",
        name: "صانع المعرفة",
        description: "أكملت 5 دروس"
    },

    firstExam: {
        id: "firstExam",
        icon: "⚔️",
        name: "كاسر التحديات",
        description: "أكملت أول امتحان"
    },

    topScholar: {
        id: "topScholar",
        icon: "👑",
        name: "نجم النخبة",
        description: "حققت 90% أو أكثر في امتحان"
    },

    novaLegend: {
        id: "novaLegend",
        icon: "🌌",
        name: "أسطورة نوفا",
        description: "وصلت إلى المستوى 5"
    }

};


/* =========================================================
   CURRENT USER
========================================================= */

let currentUser = null;


/* =========================================================
   LEVEL FUNCTIONS
========================================================= */

function getLevelFromXP(xp) {

    xp =
        Number(xp) || 0;

    return Math.floor(
        xp / XP_PER_LEVEL
    ) + 1;

}


function getCurrentLevelXP(xp) {

    xp =
        Number(xp) || 0;

    return xp % XP_PER_LEVEL;

}


function getProgressPercent(xp) {

    const currentXP =
        getCurrentLevelXP(xp);

    return Math.min(
        100,
        Math.round(
            (currentXP / XP_PER_LEVEL) * 100
        )
    );

}


/* =========================================================
   CHARACTER EVOLUTION FUNCTION
========================================================= */

function getCharacterEvolution(
    character,
    level
) {

    const list =
        CHARACTER_EVOLUTION[character] ||
        CHARACTER_EVOLUTION.chick;

    let evolution =
        list[0];

    for (const item of list) {

        if (
            Number(level) >=
            item.minLevel
        ) {

            evolution =
                item;

        }

    }

    return evolution;

}


/* =========================================================
   GAMIFICATION STYLE
========================================================= */

function createGamificationStyle() {

    if (
        document.getElementById(
            "novaGamificationStyle"
        )
    ) {
        return;
    }

    const style =
        document.createElement("style");

    style.id =
        "novaGamificationStyle";

    style.textContent = `

        #novaGamification {
            width: 100%;
            margin: 20px 0;
        }

        .nova-gamification-card {
            background:
                linear-gradient(
                    135deg,
                    rgba(30,41,59,.95),
                    rgba(15,23,42,.98)
                );

            border:
                1px solid
                rgba(255,255,255,.08);

            border-radius: 24px;

            padding: 25px;

            box-shadow:
                0 15px 40px
                rgba(0,0,0,.25);
        }

        .nova-gamification-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 20px;
        }

        .nova-gamification-title {
            color: white;
            font-size: 20px;
            font-weight: 900;
        }

        .nova-character-name {
            margin-top: 6px;
            color: #94a3b8;
            font-size: 14px;
        }

        .nova-character-area {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .nova-character-emoji {
            width: 80px;
            min-height: 80px;

            display: flex;
            align-items: center;
            justify-content: center;

            border: none;
            background: rgba(255,255,255,.06);

            border-radius: 20px;

            font-size: 46px;
            line-height: 1;

            cursor: pointer;

            transition:
                transform .25s ease,
                box-shadow .25s ease;

            filter:
                drop-shadow(
                    0 8px 12px
                    rgba(0,0,0,.18)
                );

            animation:
                novaCharacterFloat
                2.5s
                ease-in-out
                infinite;
        }

        .nova-character-emoji:hover {
            transform: scale(1.08);
        }

        .nova-character-emoji:active {
            transform: scale(.85);
        }

        @keyframes novaCharacterFloat {

            0%, 100% {
                transform:
                    translateY(0)
                    rotate(0deg);
            }

            50% {
                transform:
                    translateY(-7px)
                    rotate(2deg);
            }

        }

        .nova-character-jump {
            animation:
                novaCharacterJump
                .7s
                ease !important;
        }

        @keyframes novaCharacterJump {

            0% {
                transform:
                    translateY(0)
                    scale(1);
            }

            30% {
                transform:
                    translateY(-28px)
                    scale(1.15);
            }

            60% {
                transform:
                    translateY(0)
                    scale(.95);
            }

            100% {
                transform:
                    translateY(0)
                    scale(1);
            }

        }

        .nova-character-bubble {
            max-width: 220px;

            padding:
                10px 14px;

            border-radius: 16px;

            background:
                rgba(255,255,255,.96);

            color: #222;

            font-size: 13px;
            font-weight: 800;

            text-align: center;

            box-shadow:
                0 6px 20px
                rgba(0,0,0,.15);

            animation:
                novaBubbleAppear
                .35s
                ease;
        }

        .nova-character-mood {
            color: #cbd5e1;
            font-size: 12px;
            font-weight: 700;
        }

        @keyframes novaBubbleAppear {

            from {
                opacity: 0;
                transform:
                    translateY(8px)
                    scale(.9);
            }

            to {
                opacity: 1;
                transform:
                    translateY(0)
                    scale(1);
            }

        }

        .nova-level-row {
            display: flex;
            justify-content: space-between;
            align-items: center;

            color: #cbd5e1;
            font-size: 14px;

            margin-bottom: 10px;
        }

        .nova-level-row strong {
            color: white;
            font-size: 20px;
            margin-right: 5px;
        }

        .nova-progress-container {
            width: 100%;
            height: 14px;

            overflow: hidden;

            background:
                rgba(255,255,255,.08);

            border-radius: 999px;
        }

        .nova-progress-bar {
            height: 100%;
            width: 0%;

            border-radius: 999px;

            background:
                linear-gradient(
                    90deg,
                    #22c55e,
                    #06b6d4,
                    #8b5cf6
                );

            transition:
                width .8s ease;
        }

        .nova-progress-text {
            margin-top: 8px;

            color: #94a3b8;

            font-size: 12px;

            text-align: center;
        }

        .nova-evolution-text {
            margin-top: 18px;

            padding: 12px;

            text-align: center;

            background:
                rgba(255,255,255,.05);

            border-radius: 14px;

            color: #e2e8f0;

            font-size: 14px;
        }


        /* =========================================
           LEVEL UP
        ========================================= */

        #novaLevelUpEffect,
        #novaEvolutionEffect {

            position: fixed;

            inset: 0;

            z-index: 99999;

            display: flex;

            align-items: center;
            justify-content: center;

            pointer-events: none;

            opacity: 0;

            background:
                rgba(0,0,0,.35);

            backdrop-filter:
                blur(5px);

            transition:
                opacity .4s ease;
        }

        #novaLevelUpEffect.nova-levelup-show,
        #novaEvolutionEffect.nova-evolution-show {
            opacity: 1;
        }

        .nova-levelup-box,
        .nova-evolution-box {

            width:
                min(90%, 370px);

            padding: 30px 22px;

            border-radius: 28px;

            text-align: center;

            background:
                rgba(20,20,30,.97);

            box-shadow:
                0 20px 60px
                rgba(0,0,0,.4);

            transform:
                scale(.7);

            animation:
                novaLevelUpBox
                .6s
                cubic-bezier(
                    .17,.67,.35,1.35
                )
                forwards;
        }

        @keyframes novaLevelUpBox {

            0% {
                transform:
                    scale(.7)
                    rotate(-3deg);
            }

            60% {
                transform:
                    scale(1.08)
                    rotate(2deg);
            }

            100% {
                transform:
                    scale(1)
                    rotate(0);
            }

        }

        .nova-levelup-stars,
        .nova-evolution-sparkles {

            font-size: 28px;

            margin-bottom: 10px;

            animation:
                novaStars
                1s
                ease-in-out
                infinite;
        }

        @keyframes novaStars {

            0%,100% {
                transform:
                    scale(1);
            }

            50% {
                transform:
                    scale(1.25);
            }

        }

        .nova-levelup-title {

            color: white;

            font-size: 36px;

            font-weight: 900;

            letter-spacing: 2px;

            margin-bottom: 8px;
        }

        .nova-levelup-level {

            color: #e2e8f0;

            font-size: 24px;

            font-weight: 800;

            margin-bottom: 10px;
        }

        .nova-levelup-subtitle {

            color: #cbd5e1;

            font-size: 15px;

            font-weight: 700;
        }

        .nova-evolution-emoji {

            font-size: 75px;

            margin-bottom: 12px;

            animation:
                novaEvolutionEmoji
                1s
                ease-in-out
                infinite;
        }

        @keyframes novaEvolutionEmoji {

            0%,100% {
                transform:
                    scale(1)
                    rotate(-3deg);
            }

            50% {
                transform:
                    scale(1.15)
                    rotate(3deg);
            }

        }

        .nova-evolution-title {

            color: white;

            font-size: 28px;

            font-weight: 900;

            margin-bottom: 8px;
        }

        .nova-evolution-name {

            color: #e2e8f0;

            font-size: 23px;

            font-weight: 800;

            margin-bottom: 8px;
        }

        .nova-evolution-text {

            color: #cbd5e1;

            font-size: 14px;

            font-weight: 700;
        }


        /* =========================================
           MOBILE
        ========================================= */

        @media (max-width: 600px) {

            .nova-gamification-card {
                padding: 18px;
            }

            .nova-character-emoji {
                width: 70px;
                min-height: 70px;
                font-size: 40px;
            }

            .nova-character-bubble {
                max-width: 180px;
                font-size: 12px;
            }

            .nova-levelup-title {
                font-size: 30px;
            }

            .nova-levelup-level {
                font-size: 21px;
            }

            .nova-evolution-title {
                font-size: 24px;
            }

        }

    `;

    document.head.appendChild(style);

}


/* =========================================================
   CREATE GAMIFICATION UI
========================================================= */

function createGamificationUI() {

    createGamificationStyle();

    if (
        document.getElementById(
            "novaGamification"
        )
    ) {
        return;
    }

    const section =
        document.createElement("section");

    section.id =
        "novaGamification";

    section.innerHTML = `

        <div class="nova-gamification-card">

            <div class="nova-gamification-header">

                <div>

                    <div class="nova-gamification-title">
                        🚀 رحلة التطور
                    </div>

                    <div
                        id="novaCharacterName"
                        class="nova-character-name"
                    >
                        جاري التحميل...
                    </div>

                </div>

                <div
                    id="novaCharacterEmoji"
                    class="nova-character-emoji"
                    role="button"
                    tabindex="0"
                >
                    🐣
                </div>

            </div>

            <div
                class="nova-character-area"
            >

                <div
                    id="novaCharacterBubble"
                    class="nova-character-bubble"
                >
                    جاهز نكمل الرحلة؟ 🚀
                </div>

                <div
                    id="novaCharacterMood"
                    class="nova-character-mood"
                >
                    🔥 متحمس
                </div>

            </div>

            <div class="nova-level-row">

                <div>
                    المستوى
                    <strong id="novaLevel">
                        1
                    </strong>
                </div>

                <div>

                    <span id="novaCurrentXP">
                        0
                    </span>

                    /

                    <span id="novaNextLevelXP">
                        100
                    </span>

                    XP

                </div>

            </div>

            <div class="nova-progress-container">

                <div
                    id="novaProgressBar"
                    class="nova-progress-bar"
                ></div>

            </div>

            <div
                id="novaProgressText"
                class="nova-progress-text"
            >
                0% للمستوى التالي
            </div>

            <div
                id="novaEvolutionText"
                class="nova-evolution-text"
            >
                ابدأ رحلتك 🚀
            </div>

        </div>

    `;

    const dashboard =
        document.getElementById(
            "dashboard"
        );

    if (dashboard) {

        dashboard.insertBefore(
            section,
            dashboard.firstElementChild
        );

    } else {

        document.body.prepend(
            section
        );

    }

}


/* =========================================================
   UPDATE GAMIFICATION UI
========================================================= */

function updateGamificationUI(
    data = {}
) {

    createGamificationUI();

    const xp =
        Number(data.xp) || 0;

    const level =
        getLevelFromXP(xp);

    const currentXP =
        getCurrentLevelXP(xp);

    const progress =
        getProgressPercent(xp);

    const character =
        data.character === "lion"
            ? "lion"
            : "chick";

    const evolution =
        getCharacterEvolution(
            character,
            level
        );

    const levelElement =
        document.getElementById(
            "novaLevel"
        );

    const currentXPElement =
        document.getElementById(
            "novaCurrentXP"
        );

    const nextLevelXPElement =
        document.getElementById(
            "novaNextLevelXP"
        );

    const progressBar =
        document.getElementById(
            "novaProgressBar"
        );

    const progressText =
        document.getElementById(
            "novaProgressText"
        );

    const characterEmoji =
        document.getElementById(
            "novaCharacterEmoji"
        );

    const characterName =
        document.getElementById(
            "novaCharacterName"
        );

    const evolutionText =
        document.getElementById(
            "novaEvolutionText"
        );


    /* =========================================
       UPDATE DATA
    ========================================= */

    if (levelElement) {
        levelElement.textContent =
            level;
    }

    if (currentXPElement) {
        currentXPElement.textContent =
            currentXP;
    }

    if (nextLevelXPElement) {
        nextLevelXPElement.textContent =
            XP_PER_LEVEL;
    }

    if (progressBar) {
        progressBar.style.width =
            `${progress}%`;
    }

    if (progressText) {
        progressText.textContent =
            `${progress}% للمستوى التالي`;
    }

    if (characterEmoji) {
        characterEmoji.textContent =
            evolution.emoji;
    }

    if (characterName) {
        characterName.textContent =
            evolution.name;
    }

    if (evolutionText) {

        evolutionText.innerHTML =
            `
            المستوى ${level}
            • ${xp} XP
            <br>
            ${evolution.name}
            🚀
            `;

    }


    /* =========================================
       LEVEL / EVOLUTION DETECTION
    ========================================= */

    const storedLevel =
        localStorage.getItem(
            "nova_last_level"
        );

    /*
       أول مرة:
       نحفظ المستوى الحالي فقط
       بدون إظهار احتفال.
    */

    if (storedLevel === null) {

        localStorage.setItem(
            "nova_last_level",
            String(level)
        );

        return;

    }

    const savedLevel =
        Number(storedLevel) || 1;


    if (level > savedLevel) {

        localStorage.setItem(
            "nova_last_level",
            String(level)
        );


        /* =====================================
           LEVEL UP MESSAGE
        ===================================== */

        const bubble =
            document.getElementById(
                "novaCharacterBubble"
            );

        const mood =
            document.getElementById(
                "novaCharacterMood"
            );

        if (bubble) {

            bubble.textContent =
                `🎉 LEVEL UP!
                 وصلت للمستوى ${level}! 🚀`;

        }

        if (mood) {

            mood.textContent =
                "👑 مستوى جديد!";

        }


        /* =====================================
           CHARACTER JUMP
        ===================================== */

        if (characterEmoji) {

            characterEmoji.classList.remove(
                "nova-character-jump"
            );

            void characterEmoji.offsetWidth;

            characterEmoji.classList.add(
                "nova-character-jump"
            );

        }


        /* =====================================
           LEVEL UP EFFECT
        ===================================== */

        createLevelUpEffect(
            level
        );


        /* =====================================
           EVOLUTION DETECTION
        ===================================== */

        const oldEvolution =
            getCharacterEvolution(
                character,
                savedLevel
            );

        const newEvolution =
            getCharacterEvolution(
                character,
                level
            );

        if (
            oldEvolution.minLevel !==
            newEvolution.minLevel
        ) {

            setTimeout(() => {

                createEvolutionEffect(
                    newEvolution
                );

            }, 700);

        }

    }

}


/* =========================================================
   LEVEL UP EFFECT
========================================================= */

function createLevelUpEffect(
    level
) {

    const oldEffect =
        document.getElementById(
            "novaLevelUpEffect"
        );

    if (oldEffect) {
        oldEffect.remove();
    }

    const effect =
        document.createElement("div");

    effect.id =
        "novaLevelUpEffect";

    effect.innerHTML = `

        <div class="nova-levelup-box">

            <div class="nova-levelup-stars">
                ✨ ⭐ ✨
            </div>

            <div class="nova-levelup-title">
                LEVEL UP!
            </div>

            <div class="nova-levelup-level">
                المستوى ${level} 🚀
            </div>

            <div class="nova-levelup-subtitle">
                شخصيتك أصبحت أقوى! 🔥
            </div>

        </div>

    `;

    document.body.appendChild(
        effect
    );

    setTimeout(() => {

        effect.classList.add(
            "nova-levelup-show"
        );

    }, 50);

    setTimeout(() => {

        effect.classList.remove(
            "nova-levelup-show"
        );

        setTimeout(() => {

            effect.remove();

        }, 400);

    }, 3000);

}


/* =========================================================
   EVOLUTION EFFECT
========================================================= */

function createEvolutionEffect(
    evolution
) {

    const oldEffect =
        document.getElementById(
            "novaEvolutionEffect"
        );

    if (oldEffect) {
        oldEffect.remove();
    }

    const effect =
        document.createElement("div");

    effect.id =
        "novaEvolutionEffect";

    effect.innerHTML = `

        <div class="nova-evolution-box">

            <div class="nova-evolution-sparkles">
                ✨ ⭐ ✨
            </div>

            <div class="nova-evolution-emoji">
                ${evolution.emoji}
            </div>

            <div class="nova-evolution-title">
                🎉 تطورت شخصيتك!
            </div>

            <div class="nova-evolution-name">
                ${evolution.name}
            </div>

            <div class="nova-evolution-text">
                أصبحت أقوى! 🚀
            </div>

        </div>

    `;

    document.body.appendChild(
        effect
    );

    setTimeout(() => {

        effect.classList.add(
            "nova-evolution-show"
        );

    }, 50);

    setTimeout(() => {

        effect.classList.remove(
            "nova-evolution-show"
        );

        setTimeout(() => {

            effect.remove();

        }, 400);

    }, 3500);

}


/* =========================================================
   LOAD GAMIFICATION FROM FIREBASE
========================================================= */

async function loadGamification() {

    if (!currentUser) {
        return;
    }

    try {

        const userRef =
            doc(
                db,
                "users",
                currentUser.uid
            );

        const userSnap =
            await getDoc(
                userRef
            );

        if (!userSnap.exists()) {

            console.warn(
                "Nova Future: User document not found."
            );

            return;

        }

        const data =
            userSnap.data();

        const xp =
            Number(data.xp) || 0;

        const character =
            data.character === "lion"
                ? "lion"
                : "chick";

        console.log(
            "Nova Future Gamification:",
            {
                xp,
                character,
                level:
                    getLevelFromXP(xp)
            }
        );

        updateGamificationUI({
            xp,
            character
        });

    } catch (error) {

        console.error(
            "Nova Future Gamification Error:",
            error
        );

    }

}


/* =========================================================
   GET BADGES
========================================================= */

async function getStudentBadges() {

    if (!currentUser) {
        return [];
    }

    try {

        const userRef =
            doc(
                db,
                "users",
                currentUser.uid
            );

        const snap =
            await getDoc(
                userRef
            );

        if (!snap.exists()) {
            return [];
        }

        const badges =
            snap.data().badges;

        return Array.isArray(
            badges
        )
            ? badges
            : [];

    } catch (error) {

        console.error(
            "Nova Future Badges Error:",
            error
        );

        return [];

    }

}


/* =========================================================
   BADGES STYLE
========================================================= */

function createBadgesStyle() {

    if (
        document.getElementById(
            "novaBadgesStyle"
        )
    ) {
        return;
    }

    const style =
        document.createElement("style");

    style.id =
        "novaBadgesStyle";

    style.textContent = `

        #novaBadges {
            width: 100%;
            margin: 20px 0;
        }

        .nova-badges-card {

            background:
                linear-gradient(
                    135deg,
                    rgba(30,41,59,.95),
                    rgba(15,23,42,.98)
                );

            border:
                1px solid
                rgba(255,255,255,.08);

            border-radius: 24px;

            padding: 25px;
        }

        .nova-badges-title {

            color: white;

            font-size: 20px;

            font-weight: 900;

            margin-bottom: 18px;
        }

        .nova-badges-grid {

            display: grid;

            grid-template-columns:
                repeat(
                    auto-fit,
                    minmax(120px,1fr)
                );

            gap: 12px;
        }

        .nova-badge {

            padding:
                15px 10px;

            text-align: center;

            border-radius: 18px;

            background:
                rgba(255,255,255,.06);

            border:
                1px solid
                rgba(255,255,255,.08);

            transition:
                transform .2s ease,
                opacity .2s ease;
        }

        .nova-badge:not(.locked):hover {

            transform:
                translateY(-4px);

        }

        .nova-badge.locked {

            opacity: .35;

            filter:
                grayscale(1);
        }

        .nova-badge-icon {

            font-size: 35px;

            margin-bottom: 8px;
        }

        .nova-badge-name {

            color: white;

            font-size: 13px;

            font-weight: 800;
        }

        .nova-badge-description {

            color: #94a3b8;

            font-size: 10px;

            margin-top: 5px;
        }

    `;

    document.head.appendChild(
        style
    );

}


/* =========================================================
   CREATE BADGES UI
========================================================= */

function createBadgesUI() {

    createBadgesStyle();

    if (
        document.getElementById(
            "novaBadges"
        )
    ) {
        return;
    }

    const section =
        document.createElement("section");

    section.id =
        "novaBadges";

    section.innerHTML = `

        <div class="nova-badges-card">

            <div class="nova-badges-title">
                🏆 إنجازاتك
            </div>

            <div
                id="novaBadgesGrid"
                class="nova-badges-grid"
            >
                جاري تحميل الشارات...
            </div>

        </div>

    `;

    const dashboard =
        document.getElementById(
            "dashboard"
        );

    if (dashboard) {

        dashboard.appendChild(
            section
        );

    } else {

        document.body.appendChild(
            section
        );

    }

}


/* =========================================================
   UPDATE BADGES UI
========================================================= */

async function updateBadgesUI() {

    createBadgesUI();

    const grid =
        document.getElementById(
            "novaBadgesGrid"
        );

    if (!grid) {
        return;
    }

    const earned =
        await getStudentBadges();

    grid.innerHTML =
        Object.values(
            NOVA_BADGES
        )
        .map(
            badge => {

                const unlocked =
                    earned.includes(
                        badge.id
                    );

                return `

                    <div class="
                        nova-badge
                        ${unlocked ? "" : "locked"}
                    ">

                        <div class="nova-badge-icon">
                            ${badge.icon}
                        </div>

                        <div class="nova-badge-name">
                            ${badge.name}
                        </div>

                        <div class="nova-badge-description">
                            ${badge.description}
                        </div>

                    </div>

                `;

            }
        )
        .join("");

}


/* =========================================================
   XP MESSAGE
========================================================= */

function showGamificationMessage(
    message
) {

    const element =
        document.createElement(
            "div"
        );

    element.textContent =
        message;

    element.style.cssText = `

        position: fixed;

        left: 50%;

        bottom: 30px;

        transform:
            translateX(-50%);

        z-index: 99999;

        padding:
            14px 22px;

        border-radius:
            999px;

        background:
            rgba(15,23,42,.96);

        color: white;

        font-weight: 700;

        font-size: 14px;

        max-width: 90%;

        text-align: center;

    `;

    document.body.appendChild(
        element
    );

    setTimeout(() => {

        element.remove();

    }, 2700);

}


/* =========================================================
   UNLOCK BADGE
========================================================= */

async function unlockBadge(
    badgeId
) {

    if (!currentUser) {
        return false;
    }

    const badge =
        Object.values(
            NOVA_BADGES
        )
        .find(
            item =>
                item.id === badgeId
        );

    if (!badge) {
        return false;
    }

    try {

        const userRef =
            doc(
                db,
                "users",
                currentUser.uid
            );

        const snap =
            await getDoc(
                userRef
            );

        const data =
            snap.exists()
                ? snap.data()
                : {};

        const badges =
            Array.isArray(
                data.badges
            )
                ? data.badges
                : [];

        if (
            badges.includes(
                badgeId
            )
        ) {
            return true;
        }

        await setDoc(
            userRef,
            {
                badges: [
                    ...badges,
                    badgeId
                ],

                updatedAt:
                    serverTimestamp()
            },
            {
                merge: true
            }
        );

        showGamificationMessage(
            `${badge.icon} حصلت على شارة "${badge.name}"!`
        );

        await updateBadgesUI();

        /* =====================================
           CHARACTER BADGE REACTION
        ===================================== */

        const bubble =
            document.getElementById(
                "novaCharacterBubble"
            );

        const mood =
            document.getElementById(
                "novaCharacterMood"
            );

        const character =
            document.getElementById(
                "novaCharacterEmoji"
            );

        if (bubble) {

            bubble.textContent =
                `${badge.icon} حصلت على ${badge.name}! 🎉`;

        }

        if (mood) {

            mood.textContent =
                "🏆 فخور بيك!";

        }

        if (character) {

            character.classList.remove(
                "nova-character-jump"
            );

            void character.offsetWidth;

            character.classList.add(
                "nova-character-jump"
            );

        }

        return true;

    } catch (error) {

        console.error(
            "Nova Future Unlock Badge Error:",
            error
        );

        return false;

    }

}


/* =========================================================
   ADD XP
========================================================= */

async function addXP(
    amount,
    reason = "إنجاز"
) {

    if (!currentUser) {
        return null;
    }

    amount =
        Number(amount) || 0;

    if (amount <= 0) {
        return null;
    }

    try {

        const userRef =
            doc(
                db,
                "users",
                currentUser.uid
            );

        const snap =
            await getDoc(
                userRef
            );

        const oldData =
            snap.exists()
                ? snap.data()
                : {};

        const oldXP =
            Number(oldData.xp) || 0;

        const oldLevel =
            getLevelFromXP(
                oldXP
            );

        const newXP =
            oldXP + amount;

        const newLevel =
            getLevelFromXP(
                newXP
            );

        await setDoc(
            userRef,
            {
                xp:
                    increment(amount),

                level:
                    newLevel,

                updatedAt:
                    serverTimestamp()
            },
            {
                merge: true
            }
        );


        updateGamificationUI({

            xp:
                newXP,

            character:
                oldData.character === "lion"
                    ? "lion"
                    : "chick"

        });


        showGamificationMessage(
            `+${amount} XP 🚀 — ${reason}`
        );


        /* =====================================
           LEVEL 5 BADGE
        ===================================== */

        if (
            newLevel >= 5 &&
            oldLevel < 5
        ) {

            await unlockBadge(
                "novaLegend"
            );

        }


        return {

            xp:
                newXP,

            level:
                newLevel,

            gained:
                amount

        };

    } catch (error) {

        console.error(
            "Nova Future Add XP Error:",
            error
        );

        return null;

    }

}


/* =========================================================
   COMPLETE LESSON
========================================================= */

async function completeLesson(
    lessonId,
    lessonTitle = "درس"
) {

    if (!lessonId) {
        return false;
    }

    const key =
        `nova_lesson_xp_${lessonId}`;

    if (
        localStorage.getItem(
            key
        )
    ) {

        return false;

    }


    const result =
        await addXP(
            10,
            `إكمال الدرس: ${lessonTitle}`
        );

    if (!result) {
        return false;
    }


    /* =========================================
       CHARACTER REACTION
    ========================================= */

    const character =
        document.getElementById(
            "novaCharacterEmoji"
        );

    const bubble =
        document.getElementById(
            "novaCharacterBubble"
        );

    const mood =
        document.getElementById(
            "novaCharacterMood"
        );


    if (
        character &&
        bubble &&
        mood
    ) {

        bubble.textContent =
            `أحسنت! خلصت ${lessonTitle} 🔥 +10 XP`;

        mood.textContent =
            "🏆 فخور بيك";


        character.classList.remove(
            "nova-character-jump"
        );

        void character.offsetWidth;

        character.classList.add(
            "nova-character-jump"
        );

    }


    localStorage.setItem(
        key,
        "true"
    );


    await unlockBadge(
        "firstLesson"
    );


    const lessons =
        Object.keys(
            localStorage
        )
        .filter(
            key =>
                key.startsWith(
                    "nova_lesson_xp_"
                )
        );


    if (
        lessons.length >= 5
    ) {

        await unlockBadge(
            "fiveLessons"
        );

    }


    return true;

}


/* =========================================================
   COMPLETE EXAM
========================================================= */

async function completeExam(
    examId,
    examTitle = "امتحان",
    percentage = 0
) {

    if (!examId) {
        return false;
    }

    const key =
        `nova_exam_xp_${examId}`;

    if (
        localStorage.getItem(
            key
        )
    ) {

        return false;

    }


    const score =
        Number(percentage) || 0;


    const completed =
        await addXP(
            10,
            `إكمال الامتحان: ${examTitle}`
        );

    if (!completed) {
        return false;
    }


    /* =========================================
       CHARACTER REACTION
    ========================================= */

    const character =
        document.getElementById(
            "novaCharacterEmoji"
        );

    const bubble =
        document.getElementById(
            "novaCharacterBubble"
        );

    const mood =
        document.getElementById(
            "novaCharacterMood"
        );


    function characterReact(
        message,
        moodText
    ) {

        if (
            !character ||
            !bubble ||
            !mood
        ) {
            return;
        }


        bubble.textContent =
            message;

        mood.textContent =
            moodText;


        character.classList.remove(
            "nova-character-jump"
        );

        void character.offsetWidth;

        character.classList.add(
            "nova-character-jump"
        );

    }


    /* =========================================
       FIRST EXAM
    ========================================= */

    await unlockBadge(
        "firstExam"
    );


    /* =========================================
       PASS
    ========================================= */

    if (
        score >= 50
    ) {

        await addXP(
            10,
            "النجاح في الامتحان"
        );

        characterReact(
            `برافو! نجحت في ${examTitle} 🎉 +10 XP`,
            "💪 فخور بيك"
        );

    } else {

        characterReact(
            "متستسلمش! حاول تاني 💪",
            "🔥 متحمس ليك"
        );

    }


    /* =========================================
       90%+
    ========================================= */

    if (
        score >= 90
    ) {

        await addXP(
            5,
            "درجة ممتازة ⭐"
        );

        await unlockBadge(
            "topScholar"
        );

        characterReact(
            `واو! ${score}% 👑 أنت من النخبة!`,
            "🏆 فخور بيك جدًا"
        );

    }


    localStorage.setItem(
        key,
        "true"
    );


    return true;

}


/* =========================================================
   NOVA CHARACTER 2.0
========================================================= */

function initNovaCharacter() {

    const character =
        document.getElementById(
            "novaCharacterEmoji"
        );

    const bubble =
        document.getElementById(
            "novaCharacterBubble"
        );

    const mood =
        document.getElementById(
            "novaCharacterMood"
        );


    if (
        !character ||
        !bubble ||
        !mood
    ) {

        console.warn(
            "Nova Character: UI not found."
        );

        return;

    }


    const messages = [

        "جاهز نكمل الرحلة؟ 🚀",

        "يلا يا بطل، مستقبلك مستنيك! 🔥",

        "مستوى جديد قريب جدًا 👀",

        "أنا واثق إنك تقدر! 💪",

        "ركز شوية وهتكسر الامتحان! ⚔️",

        "كل درس بتخلصه بيقربك من هدفك! 📚",

        "استمر... أنت بتتطور! ⚡",

        "Nova Future معاك في كل خطوة 🌌"

    ];


    const moods = [

        "🔥 متحمس",

        "💪 جاهز للتحدي",

        "🚀 في وضع التطور",

        "🏆 فخور بيك"

    ];


    function interact() {

        const randomMessage =
            messages[
                Math.floor(
                    Math.random() *
                    messages.length
                )
            ];

        const randomMood =
            moods[
                Math.floor(
                    Math.random() *
                    moods.length
                )
            ];


        bubble.textContent =
            randomMessage;

        mood.textContent =
            randomMood;


        character.classList.remove(
            "nova-character-jump"
        );

        void character.offsetWidth;

        character.classList.add(
            "nova-character-jump"
        );

    }


    character.addEventListener(
        "click",
        interact
    );


    character.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                interact();

            }

        }
    );


    setTimeout(
        () => {

            interact();

        },
        1200
    );


    console.log(
        "Nova Character 2.0 initialized."
    );

}


/* =========================================================
   GLOBAL API
========================================================= */

window.NovaGamification = {

    addXP,

    loadGamification,

    getLevelFromXP,

    getProgressPercent,

    getCharacterEvolution,

    completeExam,

    completeLesson,

    unlockBadge,

    getStudentBadges,

    updateBadgesUI

};


/* =========================================================
   START UI
========================================================= */

createGamificationUI();

createBadgesUI();

initNovaCharacter();


/* =========================================================
   AUTH
========================================================= */

onAuthStateChanged(
    auth,
    async user => {

        if (!user) {

            currentUser = null;

            return;

        }


        currentUser =
            user;


        await loadGamification();

        await updateBadgesUI();

    }
);
