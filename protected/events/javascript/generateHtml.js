function updateSwitchButtons() {
    //If viewing event provide options to add event & edit event
    if (sessionStorage.getItem("eventMode") === "view") {
        document.getElementById("switchButtons").innerHTML = `
            <button onclick = "switchEditEvent()">Switch to Edit</button>
            <button onclick = "switchAddEvent()">Add new Event</button>
        `;
    }
    //If editing event provide options to add event & view event
    else if (sessionStorage.getItem("eventMode") === "edit") {
        document.getElementById("switchButtons").innerHTML = `
            <button onclick = "switchViewEvent()">Switch to View</button>
            <button onclick = "switchAddEvent()">Add new Event</button>
        `;
    }
    //If adding event or invalid "eventMode" show no buttons
    else {
        document.getElementById("switchButtons").innerHTML = ``;
    }
}

function switchEditEvent() {
    sessionStorage.setItem("eventMode", "edit");
    loadEvent();
}
function switchViewEvent() {
    sessionStorage.setItem("eventMode", "view");
    loadEvent();
}
function switchAddEvent() {
    sessionStorage.setItem("eventMode", "add");
    sessionStorage.removeItem("eventID");
    loadEvent();
}

async function loadEvent(){
    updateSwitchButtons();
    const mode = sessionStorage.getItem("eventMode");
    const eventID = sessionStorage.getItem("eventID");

    //Fetch staff & subjects from db
    const subjectsResponse = await fetch("/getSubjects", {
        credentials: "include"
    });
    var availableSubjects = [];
    if (subjectsResponse.ok) {
        const subjectsData = await subjectsResponse.json();
        availableSubjects = subjectsData.map(s => s.subjectCode);
    }

    const staffResponse = await fetch("/getStaff", {
        credentials: "include"
    });
    var avaliableStaff = [];
    if (staffResponse.ok) {
        const staffData = await staffResponse.json();
        avaliableStaff = staffData.map(s => s.email);
    }

    const eventSection = document.getElementById("event");
    eventData = {
        eventID: "",
        eventName: "",
        location: "",
        detailsShort: "",
        detailsLong: "",
        staffAssigned: [],
        studentsSignedUp: "",
        totalSpaces: "",
        releventSubjects: [],
        startTime: Date.now(),
        endTime: ""
    };
    eventData.endTime = eventData.startTime;
    //If view or edit get event data.
    if(mode === "view" || mode === "edit") {
        try {
        const response = await fetch("/getEvent?eventID="+encodeURIComponent(eventID), {credentials: "include"});
        if (!response.ok) {
            console.error("Error fetching event data: " + error);
            return;
        }
        eventData = await response.json();
        }
        catch(error) {
            console.error("Error fetching event data: " + error);
            return;
        }
    }
    const disabledField = mode === "view" ? "disabled" : "";
    document.getElementById("event").innerHTML = `
        <form id = "eventForm">
            <div id = "eventIDContainer" action autocomplete= "off">
                <label for = "eventID">Event ID:</label>
                <input type = "number" id = "eventID" name = "eventID" value = "${eventData.eventID}" disabled>
            </div>
            <div>
                <label for = "eventName">Event Name:</label>
                <input type = "text" id = "eventName" name = "eventName" value = "${eventData.eventName}" ${disabledField}>
            </div>
            <div>
                <label for = "eventLocation">Event Location:</label>
                <input type = "text" id = "eventLocation" name = "eventLocation" value = "${eventData.location}" ${disabledField}>
            </div>
            <div>
                <label for = "detailsShort">Short Details:</label>
                <input type = "text" id = "detailsShort" name = "detailsShort" value = "${eventData.detailsShort}" ${disabledField}>
            </div>
            <div>
                <label for = "detailsLong">Long Details:</label>
                <textarea id="detailsLong" name="detailsLong" ${disabledField}>${eventData.detailsLong}</textarea>
            </div>
            <div>
                <label for = "staffAssigned">Staff Assigned:</label>
                <select id = "staffAssigned" name = "staffAssigned" multiple ${disabledField}>
                    ${avaliableStaff.map(staff => {
                        const selected = (Array.isArray(eventData.staffAssigned) && eventData.staffAssigned.includes(staff)) ? "selected" : "";
                        return `<option value = "${staff}" ${selected}>${staff}</option>`;
                    }).join("")}
                </select>
            </div>
            <div id = "studentsSignedUpContainer">
                <label for = "studentsSignedUp">Students Signed Up:</label>
                <input type = "number" id = "studentsSignedUp" name = "studentsSignedUp" value = "${eventData.numberStudentsSignedUp}" disabled> 
            </div>
            <div>
                <label for = "totalSpaces">Total Spaces:</label>
                <input type = "number" id = "totalSpaces" name = "totalSpaces" value = "${eventData.totalSpaces}" ${disabledField}> 
            </div>
            <div>
                <label for = "releventSubjects">Relevent Subjects:</label>
                <select id = "releventSubjects" name = "releventSubjects" multiple ${disabledField}>
                    ${availableSubjects.map(subject => {
                        const selected = (Array.isArray(eventData.releventSubjects) && eventData.releventSubjects.includes(subject)) ? "selected" : "";
                        return `<option value = "${subject}" ${selected}>${subject}</option>`;
                    }).join("")}
                </select>
            </div>
            <div>
                <label for = "startTime">Start Time:</label>
                <input type = "datetime-local" id = "startTime" name = "startTime" value = "${formatTime(eventData.startTime)}" ${disabledField}> 
            </div>
            <div>
                <label for = "endTime">End Time:</label>
                <input type = "datetime-local" id = "endTime" name = "endTime" value = "${formatTime(eventData.endTime)}" ${disabledField}> 
            </div>
            <p id = "errorDisplay"></p>
            <button id = "submitEvent" type = "button" onclick = "submitForm()">${mode === "add" ? "Create Event" : "Update Event"}</button>
        </form>
    `;
    if (mode === "add"){
        document.getElementById("eventIDContainer").remove();
        document.getElementById("studentsSignedUpContainer").remove();
    }
    if (mode === "view") {
        document.getElementById("submitEvent").remove();
    }
}

