using Microsoft.AspNetCore.SignalR;
using SimpleChat.Models;
using System.Runtime.CompilerServices;
using System.Text.Json;

namespace Simple_Chat.Hubs
{
    public class ChatHub : Hub
    {

		// Speichert die aktiven Chat Clients
		// static, da Hub jedes mal instanziiert wird
		private static readonly Dictionary<string, string> chatClients = new Dictionary<string, string>();

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
				// TODO: Message anpassen
				Clients.Caller.SendAsync("sendServerError", e.Message);
			}
		}

		// Versenden von Client Nachrichten und anschließendes Verteilen and alle Clients
		public void SendMessage(string message)
		{
			// Nachrichten dem ChatLog hinzufügen
			SetHistory(message);

			// ruft von allen verbundenen CLients die Methode "ReceiveMessage" auf
			Clients.All.SendAsync("ReceiveMessage", message);
		}

		public override async Task OnDisconnectedAsync(Exception exception)
		{
			// Benutzer zu der ID ermitteln, welche die Verbidung geschlossen hat
			KeyValuePair<string, string> user = chatClients.SingleOrDefault(kvp => kvp.Value == Context.ConnectionId);

			// Benutzer aus dem Dicionary der Clients entfernen
			chatClients.Remove(user.Key);

			// Info an die verbleibenden Clients senden
			await Clients.Others.SendAsync("handleSignOff", user.Key);

			await base.OnDisconnectedAsync(exception);
		}

		public async Task RequestHistory()
		{
			string[] history = File.ReadAllLines(SetFilePath());

			await Clients.Caller.SendAsync("GetHistory", history);
		}

		public void SetHistory(string message)
		{
			// TODO: Zeit hinzufügen
			string msg = message;
			
			// Öffnen der Datei zum Speichern der Nachrichten
			using StreamWriter streamw = new StreamWriter(SetFilePath(), true);

			// aktuelle Nachricht anhängen
			streamw.WriteLine(msg);
		}

		private string SetFilePath()
		{
			// Verzeichnis der Anwendung ermitteln
			string currentDirectory = Directory.GetCurrentDirectory();

			// vollständigen Pfand zum Speichermedium
			string filepath = Path.Combine(currentDirectory, "AppData", "chatHistory.txt");

            return filepath;
		}

	}
}
