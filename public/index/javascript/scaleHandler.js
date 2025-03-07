function scaleContainer(){
    const mode = window.innerWidth > window.innerHeight ? "landscape" : "portrait";
    const scaleFactor = mode === "landscape" ? Math.min(window.innerWidth/1920, window.innerHeight/1080): Math.min(window.innerWidth/1080, window.innerHeight/1920);
    if (mode === "landscape") {
        document.documentElement.style.setProperty("--scale", scaleFactor);
        const backgroundImage = document.getElementById("backgroundImage");
        backgroundImage.style.width = (1920 * scaleFactor) + "px";
        backgroundImage.style.height = (1080 * scaleFactor) + "px";
        if (backgroundImage.offsetWidth < window.innerWidth) {
            backgroundImage.style.width = (1920*(scaleFactor*(window.innerWidth/backgroundImage.offsetWidth))) +"px";
            backgroundImage.style.height = (1080*(scaleFactor*(window.innerWidth/backgroundImage.offsetWidth))) +"px";
        }
        else if (backgroundImage.offsetHeight <= window.innerHeight) {
            backgroundImage.style.width = (1920*(scaleFactor*(window.innerHeight/backgroundImage.offsetHeight))) +"px";
            backgroundImage.style.height = (1080*(scaleFactor*(window.innerHeight/backgroundImage.offsetHeight))) +"px";
        }
    }
}
document.addEventListener("DOMContentLoaded", scaleContainer);
window.addEventListener("resize", scaleContainer);