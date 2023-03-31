using Microsoft.AspNetCore.SignalR;

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

		public void SendMessage(string message)
		{
			// Async entfernt
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

		//public void BroadcastMsg(string msg)
		//{
		//	// Aufruf der JavaScript-Funktion receiveMsg auf dem Client
		//	Clients.All.SendAsync("receiveMsg", msg);
		//}

		//public void SendMsg(string user, string msg)
		//{
		//	// TODO Ausnahme prüfen falls Schlüssel nicht existiert
		//	// ID des Benutzers ermitteln
		//	string id = chatClients[user];

		//	// Nachricht nur an den Client mit dieser Id versenden
		//	Clients.Client(id).SendAsync("receiveMsg", msg);
		//}


		// Speichert die aktiven Chat Clients
		// static, da Hub jedes mal instanziiert wird
		//private static readonly Dictionary<string, string> chatClients = new Dictionary<string, string>();

		//public void SignOn(string username)
		//{

		//    try
		//    {
		//        // Benutzer & Id merken
		//        chatClients.Add(username, Context.ConnectionId);

		//        // Alle Name an alle Clients versenden
		//        //Clients.All.SendAsync("handleSignOn", chatClients.Keys.ToArray());

		//    }
		//    catch (Exception e)
		//    {
		//        // TODO: Message anpassen
		//        Clients.Caller.SendAsync(e.ToString());
		//    }
		//}

		//public override async Task OnDisconnectedAsync(Exception e)
		//{
		//    // ermittelt den Benutzer der ID, welche die Verbindung geschlossen hat
		//    KeyValuePair<string, string> user = chatClients.SingleOrDefault(user => user.Value == Context.ConnectionId);

		//    chatClients.Remove(user.Key);

		//    // Information an aktive Benutzer senden
		//    await Clients.Others.SendAsync("handleSignOff", user.Key);

		//    await base.OnDisconnectedAsync(e);
		//}


	}
}
