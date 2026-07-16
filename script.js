function saveLanguage(language) {

localStorage.setItem("PZMC_language", language);

}



window.onload = function() {

let language = localStorage.getItem("PZMC_language");


if(language) {

let currentPage = window.location.pathname;


if(currentPage.endsWith("index.html") || currentPage === "/") {


if(language === "fa") {

window.location.href = "fa/index.html";

}


if(language === "en") {

window.location.href = "en/index.html";

}

}

}

}
