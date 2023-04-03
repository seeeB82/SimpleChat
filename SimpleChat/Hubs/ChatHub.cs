using Microsoft.AspNetCore.SignalR;
using SimpleChat.Models;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Simple_Chat.Hubs
{
    public class ChatHub : Hub
    {

		// Speichert die aktiven Chat Clients
		// static, da Hub jedes mal instanziiert wird, es aber nur eine Liste aller verbundenen Client gibt
		private static readonly Dictionary<string, string> chatClients = new Dictionary<string, string>();

		// wird beim Login eines Benutzers aufgerufen
		public void SignOn(string username)
		{
			try
			{
				// Benutzer & Id merken
				chatClients.Add(username, Context.ConnectionId);

				// Alle Name an alle Clients versenden
				Clients.All.SendAsync("handleSignOn", chatClients.Keys.ToArray());

			}
			catch (Exception e)
			{
				// bei Fehler: Fehlermeldung an aufrufenden Benutzer senden
				Clients.Caller.SendAsync("sendServerError", e.Message);
			}
		}

		// Beenden der Verbindung eines Benutzers
		public override async Task OnDisconnectedAsync(Exception exception)
		{
			// Benutzer zu der ID ermitteln, welcher die Verbindung geschlossen hat
			KeyValuePair<string, string> user = chatClients.SingleOrDefault(kvp => kvp.Value == Context.ConnectionId);

			// Benutzer aus dem Verzeichnis entfernen
			chatClients.Remove(user.Key);

			// Information an die verbleibenden Clients senden
			await Clients.Others.SendAsync("handleSignOff", user.Key);

			// bei Fehler: Fehlermeldung anzeigen
			await base.OnDisconnectedAsync(exception);
		}

		// Versenden einer Nachricht
		public void SendMessage(string username, string message)
		{
			// ein neues Nachrichtenobjekt mit Attributen instanziieren
			Chatmessage msg = new Chatmessage(username, message);

			msg.User = username;
			msg.Content = message;
			msg.Zeitstempel = DateTime.Now.ToString("dd.MM.yyyy - HH:mm");


			// Json Serialisierung
			string json = JsonSerializer.Serialize<Chatmessage>(msg);


			// Nachricht in Chat-Historie speichern
			SetHistory(json);

			// ruft von allen verbundenen CLients die Methode "ReceiveMessage" auf und verteilt die Nachricht
			Clients.All.SendAsync("ReceiveMessage", msg.User, msg.Content, msg.Zeitstempel);
		}

		// Abrufen der Chat-Historie
		public void RequestHistory()
		{

			// TODO: Wenn Benutzer, Zeit hinzugefügt: Umwandlung von Json
			string[] history = File.ReadAllLines(SetFilePath());

			// Chat Historie Zeile für Zeile auslesen
			foreach (var line in history)
			{
				// Deserialisierung der einzelnen Nachrichten
				Chatmessage? msg = JsonSerializer.Deserialize<Chatmessage>(line);

				if (msg != null)
				{
					// Chat-Historie an aufrufenden Benutzer senden
					Clients.Caller.SendAsync("GetHistory", msg.User, msg.Content, msg.Zeitstempel);
				}
			}
		}

		// Speichern und Hinzufügen einer Nachricht in die Chat-Historie
		public void SetHistory(string message)
		{
			// Öffnen der Datei zum Speichern der Nachrichten
			using StreamWriter streamw = new StreamWriter(SetFilePath(), true);

			// aktuelle Nachricht anhängen
			streamw.WriteLine(message);
		}

		// Festlegen des Speicherorts/ -verzeichnis
		private string SetFilePath()
		{
			// Verzeichnis der Anwendung ermitteln
			string currentDirectory = Directory.GetCurrentDirectory();

			// vollständiger Pfad zum Speicherort/ -verzeichnis
			string filepath = Path.Combine(currentDirectory, "AppData", "chatHistory.txt");

            return filepath;
		}
	}
}
