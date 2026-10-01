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
// =========================
// Pack.mcmeta Builder
// =========================


let selectedIcon = "";


const iconInput = document.getElementById("packIconInput");


if(iconInput){

iconInput.addEventListener("change", function(){

    let file = this.files[0];

    if(file){

        selectedIcon = file;

        let reader = new FileReader();

        reader.onload = function(e){

            document.getElementById("packIconPreview").src = e.target.result;

            document.getElementById("previewIcon").src = e.target.result;

        }

        reader.readAsDataURL(file);

    }

});

}



// Pack Format Preview


const version = document.getElementById("minecraftVersion");


function updateMcmeta(){


if(!version) return;


let format = version.value;


let name = document.getElementById("packNameInput").value;


let description = document.getElementById("descriptionInput").value;



let json = {

    pack:{

        pack_format:Number(format),

        description:description || "PackZone MC"

    }

};



document.getElementById("jsonPreview").textContent =
JSON.stringify(json,null,2);



document.getElementById("previewName").textContent =
name || "نام پک";


document.getElementById("previewDescription").textContent =
description || "توضیحات پک";

}



if(version){

version.addEventListener("change",updateMcmeta);

}



let inputs = [

"packNameInput",

"descriptionInput"

];


inputs.forEach(function(id){


let element=document.getElementById(id);


if(element){

element.addEventListener("input",updateMcmeta);

}


});



// Toolbar


document.querySelectorAll(".text-tools button")
.forEach(function(button){


button.addEventListener("click",function(){


let code=this.dataset.code;


let textarea=this.parentElement.nextElementSibling;


if(textarea){


textarea.value += code;


textarea.focus();


updateMcmeta();


}



});


});
