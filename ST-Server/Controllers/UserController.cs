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

    }
}
