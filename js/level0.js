/* =========================================================
   NOVA FUTURE — LEVEL 0
   CLASSIFIED INVESTIGATION
========================================================= */

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


/* =========================================================
   ELEMENTS
========================================================= */

const storyScreen = document.getElementById("level0Story");
const investigationScreen = document.getElementById("level0Investigation");
const completeScreen = document.getElementById("level0Complete");

const sceneNumber = document.getElementById("level0SceneNumber");
const storyIcon = document.getElementById("level0StoryIcon");
const storyTitle = document.getElementById("level0StoryTitle");
const storyText = document.getElementById("level0StoryText");

const nextBtn = document.getElementById("level0NextBtn");
const backBtn = document.getElementById("level0BackBtn");

const clueCount = document.getElementById("level0ClueCount");
const puzzle = document.getElementById("level0Puzzle");
const investigationMessage =
    document.getElementById("level0InvestigationMessage");

const locationButtons =
    document.querySelectorAll(".level0-location");

const puzzleButtons =
    document.querySelectorAll(
        ".level0-puzzle-options button"
    );


/* =========================================================
   USER
========================================================= */

let currentUser = null;


/* =========================================================
   STORY
========================================================= */

const scenes = [

    {
        icon: "🌙",
        title: "الساعة 11:47 مساءً",
        text:
            "كانت شخصيتك داخل Nova Future تستعد لإنهاء آخر مهمة لها..."
    },

    {
        icon: "⚡",
        title: "انطفأت الأنوار",
        text:
            "فجأة انطفأت الأنوار. ساد الصمت... ثم ظهرت خطوات تقترب."
    },

    {
        icon: "📺",
        title: "الرسالة الغامضة",
        text:
            "اشتعلت إحدى الشاشات وظهرت رسالة غريبة: لقد اخترت الشخص الخطأ."
    },

    {
        icon: "🚪",
        title: "الباب المغلق",
        text:
            "أُغلق الباب فجأة، وظهر عد تنازلي على الشاشة."
    },

    {
        icon: "💨",
        title: "الاختفاء",
        text:
            "وصل العد إلى الصفر... وفي لحظة واحدة اختفت الشخصية."
    },

    {
        icon: "🔐",
        title: "الرمز",
        text:
            "وجدت على الأرض قطعة صغيرة تحمل رمزًا غامضًا."
    },

    {
        icon: "👁️",
        title: "شخص ما يراقب",
        text:
            "ظهرت رسالة جديدة: إذا كنت تريد استعادتها... ابدأ بالبحث."
    },

    {
        icon: "🕵️",
        title: "بداية المطاردة",
        text:
            "من هذه اللحظة أصبحت أنت المحقق. عليك جمع الأدلة."
    },

    {
        icon: "❓",
        title: "من خطف الشخصية؟",
        text:
            "وصلت إلى بداية التحقيق الحقيقي. ابحث عن الأدلة الثلاثة."
    }

];


/* =========================================================
   PROGRESS
========================================================= */

let progress = {

    started: true,

    currentScene: 0,

    cluesFound: [],

    puzzlesSolved: [],

    locationsVisited: [],

    completed: false,

    investigationStarted: false,

    finalScore: 0,

    investigationCompleted: false

};


/* =========================================================
   FIREBASE SAVE
========================================================= */

async function saveProgress() {

    if (!currentUser) {
        return;
    }

    try {

        await setDoc(
            doc(
                db,
                "users",
                currentUser.uid
            ),
            {
                level0: {
                    ...progress,
                    lastPlayed: serverTimestamp()
                }
            },
            {
                merge: true
            }
        );

    } catch (error) {

        console.error(
            "LEVEL 0 Firebase Save Error:",
            error
        );

    }

}


/* =========================================================
   LOAD FIREBASE
========================================================= */

async function loadProgress() {

    if (!currentUser) {
        return;
    }

    try {

        const userRef = doc(
            db,
            "users",
            currentUser.uid
        );

        const snapshot = await getDoc(userRef);

        if (
            snapshot.exists() &&
            snapshot.data().level0
        ) {

            progress = {
                ...progress,
                ...snapshot.data().level0
            };

        }

    } catch (error) {

        console.error(
            "LEVEL 0 Firebase Load Error:",
            error
        );

    }

}


/* =========================================================
   STORY RENDER
========================================================= */

function renderScene() {

    const scene =
        scenes[progress.currentScene];

    if (!scene) {
        startInvestigation();
        return;
    }

    sceneNumber.textContent =
        `LEVEL 0 • ${progress.currentScene + 1}/${scenes.length}`;

    storyIcon.textContent =
        scene.icon;

    storyTitle.textContent =
        scene.title;

    storyText.textContent =
        scene.text;

}


