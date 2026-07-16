function changeLanguage(language) {

    localStorage.setItem("PZMC_language", language);

    if (language === "fa") {
        window.location.href = "/fa/index.html";
    }

    if (language === "en") {
        window.location.href = "/en/index.html";
    }

}
