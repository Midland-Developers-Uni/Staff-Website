//global variable should be updated to true whenever the user does anything on the site and false every time there actvity is checked
let userActive = true;

//Function to create event listeners for user activity
function setupActivityListeners(){
    const events = ["click", "mousemove", "keydown", "scroll"];
    events.forEach(event => {
        window.addEventListener(event, () => {
            userActive = true;
        })
    })
}

//Function to send a refresh token request
async function refreshToken() {
    try {
        const response = await fetch("/refresh-token", {
            method: "POST",
            credentials: "include"
        });
        if (!response.ok) {
            window.location.href = "index.html";
            return;
        }
    }
    catch (error) {
        console.error("Error refreshing token: " + error);
        window.location.href = "index.html";
    }
}

//Function to display and handle a popup warning the user they will be logged out
async function promptUserForRefreshWithCountdown(){
    const timeout = 60000; //1min in milliseconds
    return new Promise((resolve) => {

        //html items for popup
        const modal = document.getElementById("refreshModal");
        const countdownElem = document.getElementById("countdownTimer");
        const stayBtn = document.getElementById("stayLoggedInBtn");

        //Show popup
        modal.style.display = "flex"; 

        let remaining = Math.floor(timeout/1000);
        countdownElem.innerText = remaining + "s";

        //Countdown displaying time remaining till logout & logout if it reachs 0
        const intervalId = setInterval (() => {
            remaining--;
            countdownElem.innerText = remaining + "s";
            if (remaining <= 0) {
                clearInterval(intervalId);
                modal.style.display = "none";
                resolve(false);
            }
        }, 1000);

        //If button to stay is clicked stop countdown and return that the user is still present
        stayBtn.onclick = () => {
            clearInterval(intervalId);
            modal.style.display = "none";
            resolve(true);
        };
    });
}

//Check token every 9 minutes and attempt to refresh token
function startTokenRefreshChecker() {
    const checkInterval = 540000 //9mins in milliseconds
    setInterval(async () => {

        //Refresh token automatically if user has activity in last 9min
        if(userActive) {
            await refreshToken();
            userActive = false;
            return;
        }

        //If user has no activity give them a popup warning them they will be signed out
        //if they dont click otherwise
        else {
            const stillHere = await promptUserForRefreshWithCountdown();
            if (stillHere) {
                await refreshToken();
                userActive = false;
                return;
            }
            else {
                window.location.href = "index.html";
            }
        }
    }, checkInterval);
}

//Event listener to run on page launch
document.addEventListener("DOMContentLoaded", async () => {
    try {
        //Check token validity
        const response = await fetch ("/validate-token", {
            method: "GET",
            credentials: "include"
        });

        //Check for invalid/expired token
        if(!response.ok) {
            window.location.href = "index.html";
            return;
        }
    }
    
    //Any unexpected errors
    catch (error) {
        console.error("Error validating token: " + error);
        window.location.href = "index.html";
    }

    setupActivityListeners();
    startTokenRefreshChecker();
})