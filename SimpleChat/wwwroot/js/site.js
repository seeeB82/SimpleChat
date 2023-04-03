
// Deklaration globaler Variablen
let chat;
let username;

setUsername();

function setUsername() {

    // Benutzernamen einlesen und speichern
    username = prompt('Bitte Namen eingeben:');

    // Bei leerem Benutzernamen generieren
    if (username === undefined || username === '') {
        username = "Benutzer" + Math.floor(Math.random() * (10000 - 1) + 1);
    }

    // Starten des Chats
    chatStart();
}

function chatStart() {

    // Start der Verbindung
    chat = new signalR.HubConnectionBuilder()
        .withUrl("/chatHub")
        .build();

    // Methode für Fehlermeldung vom Server
    chat.on("sendServerError", (errorMessage) => {
        alert(errorMessage);
        setUsername();
    });

    // .then wartet, bis Verbindung zum Chat aufgebaut wurde
    chat.start().then(() => {

        // Benutzername an Server senden
        chat.invoke("SignOn", username);

        // Chatverlauf abrufen
        chat.invoke("RequestHistory");

        // ruft Funktion zum Senden der Nachricht auf
        $('#sendButton').on("click", sendButtonClick);
    });

    // Nachrichten empfangen und neues Listenelement erzeugen
    chat.on("ReceiveMessage", function (user, message, time) {

        // fügt Nachrichten-Kopf hinzu
        let msgHead = document.createElement("li");
        msgHead.textContent = user + "   " + time;
        msgHead.className = "head";

        document.getElementById("messagesList").appendChild(msgHead);

        // fügt Nachricht hinzu
        let li = document.createElement("li");
        li.textContent = message;
        li.className = "msg";

        document.getElementById("messagesList").appendChild(li);
    });

    // Ermitteln und Anzeigen von aktiven Benutzern
    chat.on("handleSignOn", function (chatClients) {

        // Benutzerliste löschen
        $('#chatUsers').empty();

        // Array mit aktiven Benutzern durchlaufen
        for (let i = 0; i < chatClients.length; i++) {

            // Erzeugen von List Item Elementen für jeden aktiven Benutzer (id = Benutzername)
            let li = document.createElement("li");
            li.textContent = chatClients[i];
            li.id = chatClients[i];

            // in die Benutzerliste einfügen
            document.getElementById("chatUsers").appendChild(li);
        }
    });

    // ruft Methode zum Entfernen nicht aktiver Benutzer auf
    chat.on("handleSignOff", function (chatClient) {

        // nicht mehr aktive Benutzer entfernen
        document.getElementById(chatClient).remove();
        
    });

    // Abrufen der Chat-Historie
    chat.on("GetHistory", function (user, message, time) {

        // fügt Nachrichten-Kopf hinzu
        let msgHead = document.createElement("li");
        msgHead.textContent = user + "   " + time;
        msgHead.className = "head";

        document.getElementById("messagesList").appendChild(msgHead);

        // fügt Nachricht hinzu
        let li = document.createElement("li");
        li.textContent = message;
        li.className = "msg";

        document.getElementById("messagesList").appendChild(li);
    });
};

function sendButtonClick() {

    // Verhindern von Absenden leerer Nachrichten
    if ($('#messageInput').val() != "") {

        // Speichern der Nachricht
        let message = $('#messageInput').val();

        // Absenden der Nachricht zum ChatHub
        chat.invoke("SendMessage", username, message);
    }

    // Eingabefeld leeren und Fokus auf die Textbox setzen
    $('#messageInput').val('').focus();
}