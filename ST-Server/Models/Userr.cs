using ST_Server.DAL;

namespace ST_Server.Models
{
    public class Userr
    {
        public int id;
        public string name;
        public string userName;
        public string email;
        public string password;
        public string profilePicture;
        public string role;
        public int coins;
        public string diabetesType;
        public string gender;
        public bool isActive;

        public Userr() { }

        public Userr(int id, string name,string userName ,string email, string password, string profilePicture, string role, int coins, string diabetesType, string gender, bool isActive)
        {
            Id = id;
            UserName = userName;
            Name = name;
            Email = email;
            Password = password;
            ProfilePicture = profilePicture;
            Role = role;
            Coins = coins;
            DiabetesType = diabetesType;
            Gender = gender;
            IsActive = isActive;
        }
        public int Id { get; set; }
        public string Name { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string ProfilePicture { get; set; }
        public string Role { get; set; }
        public int Coins { get; set; }
        public string DiabetesType { get; set; }
        public string Gender { get; set; }
        public bool IsActive { get; set; }


        public static List<int> Read()
        {
            UserDBservices dbs = new UserDBservices();
            return dbs.GetUsersList();
        }
        public static int Insert(Userr userr)
        {
            UserDBservices dbs = new UserDBservices();
            return dbs.InsertUser(userr);
        }
        public static int Login(string email, string password)
        {
            UserDBservices dbs = new UserDBservices();
            return dbs.Login(email, password);
        }
        public static int updateIsActive(int id, bool isActive)
        {
            UserDBservices dbs = new UserDBservices();
            return dbs.UpdateIsActive(id, isActive);
        }
        public static int Update(Userr userr)
        {
            UserDBservices dbs = new UserDBservices();
            return dbs.UpdateUser(userr);
        }
        public static Userr getUserByEmail(string email)
        {
            UserDBservices dbs = new UserDBservices();
            return dbs.getUserByEmail(email);
        }
    }
}
