function saveLanguage(language) {
    localStorage.setItem("PZMC_language", language);
}


window.onload = function() {

    let language = localStorage.getItem("PZMC_language");
    let path = window.location.pathname;


    // فقط در صفحه اصلی ریدایرکت کن
    if (path === "/" || path.endsWith("PackZoneMC.github.io/")) {

        if (language === "fa") {
            window.location.href = "/fa/index.html";
        }

        if (language === "en") {
            window.location.href = "/en/index.html";
        }

    }

}
