using Microsoft.AspNetCore.Mvc;
using ST_Server.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ST_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GlucoseLogsController : ControllerBase
    {
        // GET: api/<GlucoseLogsController>
        [HttpGet]
        public IEnumerable<GlucoseLog> Get()
        {
            return GlucoseLog.Read();
        }


        // POST api/<GlucoseLogsController>
        [HttpPost]
        public int Post([FromBody] GlucoseLog glucoseLog)
        {
            return GlucoseLog.Insert(glucoseLog);

        }

        [HttpGet("{id}")]
        public ActionResult<List<GlucoseLog>> Get(int id)
        {
            try
            {
                List<GlucoseLog> logs = GlucoseLog.GetGlucoseLogsByUserId(id);
                if (logs == null || logs.Count == 0)
                {
                    return NotFound($"No logs found for user with ID {id}.");
                }
                return Ok(logs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT api/<GlucoseLogsController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<GlucoseLogsController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
