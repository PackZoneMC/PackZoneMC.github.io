// PZMC Language System

function changeLanguage(language) {

    localStorage.setItem("PZMC_language", language);

    let path = window.location.pathname;

    if (language === "en") {
        path = path.replace("/fa/", "/en/");
    }

    if (language === "fa") {
        path = path.replace("/en/", "/fa/");
    }

    window.location.href = path;

}
