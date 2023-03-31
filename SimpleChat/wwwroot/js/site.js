
// Deklaration globaler Variablen
let chat;
let username;

// onClick-Event zum bestätigen des Benutzernamens
$("#setUsername").click(setUsername);

function setUsername() {

    // speichern des Benutzernamens
    username = $('#username').val();

    // 
    if (username != "") {
        /*TODO: falls Username leer -> automatisch erzeugen*/
    }

    // Starten der Chat-FUnktion
    chatStart();
}

function chatStart() {

    // Start der Verbindung
    chat = new signalR.HubConnectionBuilder()
        .withUrl("/chatHub")
        .build();


    // .then wartet, bis Verbindung aufgebaut wurde
    chat.start().then(() => {

        // Benutzername an Server senden
        chat.invoke("SignOn", username);


        $('#sendButton').on("click", sendButtonClick);

    });

    chat.on("ReceiveMessage", function (message) {
        let li = document.createElement("li");
        li.textContent = message;

        // Test
        alert(message);

        $("#messagesList").appendChild(li);

        //document.getElementById("messagesList").appendChild(li);
    });

    

}

function sendButtonClick() {

    let message = username + ": " + $('#messageInput').val();

    alert(message);

    chat.invoke("SendMessage", message);


    //document.getElementById("sendButton").onclick = function () {
        
    //    let msgContent = document.getElementById("messageInput").value;
    //    let message = username + ": " + msgContent;

    //    chat.invoke("SendMessage", username, message);
    //};
}





//let chat;

//let username;

//init();

//function init() {
//    // Benutzernamen einlesen
//    $('#displayname').val(prompt('Bitte Namen eingeben:', ''));

//    // ...und speichern
//    username = $('#displayname').val();

//    // Benutzername leer?
//    if (username === undefined || username === '') {
//        username = "ChatUser" + Math.floor(Math.random() * (100 - 1) + 1);
//    }

//    // Benutzername in die Seite einfügen
//    $('#username').text(username);

//    // Auswahl aufheben
//    $('#deselect').on('click', () => $("#teilnehmer").val([]));

//    chatStart();
//}

//function chatStart() {
//    // Referenz auf den Hub
//    chat = new signalR.HubConnectionBuilder()
//        .withUrl("/chatHub")
//        .build();

//    // Methode für Fehlermeldung vom Server
//    chat.on("sendServerError", (errorMessage) => {
//        alert(errorMessage);
//        init();
//    });

//    // Start der Verbindung
//    // Das then() wartet bis die Verbindung aufgebaut wurde
//    chat.start().then(() => {
//        // Benutzernamen an den Server senden
//        chat.invoke("SignOn", username);

//        // Bei Buttonclick
//        $('#sendmessage').on("click", sendButtonClick);
//    });

//    // Aufruf für den Erhalt einer Nachricht
//    chat.on("receiveMsg", (message) => {
//        // Nachricht einfügen
//        $('#discussion').prepend(message + '\n');
//    });

//    // Aufruf für die Verbindung eines Benutzers
//    chat.on("handleSignOn", (chatNames) => {
//        // Teilnehmerliste löschen
//        $("#teilnehmer").empty();
//        $("#teilnehmer").append('<option disabled="disabled">Benutzer auswählen</option>');

//        // Namen durchlaufen
//        for (let i = 0; i < chatNames.length; i++) {
//            // Alle Namen bis auf den eigenen...
//            if (chatNames[i] !== username) {
//                // ...in die Liste einfügen
//                $("#teilnehmer").append('<option value="' + chatNames[i] + '">' + chatNames[i] + '</option>');
//            }
//        }
//    });

//    // Aufruf für den Verbindungsabbau eines Benutzers
//    chat.on("handleSignOff", (chatName) => {
//        // Teilnehmer aus dem select entfernen
//        $("#teilnehmer option[value='" + chatName + "']").remove();
//    });
//}

//function sendButtonClick() {
//    // Nachricht auslesen
//    let message = username + ": " + $('#message').val();

//    // Ausgewählten Benutzer ermitteln
//    let selectedUser = $('#teilnehmer option:selected').val();

//    // An alle oder einen Benutzer?
//    if (selectedUser === undefined) {
//        // An alle Benutzer

//        // Aufruf der Methode BroadcastMsg aus der ChatHub.cs
//        chat.invoke("BroadcastMsg", message);

//    }
//    else {
//        // An einen Benutzer

//        // Aufruf der Methode SendMsg aus der ChatHub.cs
//        chat.invoke("SendMsg", selectedUser, message);
//    }

//    // Textbox löschen und wieder den Fokus auf die Textbox setzten
//    $('#message').val('').focus();
//}


//// Deklaration globaler Variablen
//let chat;
//let username;


//function setUsername() {

//    username = document.getElementById("username").value;

//    if (username != "") {
//        alert(username);
//        console.log(username);
//    }

//    chatStart();
//}

//function chatStart() {

//    let chat = new SignalR.HubConnectionBuilder()
//        .withUrl("/chatHub")
//        .build();

//    chat.start().then(function () {

//        // Benutzer an Server senden
//        chat.invoke("SignOn", username);

//        document.getElementById("sendButton").disabled = false;
//    });

//    chat.on("ReceiveMessage", function (message) {
//        let msg = username + ": " + message;
//        let li = document.createElement("li");
//        li.textContent = msg;
//        document.getElementById("messagesList").appendChild(li);
//    });

//    document.getElementById("sendButton").addEventListener("click", function (event) {
//        let message = document.getElementById("messageInput").value;
//        chat.invoke("SendMessage", message);
//    });

//}