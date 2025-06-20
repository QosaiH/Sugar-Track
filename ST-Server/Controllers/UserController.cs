using Microsoft.AspNetCore.Mvc;
using ST_Server.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ST_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        // GET: api/<UserController>
        [HttpGet]
        public IEnumerable<int> Get()
        {
            return Userr.Read();
        }

        [HttpGet("admin")]
        public IEnumerable<Userr> GetUsers()
        {
            return Userr.ReadUsers();
        }
        // GET api/<UserController>/5
        /*
         [HttpGet("{id}")]
         public string Get(int id)
         {
             return "value";
         }
        */
        [HttpGet("{email}")]
        public Userr getUserByEmail(string email)
        {
            return Userr.getUserByEmail(email);
        }

        // POST api/<UserController>
        [HttpPost]
        public int Post([FromBody] Userr user)
        {
            return Userr.Insert(user);
        }

        [HttpPost("Login/{email}")]
        public int login([FromBody] string password, string email)
        {
            return Userr.Login(email, password);
        }

        // PUT api/<UserController>/5
        [HttpPut("{id}")]
        public int Put([FromBody] Userr user)
        {
            return Userr.Update(user);
        }

        [HttpPut("{id}/{isActive}")]
        public int isActivePut(int id, bool isActive)
        {
            return Userr.updateIsActive(id, isActive);
        }

        // DELETE api/<UserController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }

        [HttpPut("coins/{id}")]
        public int UpdateCoins(int id, int coins)
        {
            return Userr.UpdateCoins(id, coins);
        }
        [HttpPut("role/{id}")]
        public int UpdateRole(int id, string role)
        {
            return Userr.UpdateUserRole(id, role);
        }

        [HttpPost("admin/promote")]
        public IActionResult PromoteTopUsers()
        {
            try
            {
                List<Userr> users = Userr.ReadUsers();

                if (users.Count == 0)
                    return NotFound("No users found.");

                int topCount = (int)Math.Ceiling(users.Count * 0.1); // 10% מהמשתמשים

                // מיון לפי מטבעות
                var topUsers = users.OrderByDescending(u => u.Coins).Take(topCount).ToList();

                foreach (var user in users)
                {
                    // מאפסים מטבעות
                    Userr.UpdateCoins(user.Id, 0);

                    // אם היה מוביל מחזירים לרגיל
                    if (user.Role == "משתמש מוביל")
                    {
                        Userr.UpdateUserRole(user.Id, "משתמש רגיל");
                    }
                }

                // קידום מובילים חדשים
                foreach (var topUser in topUsers)
                {
                    Userr.UpdateUserRole(topUser.Id, "משתמש מוביל");
                }

                return Ok("Top users promoted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

    }
}
