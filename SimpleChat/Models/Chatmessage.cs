namespace SimpleChat.Models
{
	public class Chatmessage
	{
        public string User { get; set; }
        public string Content { get; set; }
        public string Zeitstempel { get; set; }


        public Chatmessage(string user, string content)
        {
            User = user;
            Content = content;
        }
    }
}