async function submitForm(){
    //Do submision stuff
    console.log("Mode: " + sessionStorage.eventMode);
    const mode = sessionStorage.eventMode;
    var eventID;
    var studnetsSignedUp;
    if(mode === "add") {
        studnetsSignedUp = 0;
    }
    else {
        eventID = document.getElementById("eventID").value;
        studnetsSignedUp = document.getElementById("studentsSignedUp").value;
    }
    const eventName = document.getElementById("eventName").value;
    const location = document.getElementById("eventLocation").value;
    const detailsShort = document.getElementById("detailsShort").value;
    const detailsLong = document.getElementById("detailsLong").value;
    const staffAssigned = Array.from(document.getElementById("staffAssigned").selectedOptions).map(opt => opt.value);
    const totalSpaces = document.getElementById("totalSpaces").value;
    const releventSubjects = Array.from(document.getElementById("releventSubjects").selectedOptions).map(opt => opt.value);
    const startTime = parseCustomDate(document.getElementById("startTime").value);
    const endTime = parseCustomDate(document.getElementById("endTime").value);

    //Check for issues with form if none send request to server.
    const errorDisplay = document.getElementById("errorDisplay");
    if (!eventName || !location || !detailsShort || !detailsLong || isNaN(totalSpaces) || isNaN(startTime) || isNaN(endTime)) {
        errorDisplay.innerText = "One or more fields left blank.";
        return;
    }
    else if (startTime > endTime) {
        errorDisplay.innerText = "Start time cannot be later than end time.";
        return;
    }
    const eventData = {
        eventID: eventID,
        eventName: eventName,
        location: location,
        detailsShort: detailsShort,
        detailsLong: detailsLong,
        staffAssigned: staffAssigned,
        studnetsSignedUp: studnetsSignedUp,
        totalSpaces: totalSpaces,
        releventSubjects: releventSubjects,
        startTime: startTime,
        endTime: endTime
    };
    const response = await fetch((mode === "add" ? "/createEvent" : "/updateEvent"), {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify(eventData)
    });
    const result = await response.json();
    if (!response.ok) {
        errorDisplay.innerText("An error occured saving event to database: " + result.message);
        console.error("An error occured saving event to database: " + result.message);
        return;
    }
    //Success
    sessionStorage.eventMode = "view";
    if (mode === "view") {
        sessionStorage.eventID = result.event.eventID;
    }
    await loadEvent();
    document.getElementById("errorDisplay").innerText = "Event " + (mode === "add" ? "created" : "updated") + " successfully.";
}
function formatTime(ms) {
    const date = new Date(ms);
    
    function pad(num, size) {
        let s = num.toString();
        while (s.length < size) {
            s = "0" + s;
        }
        return s;
    }
    
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1, 2);
    const day = pad(date.getDate(), 2);
    const hours = pad(date.getHours(), 2);
    const minutes = pad(date.getMinutes(), 2);
    // Format required for datetime-local is "yyyy-MM-ddThh:mm"
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function parseCustomDate(dateString) {
    // Expected format: "yyyy-MM-ddThh:mm"
    const [datePart, timePart] = dateString.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hours, minutes] = timePart.split(":").map(Number);
    // Create a Date object
    const dateObj = new Date(year, month - 1, day, hours, minutes);
    return parseInt(dateObj.getTime());
}

if (document.readyState !== "loading") {
    loadEvent();
}
else {
    document.addEventListener("DOMContentLoaded", loadEvent);
}
