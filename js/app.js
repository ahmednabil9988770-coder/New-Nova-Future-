/* =========================================
   NOVA FUTURE - GLOBAL APP
========================================= */

console.log("Nova Future is running successfully!");


/* =========================================
   DEFAULT SETTINGS
========================================= */

const defaultColor = "#2563eb";
const defaultDarkColor = "#1d4ed8";
const defaultTheme = "light";


/* =========================================
   APPLY PLATFORM SETTINGS
========================================= */

function applyPlatformSettings() {

    const savedColor =
        localStorage.getItem("novaPrimaryColor")
        || defaultColor;

    const savedDarkColor =
        localStorage.getItem("novaPrimaryDarkColor")
        || defaultDarkColor;

    const savedTheme =
        localStorage.getItem("novaTheme")
        || defaultTheme;


    document.documentElement.style.setProperty(
        "--primary-color",
        savedColor
    );


    document.documentElement.style.setProperty(
        "--primary-dark",
        savedDarkColor
    );


    if (savedTheme === "dark") {

        document.body.classList.add("dark");

    } else {

        document.body.classList.remove("dark");

    }

}


/* =========================================
   START
========================================= */

applyPlatformSettings();
