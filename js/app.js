// ========================================
// Nova Future - Global Settings Manager
// ========================================

(function () {
"use strict";

/* ========================================
   Default Settings
======================================== */

const DEFAULT_SETTINGS = {
    primaryColor: "#2563eb",
    primaryDark: "#1d4ed8",
    theme: "light"
};


/* ========================================
   Storage Keys
======================================== */

const STORAGE_KEYS = {
    primaryColor: "novaPrimaryColor",
    primaryDark: "novaPrimaryDarkColor",
    theme: "novaTheme"
};


/* ========================================
   Get Saved Settings
======================================== */

function getSettings() {

    return {
        primaryColor:
            localStorage.getItem(
                STORAGE_KEYS.primaryColor
            ) ||
            DEFAULT_SETTINGS.primaryColor,

        primaryDark:
            localStorage.getItem(
                STORAGE_KEYS.primaryDark
            ) ||
            DEFAULT_SETTINGS.primaryDark,

        theme:
            localStorage.getItem(
                STORAGE_KEYS.theme
            ) ||
            DEFAULT_SETTINGS.theme
    };

}


/* ========================================
   Apply Theme
======================================== */

function applyTheme(theme) {

    const isDark =
        theme === "dark";

    document.body.classList.toggle(
        "dark",
        isDark
    );

}


/* ========================================
   Apply Colors
======================================== */

function applyColors(
    primaryColor,
    primaryDark
) {

    document.documentElement.style.setProperty(
        "--primary-color",
        primaryColor
    );

    document.documentElement.style.setProperty(
        "--primary-dark",
        primaryDark
    );

}


/* ========================================
   Apply All Settings
======================================== */

function applySettings() {

    const settings =
        getSettings();


    applyColors(
        settings.primaryColor,
        settings.primaryDark
    );


    applyTheme(
        settings.theme
    );

}


/* ========================================
   Reset Settings
======================================== */

function resetSettings() {

    localStorage.removeItem(
        STORAGE_KEYS.primaryColor
    );

    localStorage.removeItem(
        STORAGE_KEYS.primaryDark
    );

    localStorage.removeItem(
        STORAGE_KEYS.theme
    );


    applySettings();

}


/* ========================================
   Public API
   يمكن استخدامه من أي صفحة مستقبلًا
======================================== */

window.NovaSettings = {

    get: getSettings,

    apply: applySettings,

    reset: resetSettings,

    defaults: {
        ...DEFAULT_SETTINGS
    },

    keys: {
        ...STORAGE_KEYS
    }

};


/* ========================================
   Initial Load
======================================== */

applySettings();

})();
