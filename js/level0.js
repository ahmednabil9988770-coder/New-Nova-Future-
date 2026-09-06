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
   NOVA FUTURE — LEVEL 0
   CLASSIFIED INVESTIGATION
========================================================= */

let currentUser = null;


/* =========================================================
   DOM
========================================================= */

const storySection =
    document.getElementById("level0Story");

const investigationSection =
    document.getElementById("level0Investigation");

const completeSection =
    document.getElementById("level0Complete");

const sceneNumber =
    document.getElementById("level0SceneNumber");

const storyIcon =
    document.getElementById("level0StoryIcon");

const storyTitle =
    document.getElementById("level0StoryTitle");

const storyText =
    document.getElementById("level0StoryText");

const nextButton =
    document.getElementById("level0NextBtn");

const clueCount =
    document.getElementById("level0ClueCount");

const puzzle =
    document.getElementById("level0Puzzle");

const investigationMessage =
    document.getElementById(
        "level0InvestigationMessage"
    );

const backButton =
    document.getElementById("level0BackBtn");


/* =========================================================
   STORY
========================================================= */

const scenes = [

    {
        icon: "🌙",
        title: "الساعة 11:47 مساءً",
        text:
            "كانت شخصية الطالب داخل Nova Future تستعد لإنهاء آخر مهمة في هذا اليوم..."
    },

    {
        icon: "⚡",
        title: "انطفأت الأنوار",
        text:
            "فجأة انطفأت جميع الأنوار. ساد الصمت المكان... ثم بدأت خطوات تقترب ببطء."
    },

    {
        icon: "📺",
        title: "الرسالة الغامضة",
        text:
            "ظهرت رسالة غريبة على الشاشة تقول: «لقد اخترت الشخص الخطأ.»"
    },

    {
        icon: "🚪",
        title: "الباب المغلق",
        text:
            "أُغلق الباب فجأة. ظهر عد تنازلي على الشاشة... 10... 9... 8..."
    },

    {
        icon: "💨",
        title: "الاختفاء",
        text:
            "وصل العد إلى الصفر... وفي لحظة واحدة اختفت الشخصية تمامًا."
    },

    {
        icon: "🔐",
        title: "الرمز",
        text:
            "على الأرض ظهرت قطعة صغيرة تحمل رمزًا غامضًا... لكن لا أحد يعرف ماذا يعني."
    },

    {
        icon: "👁️",
        title: "شخص ما يراقب",
        text:
            "ظهرت رسالة أخيرة: «إذا كنت تريد استعادتها... ابدأ بالبحث.»"
    },

    {
        icon: "🕵️",
        title: "بداية المطاردة",
        text:
            "من هذه اللحظة أصبحت أنت المحقق. أمامك ثلاث أماكن... وثلاثة أدلة."
    },

    {
        icon: "❓",
        title: "من خطف الشخصية؟",
        text:
            "قبل أن تبدأ التحقيق، تذكر جيدًا: كل دليل يمكن أن يقودك إلى الحقيقة."
    }

];


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
   SAVE
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

                    lastPlayed:
                        serverTimestamp()

                }
            },

            {
                merge: true
            }

        );

    } catch (error) {

        console.error(
            "LEVEL 0 SAVE ERROR:",
            error
        );

    }

}


/* =========================================================
   LOAD
========================================================= */