/* =========================================================
   NEXT STORY
========================================================= */

nextBtn.addEventListener(
    "click",
    async () => {

        if (
            progress.currentScene <
            scenes.length - 1
        ) {

            progress.currentScene++;

            await saveProgress();

            renderScene();

        } else {

            progress.investigationStarted = true;

            await saveProgress();

            startInvestigation();

        }

    }
);


/* =========================================================
   START INVESTIGATION
========================================================= */

function startInvestigation() {

    storyScreen.hidden = true;

    completeScreen.hidden = true;

    investigationScreen.hidden = false;

    updateInvestigation();

}


/* =========================================================
   UPDATE INVESTIGATION
========================================================= */

function updateInvestigation() {

    clueCount.textContent =
        progress.cluesFound.length;

    locationButtons.forEach(
        button => {

            const location =
                button.dataset.location;

            if (
                progress.locationsVisited
                    .includes(location)
            ) {

                button.disabled = true;

                button.style.opacity = "0.5";

            }

        }
    );

    if (
        progress.cluesFound.length >= 3
    ) {

        puzzle.hidden = false;

    }

}


/* =========================================================
   LOCATION CLUES
========================================================= */

const clues = {

    dashboard: {
        text: "وجدت دليلًا على لوحة الطالب: 11-47"
    },

    library: {
        text:
            "وجدت في المكتبة رسالة: البداية ليست حيث تعتقد."
    },

    terminal: {
        text:
            "وجدت في المحطة السرية الرمز: NF-07"
    }

};


locationButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            async () => {

                const location =
                    button.dataset.location;

                if (
                    progress.locationsVisited
                        .includes(location)
                ) {
                    return;
                }

                progress.locationsVisited.push(
                    location
                );

                if (
                    !progress.cluesFound
                        .includes(location)
                ) {

                    progress.cluesFound.push(
                        location
                    );

                }

                investigationMessage.textContent =
                    `🔎 ${clues[location].text}`;

                await saveProgress();

                updateInvestigation();

            }
        );

    }
);


/* =========================================================
   PUZZLE
========================================================= */

puzzleButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            async () => {

                const answer =
                    button.dataset.answer;

                if (
                    answer === "NF-07"
                ) {

                    if (
                        !progress.puzzlesSolved
                            .includes("firstPuzzle")
                    ) {

                        progress.puzzlesSolved.push(
                            "firstPuzzle"
                        );

                        progress.finalScore += 100;

                    }

                    progress.investigationCompleted =
                        true;

                    progress.completed =
                        true;

                    await saveProgress();

                    await giveReward();

                    showComplete();

                } else {

                    investigationMessage.textContent =
                        "❌ الرمز غير صحيح... حاول مرة أخرى.";

                }

            }
        );

    }
);


/* =========================================================
   REWARD
========================================================= */

async function giveReward() {

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

        const snapshot =
            await getDoc(userRef);

        const userData =
            snapshot.exists()
                ? snapshot.data()
                : {};

        let xp =
            Number(userData.xp || 0);

        const badges =
            Array.isArray(userData.badges)
                ? [...userData.badges]
                : [];

        /*
         * المكافأة مرة واحدة فقط
         */

        if (
            !badges.includes("novaInvestigator")
        ) {

            xp += 50;

            badges.push(
                "novaInvestigator"
            );

        }

        const level =
            Math.floor(xp / 100) + 1;

        await setDoc(
            userRef,
            {
                xp: xp,
                level: level,
                badges: badges,
                updatedAt: serverTimestamp()
            },
            {
                merge: true
            }
        );

    } catch (error) {

        console.error(
            "LEVEL 0 Reward Error:",
            error
        );

    }

}


/* =========================================================
   COMPLETE SCREEN
========================================================= */

function showComplete() {

    storyScreen.hidden = true;

    investigationScreen.hidden = true;

    completeScreen.hidden = false;

}


/* =========================================================
   BACK TO PLATFORM
========================================================= */

backBtn.addEventListener(
    "click",
    () => {

        window.location.href =
            "./student.html";

    }
);


/* =========================================================
   AUTH
========================================================= */

onAuthStateChanged(
    auth,
    async user => {

        currentUser = user;

        if (!user) {

            window.location.href =
                "./login.html";

            return;

        }

        await loadProgress();

        if (
            progress.completed &&
            progress.investigationCompleted
        ) {

            showComplete();

        } else if (
            progress.investigationStarted &&
            progress.currentScene >= scenes.length - 1
        ) {

            startInvestigation();

        } else {

            renderScene();

        }

    }
);
