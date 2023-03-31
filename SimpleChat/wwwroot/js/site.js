
// Deklaration globaler Variablen
let chat;
let username;

setUsername();

function setUsername() {

    // Benutzernamen einlesen und speichern
    username = prompt('Bitte Namen eingeben:');


    // Bei leerem Benutzernamen generieren
    if (username === undefined || username === '') {
        username = "SimpleChatUser" + Math.floor(Math.random() * (10000 - 1) + 1);
    }

    // Starten der Chat-Funktion
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

    // .then wartet, bis Verbindung aufgebaut wurde
    chat.start().then(() => {

        // Benutzername an Server senden
        chat.invoke("SignOn", username);

        // Chatverlauf abrufen
        chat.invoke("RequestHistory");

        $('#sendButton').on("click", sendButtonClick);
    });

    // Nachrichten empfangen und neues Listenelement erzeugen
    chat.on("ReceiveMessage", function (message) {
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

            let li = document.createElement("li");
            li.textContent = chatClients[i];
            li.id = chatClients[i];

            // in die Benutzerliste einfügen
            document.getElementById("chatUsers").appendChild(li);
        }
    });

    // Entfernen von nicht aktiven Benutzern
    chat.on("handleSignOff", function (chatClient) {

        // nicht mehr aktiven Nutzer aus der Benutzerliste entfernen
        document.getElementById(chatClient).remove();
        
    });

    // Abrufen der Chathistorie
    chat.on("GetHistory", function (chatHistory) {

        // Array mit Nachrichten durchlaufen
        for (let i = 0; i < chatHistory.length; i++) {

            let li = document.createElement("li");
            li.textContent = chatHistory[i];
            li.className = "msg";

            // in die Nachrichtenliste einfügen
            document.getElementById("messagesList").appendChild(li);
        }
    });

};

function sendButtonClick() {

    let message = username + ": " + $('#messageInput').val();

    chat.invoke("SendMessage", message);

    // Inhalt der Nachrichteneingabe löschen und Fokus auf die Textbox setzen
    $('#messageInput').val('').focus();
}