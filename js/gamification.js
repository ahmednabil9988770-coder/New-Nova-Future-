/* =========================================================
   NOVA FUTURE - GAMIFICATION SYSTEM
   XP + LEVELS + CHARACTER EVOLUTION + BADGES + FIREBASE
========================================================= */

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
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
let currentStudent = null;


/* =========================================================
   HELPERS
========================================================= */

function getLevelFromXP(xp) {

    xp = Number(xp) || 0;

    return Math.floor(
        xp / XP_PER_LEVEL
    ) + 1;
}


function getCurrentLevelXP(xp) {

    xp = Number(xp) || 0;

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


function getCharacterEvolution(
    character,
    level
) {

    const list =
        CHARACTER_EVOLUTION[character] ||
        CHARACTER_EVOLUTION.chick;

    let evolution = list[0];

    for (const item of list) {

        if (
            Number(level) >=
            item.minLevel
        ) {
            evolution = item;
        }

    }

    return evolution;
}


/* =========================================================
   GAMIFICATION CSS
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
            margin: 25px 0;
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

        .nova-character-emoji {
            width: 70px;
            height: 70px;

            display: flex;

            align-items: center;
            justify-content: center;

            font-size: 42px;

            background:
                rgba(255,255,255,.06);

            border-radius: 20px;
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
                >
                    🐣
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

function updateGamificationUI(data = {}) {

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
            progress >= 100
                ? "جاهز للمستوى التالي! 🔥"
                : `${progress}% للمستوى التالي`;

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
            `المستوى ${level} • ${xp} XP<br>
             استمر في التعلم لتطور شخصيتك 🚀`;

    }

}


/* =========================================================
   LOAD GAMIFICATION
========================================================= */

async function loadGamification() {

    if (!currentUser || !db) {
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
            await getDoc(userRef);


        if (!userSnap.exists()) {
            return;
        }


        currentStudent =
            userSnap.data();


        const xp =
            Number(currentStudent.xp) || 0;


        const character =
            currentStudent.character === "lion"
                ? "lion"
                : "chick";


        if (
            typeof currentStudent.xp !== "number" ||
            !currentStudent.character
        ) {

            await setDoc(
                userRef,
                {
                    xp: xp,

                    level:
                        getLevelFromXP(xp),

                    character:
                        character,

                    updatedAt:
                        serverTimestamp()
                },
                {
                    merge: true
                }
            );

        }


        updateGamificationUI({
            xp: xp,
            character: character
        });


    } catch (error) {

        console.error(
            "Nova Future Gamification Load Error:",
            error
        );

    }

}


/* =========================================================
   SHOW MESSAGE
========================================================= */

function showGamificationMessage(
    message
) {

    const oldMessage =
        document.getElementById(
            "novaXPMessage"
        );


    if (oldMessage) {
        oldMessage.remove();
    }


    const element =
        document.createElement("div");


    element.id =
        "novaXPMessage";


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

        color:
            white;

        font-weight:
            700;

        font-size:
            14px;

        box-shadow:
            0 10px 30px
            rgba(0,0,0,.3);

    `;


    document.body.appendChild(
        element
    );


    setTimeout(() => {

        element.style.opacity =
            "0";

        element.style.transition =
            "opacity .4s ease";

    }, 2200);


    setTimeout(() => {

        element.remove();

    }, 2700);

}


/* =========================================================
   GET STUDENT BADGES
========================================================= */

async function getStudentBadges() {

    if (!currentUser || !db) {
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
            await getDoc(userRef);


        if (!snap.exists()) {
            return [];
        }


        const badges =
            snap.data().badges;


        return Array.isArray(badges)
            ? badges
            : [];


    } catch (error) {

        console.error(
            "Nova Future Get Badges Error:",
            error
        );

        return [];

    }

}


/* =========================================================
   BADGES CSS
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
                    minmax(120px, 1fr)
                );

            gap: 12px;
        }

        .nova-badge {
            padding: 15px 10px;

            text-align: center;

            border-radius: 18px;

            background:
                rgba(255,255,255,.06);

            border:
                1px solid
                rgba(255,255,255,.08);

            transition:
                .3s ease;
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


    /*
       لو القسم موجود بالفعل في student.html
       نستخدمه كما هو.
    */

    const existing =
        document.getElementById(
            "novaBadges"
        );


    if (existing) {
        return;
    }


    /*
       لو مش موجود، ننشئه تلقائيًا.
    */

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

        const gamification =
            document.getElementById(
                "novaGamification"
            );


        if (
            gamification &&
            gamification.parentNode
        ) {

            gamification.parentNode.insertBefore(
                section,
                gamification.nextSibling
            );

        } else {

            dashboard.appendChild(
                section
            );

        }

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

        console.warn(
            "Nova Future: novaBadgesGrid not found."
        );

        return;

    }


    const earned =
        await getStudentBadges();


    grid.innerHTML =
        Object.values(
            NOVA_BADGES
        )
        .map(badge => {

            const unlocked =
                earned.includes(
                    badge.id
                );


            return `

                <div class="
                    nova-badge
                    ${unlocked ? "" : "locked"}
                ">

                    <div
                        class="nova-badge-icon"
                    >
                        ${badge.icon}
                    </div>

                    <div
                        class="nova-badge-name"
                    >
                        ${badge.name}
                    </div>

                    <div
                        class="nova-badge-description"
                    >
                        ${badge.description}
                    </div>

                </div>

            `;

        })
        .join("");

}


/* =========================================================
   UNLOCK BADGE
========================================================= */

async function unlockBadge(
    badgeId
) {

    if (!currentUser || !db) {

        console.warn(
            "Nova Future: User not ready for badge."
        );

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

        console.warn(
            "Nova Future: Badge not found:",
            badgeId
        );

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


        if (!snap.exists()) {
            return false;
        }


        const data =
            snap.data();


        const badges =
            Array.isArray(data.badges)
                ? data.badges
                : [];


        if (
            badges.includes(
                badgeId
            )
        ) {

            return true;

        }


        await updateDoc(
            userRef,
            {
                badges: [
                    ...badges,
                    badgeId
                ],

                updatedAt:
                    serverTimestamp()
            }
        );


        console.log(
            "Nova Future: Badge unlocked:",
            badge.name
        );


        showGamificationMessage(
            `${badge.icon} حصلت على شارة "${badge.name}"!`
        );


        await updateBadgesUI();


        return true;


    } catch (error) {

        console.error(
            "Nova Future Badge Error:",
            error
        );

        return false;

    }

}


/* =========================================================
   LEVEL BADGES
========================================================= */

async function checkLevelBadges(
    level
) {

    if (
        Number(level) >= 5
    ) {

        await unlockBadge(
            "novaLegend"
        );

    }

}


/* =========================================================
   ADD XP
========================================================= */

async function addXP(
    amount,
    reason = "إنجاز"
) {

    if (!currentUser || !db) {

        console.warn(
            "Nova Future: User not ready."
        );

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


        const oldSnap =
            await getDoc(
                userRef
            );


        const oldData =
            oldSnap.exists()
                ? oldSnap.data()
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


        await updateDoc(
            userRef,
            {
                xp:
                    increment(amount),

                level:
                    newLevel,

                updatedAt:
                    serverTimestamp()
            }
        );


        currentStudent =
            currentStudent || {};


        currentStudent.xp =
            newXP;


        currentStudent.level =
            newLevel;


        currentStudent.character =
            currentStudent.character === "lion"
                ? "lion"
                : "chick";


        updateGamificationUI({
            xp:
                newXP,

            character:
                currentStudent.character
        });


        await checkLevelBadges(
            newLevel
        );


        if (
            newLevel > oldLevel
        ) {

            showGamificationMessage(
                `🎉 مبروك! وصلت للمستوى ${newLevel}!`
            );

        } else {

            showGamificationMessage(
                `+${amount} XP 🚀 — ${reason}`
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
    lessonId = "",
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

        console.log(
            "Nova Future: Lesson XP already awarded."
        );

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


    localStorage.setItem(
        key,
        "true"
    );


    await unlockBadge(
        "firstLesson"
    );


    const completedLessons =
        Object.keys(
            localStorage
        )
        .filter(
            key =>
                key.startsWith(
                    "nova_lesson_xp_"
                )
        )
        .length;


    if (
        completedLessons >= 5
    ) {

        await unlockBadge(
            "fiveLessons"
        );

    }


    await updateBadgesUI();


    return true;

}


/* =========================================================
   COMPLETE EXAM
========================================================= */

async function completeExam(
    examId = "",
    examTitle = "امتحان",
    percentage = 0
) {

    if (!examId) {
        return false;
    }


    const key =
        `nova_exam_xp_${examId}`;


    /*
       منع إعطاء XP لنفس الامتحان مرتين.
    */

    if (
        localStorage.getItem(
            key
        )
    ) {

        console.log(
            "Nova Future: Exam XP already awarded."
        );


        /*
           نتأكد من الشارات.
        */

        await unlockBadge(
            "firstExam"
        );


        if (
            Number(percentage) >= 90
        ) {

            await unlockBadge(
                "topScholar"
            );

        }


        await updateBadgesUI();


        return false;

    }


    /*
       +10 XP لإكمال الامتحان
    */

    const completed =
        await addXP(
            10,
            `إكمال الامتحان: ${examTitle}`
        );


    if (!completed) {
        return false;
    }


    /*
       أول امتحان
    */

    await unlockBadge(
        "firstExam"
    );


    /*
       النجاح 50% أو أكثر
    */

    if (
        Number(percentage) >= 50
    ) {

        await addXP(
            10,
            "النجاح في الامتحان"
        );

    }


    /*
       90% أو أكثر
    */

    if (
        Number(percentage) >= 90
    ) {

        await addXP(
            5,
            "درجة ممتازة ⭐"
        );


        await unlockBadge(
            "topScholar"
        );

    }


    /*
       تسجيل الامتحان
    */

    localStorage.setItem(
        key,
        "true"
    );


    await updateBadgesUI();


    return true;

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

    updateBadgesUI,

    checkLevelBadges

};


/* =========================================================
   FIREBASE AUTH
========================================================= */

onAuthStateChanged(
    auth,
    async user => {

        if (!user) {

            currentUser =
                null;

            return;

        }


        currentUser =
            user;


        await loadGamification();


        /*
           تحميل الشارات بعد التأكد
           أن المستخدم معروف.
        */

        try {

            await updateBadgesUI();

        } catch (error) {

            console.error(
                "Nova Future Badges Load Error:",
                error
            );

        }

    }
);


/* =========================================================
   INITIAL UI
========================================================= */

setTimeout(
    async () => {

        try {

            createGamificationUI();

            createBadgesUI();

            /*
               لو Firebase لسه بيحمّل المستخدم
               هيتعمل تحديث مرة أخرى بعد تسجيل الدخول.
            */

            if (currentUser) {

                await updateBadgesUI();

            }

        } catch (error) {

            console.error(
                "Nova Future Initial UI Error:",
                error
            );

        }

    },
    1000
);