async function loadProgress() {

    if (!currentUser) {
        return;
    }

    try {

        const snapshot =
            await getDoc(
                doc(
                    db,
                    "users",
                    currentUser.uid
                )
            );

        if (!snapshot.exists()) {
            return;
        }

        const data =
            snapshot.data();

        if (data.level0) {

            progress = {

                ...progress,

                ...data.level0

            };

        }

    } catch (error) {

        console.error(
            "LEVEL 0 LOAD ERROR:",
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

    storySection.hidden = false;

    investigationSection.hidden = true;

    completeSection.hidden = true;


    sceneNumber.textContent =
        `LEVEL 0 • SCENE ${progress.currentScene + 1}/9`;

    storyIcon.textContent =
        scene.icon;

    storyTitle.textContent =
        scene.title;

    storyText.textContent =
        scene.text;


    if (
        progress.currentScene ===
        scenes.length - 1
    ) {

        nextButton.textContent =
            "🔎 ابدأ التحقيق";

    } else {

        nextButton.textContent =
            "التالي →";

    }

}


/* =========================================================
   NEXT SCENE
========================================================= */

nextButton.addEventListener(
    "click",
    async function () {

        if (
            progress.currentScene <
            scenes.length - 1
        ) {

            progress.currentScene++;

            await saveProgress();

            renderScene();

            return;

        }

        progress.investigationStarted =
            true;

        await saveProgress();

        startInvestigation();

    }
);


/* =========================================================
   INVESTIGATION
========================================================= */

const clueTexts = {

    dashboard:
        "وجدت في لوحة الطالب أثرًا غريبًا... الساعة تشير إلى 11:47.",

    library:
        "وجدت في المكتبة رسالة صغيرة تقول: البداية ليست حيث تعتقد.",

    terminal:
        "وجدت في المحطة السرية الرمز: NF-07"

};


function updateInvestigationUI() {

    clueCount.textContent =
        progress.cluesFound.length;


    document
        .querySelectorAll(
            ".level0-location"
        )
        .forEach(button => {

            const location =
                button.dataset.location;

            if (
                progress.locationsVisited
                    .includes(location)
            ) {

                button.disabled = true;

                button.classList.add(
                    "found"
                );

            }

        });


    if (
        progress.cluesFound.length >= 3
    ) {

        puzzle.hidden = false;

    }

}


/* =========================================================
   START INVESTIGATION
========================================================= */

function startInvestigation() {

    storySection.hidden = true;

    investigationSection.hidden = false;

    completeSection.hidden = true;

    updateInvestigationUI();

}


/* =========================================================
   LOCATION CLICK
========================================================= */

document
    .querySelectorAll(
        ".level0-location"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            async function () {

                const location =
                    this.dataset.location;


                if (
                    progress.locationsVisited
                        .includes(location)
                ) {

                    return;

                }


                progress.locationsVisited
                    .push(location);


                progress.cluesFound
                    .push(location);


                investigationMessage.textContent =
                    "🔎 " +
                    clueTexts[location];


                await saveProgress();

                updateInvestigationUI();

            }
        );

    });


/* =========================================================
   PUZZLE
========================================================= */

document
    .querySelectorAll(
        "#level0PuzzleOptions button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            async function () {

                const answer =
                    this.dataset.answer;


                if (
                    answer === "NF-07"
                ) {

                    if (
                        !progress.puzzlesSolved
                            .includes(
                                "firstPuzzle"
                            )
                    ) {

                        progress.puzzlesSolved
                            .push(
                                "firstPuzzle"
                            );

                        progress.finalScore +=
                            100;

                    }


                    progress.completed =
                        true;

                    progress.investigationCompleted =
                        true;


                    await saveProgress();

                    await giveReward();

                    showComplete();

                } else {

                    investigationMessage.textContent =
                        "❌ الرمز غير صحيح... ارجع للأدلة وحاول مرة أخرى.";

                }

            }
        );

    });


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


        const data =
            snapshot.exists()
                ? snapshot.data()
                : {};


        const badges =
            Array.isArray(data.badges)
                ? [...data.badges]
                : [];


        if (
            badges.includes(
                "novaInvestigator"
            )
        ) {

            return;

        }


        const oldXP =
            Number(data.xp || 0);


        const newXP =
            oldXP + 50;


        const newLevel =
            Math.floor(
                newXP / 100
            ) + 1;


        badges.push(
            "novaInvestigator"
        );


        await setDoc(

            userRef,

            {

                xp: newXP,

                level: newLevel,

                badges: badges,

                updatedAt:
                    serverTimestamp()

            },

            {
                merge: true
            }

        );

    } catch (error) {

        console.error(
            "LEVEL 0 REWARD ERROR:",
            error
        );

    }

}


/* =========================================================
   COMPLETE
========================================================= */

function showComplete() {

    storySection.hidden = true;

    investigationSection.hidden = true;

    completeSection.hidden = false;

}


/* =========================================================
   BACK
========================================================= */

if (backButton) {

    backButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "./student.html";

        }
    );

}


/* =========================================================
   AUTH
========================================================= */

onAuthStateChanged(
    auth,
    async function (user) {

        if (!user) {

            window.location.href =
                "./login.html";

            return;

        }


        currentUser = user;


        await loadProgress();


        if (
            progress.completed &&
            progress.investigationCompleted
        ) {

            showComplete();

            return;

        }


        if (
            progress.investigationStarted
        ) {

            startInvestigation();

            return;

        }


        renderScene();

    }
);
