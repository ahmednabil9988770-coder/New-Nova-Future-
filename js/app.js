// ================================
// Nova Future - Global Settings
// ================================

(function () {
    const defaultColor = "#2563eb";
    const defaultDarkColor = "#1d4ed8";
    const defaultTheme = "light";

    const savedColor =
        localStorage.getItem("novaPrimaryColor") || defaultColor;

    const savedDarkColor =
        localStorage.getItem("novaPrimaryDarkColor") || defaultDarkColor;

    const savedTheme =
        localStorage.getItem("novaTheme") || defaultTheme;

    // تطبيق اللون الأساسي
    document.documentElement.style.setProperty(
        "--primary-color",
        savedColor
    );

    document.documentElement.style.setProperty(
        "--primary-dark",
        savedDarkColor
    );

    // تطبيق الوضع الليلي
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }
})();
