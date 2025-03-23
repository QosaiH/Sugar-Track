using ST_Server.Models;
using System.Data.SqlClient;

namespace ST_Server.DAL
{
    public class UserDBservices
    {
        public UserDBservices()
        {
            //
            // TODO: Add constructor logic here
            //
        }

        //--------------------------------------------------------------------------------------------------
        // This method creates a connection to the database according to the connectionString name in the web.config 
        //--------------------------------------------------------------------------------------------------
        public SqlConnection connect(String conString)
        {

            // read the connection string from the configuration file
            IConfigurationRoot configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json").Build();
            string cStr = configuration.GetConnectionString("myProjDB");
            SqlConnection con = new SqlConnection(cStr);
            con.Open();
            return con;
        }

        //---------------------------------------------------------------------------------
        // Create the SqlCommand using a stored procedure
        //---------------------------------------------------------------------------------
        private SqlCommand CreateCommandWithStoredProcedure(String spName, SqlConnection con, Userr userr)
        {

            SqlCommand cmd = new SqlCommand(); // create the command object

            cmd.Connection = con;              // assign the connection to the command object

            cmd.CommandText = spName;      // can be Select, Insert, Update, Delete 

            cmd.CommandTimeout = 10;           // Time to wait for the execution' The default is 30 seconds

            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text

            return cmd;
        }
        //---------------------------------------------------------------------------------
        // Create sql command
        //---------------------------------------------------------------------------------
        private SqlCommand CreateCommandWithStoredProcedureGeneral(String spName, SqlConnection con, Dictionary<string, object> paramDic)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object

            cmd.Connection = con;              // assign the connection to the command object

            cmd.CommandText = spName;      // can be Select, Insert, Update, Delete 

            cmd.CommandTimeout = 10;           // Time to wait for the execution' The default is 30 seconds

            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text

            if (paramDic != null)
                foreach (KeyValuePair<string, object> param in paramDic)
                {
                    cmd.Parameters.AddWithValue(param.Key, param.Value);

                }


            return cmd;
        }

        public List<Userr> GetUsersList()
        {
            SqlConnection con;
            SqlCommand cmd;
            SqlDataReader reader;
            List<Userr> users = new List<Userr>();

            try
            {
                con = connect("igroup15_test2"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            // Create the command for the stored procedure or SQL query
            cmd = CreateCommandWithStoredProcedure("STgetUsersList", con, null);

            reader = cmd.ExecuteReader(); // Execute the command and get a data reader

            // Read the data
            while (reader.Read())
            {
                Userr userr = new Userr
                {
                    Id = reader.GetInt32(reader.GetOrdinal("id")),
                    Name = reader.GetString(reader.GetOrdinal("name")),
                    Email = reader.GetString(reader.GetOrdinal("email")),
                    Password = reader.GetString(reader.GetOrdinal("password")),
                    ProfilePicture = reader.GetString(reader.GetOrdinal("profilePicture")),
                    Role = reader.GetString(reader.GetOrdinal("role")),
                    Coins = reader.GetInt32(reader.GetOrdinal("coins")),
                    DiabetesType = reader.GetString(reader.GetOrdinal("diabetesType")),
                    Gender = reader.GetString(reader.GetOrdinal("gender"))
                };

                users.Add(userr); // Add the user to the list
            }
            try
            {
                return users;
            }
            catch (Exception ex)
            {
                // Write to log
                throw; // Rethrow the exception
            }
            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }
        }

        public int InsertUser(Userr userr)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("igroup15_test2");
            }
            catch (Exception ex)
            {
                throw ex;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@name", userr.Name);
            paramDic.Add("@email", userr.Email);
            paramDic.Add("@password", userr.Password);
            paramDic.Add("@profilePicture", userr.ProfilePicture);
            paramDic.Add("@role", userr.Role);
            paramDic.Add("@coins", userr.Coins);
            paramDic.Add("@diabetesType", userr.DiabetesType);
            paramDic.Add("@gender", userr.Gender);


            cmd = CreateCommandWithStoredProcedureGeneral("STinsertUser", con, paramDic);

            try
            {
                object result = cmd.ExecuteScalar(); // get the userID
                int insertedId = Convert.ToInt32(result); // convert the result to int
                return insertedId; // return the userID
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }


    }
}
