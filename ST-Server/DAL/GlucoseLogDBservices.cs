using ST_Server.Models;
using System.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System;

namespace ST_Server.DAL
{
    public class GlucoseLogDBservices
    {
        // Constructor must be public
        public GlucoseLogDBservices() { }

        // Connect to DB
        public SqlConnection connect(string conString)
        {
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json").Build();
            string cStr = configuration.GetConnectionString("myProjDB");
            SqlConnection con = new SqlConnection(cStr);
            con.Open();
            return con;
        }

        // Command without parameters (but method still takes Userr? Remove if not needed)
        private SqlCommand CreateCommandWithStoredProcedure(string spName, SqlConnection con, Userr userr = null)
        {
            SqlCommand cmd = new SqlCommand
            {
                Connection = con,
                CommandText = spName,
                CommandTimeout = 10,
                CommandType = System.Data.CommandType.StoredProcedure
            };
            return cmd;
        }

        // Command with generic parameter dictionary
        private SqlCommand CreateCommandWithStoredProcedureGeneral(string spName, SqlConnection con, Dictionary<string, object> paramDic)
        {
            SqlCommand cmd = new SqlCommand
            {
                Connection = con,
                CommandText = spName,
                CommandTimeout = 10,
                CommandType = System.Data.CommandType.StoredProcedure
            };

            if (paramDic != null)
            {
                foreach (var param in paramDic)
                {
                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                }
            }

            return cmd;
        }

        // Get all glucose logs
        public List<GlucoseLog> GetGlucoseLogsList()
        {
            SqlConnection con = null;
            List<GlucoseLog> glucoseLogs = new List<GlucoseLog>();

            try
            {
                con = connect("igroup15_test2");
                SqlCommand cmd = CreateCommandWithStoredProcedure("STGetGlucoseLogList", con);

                using SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    GlucoseLog log = new GlucoseLog
                    {
                        LogID = reader.GetInt32(reader.GetOrdinal("LogId")),
                        LogValue = reader.GetInt32(reader.GetOrdinal("LogValue")),
                        LogStatus = reader.GetString(reader.GetOrdinal("LogStatus")),
                        LogType = reader.GetString(reader.GetOrdinal("LogType")),
                        LogDate = reader.GetDateTime(reader.GetOrdinal("LogDate")),
                        UserID = reader.GetInt32(reader.GetOrdinal("UserID"))
                    };
                    glucoseLogs.Add(log);
                }
                return glucoseLogs;
            }
            catch (Exception ex)
            {
                throw new Exception("Error reading glucose logs", ex);
            }
            finally
            {
                con?.Close();
            }
        }

        // Insert glucose log and return inserted ID
        public int InsertGlucoseLog(GlucoseLog glucoseLog)
        {
            SqlConnection con = null;

            try
            {
                con = connect("igroup15_test2");

                var paramDic = new Dictionary<string, object>
                {
                    { "@UserId", glucoseLog.UserID },
                    { "@LogValue",glucoseLog.LogValue },
                    { "@LogStatus", glucoseLog.LogStatus },
                    { "@LogType", glucoseLog.LogType },
                    { "@LogDate", glucoseLog.LogDate }
                };

                SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("STInsertGlucoseLog", con, paramDic);
                object result = cmd.ExecuteScalar();
                return Convert.ToInt32(result);
            }
            catch (Exception ex)
            {
                throw new Exception("Error inserting glucose log", ex);
            }
            finally
            {
                con?.Close();
            }
        }

        public List<GlucoseLog> GetLogsByUserId(int userId)
        {
            SqlConnection con = null;
            List<GlucoseLog> logs = new List<GlucoseLog>();

            try
            {
                con = connect("igroup15_test2");

                SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("STGetUserGlucoseLogs", con,
                    new Dictionary<string, object> { { "@UserID", userId } });

                using SqlDataReader reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    GlucoseLog glucoseLog = new GlucoseLog
                    {
                        LogID = reader.GetInt32(reader.GetOrdinal("LogId")),
                        LogValue = reader.GetInt32(reader.GetOrdinal("LogValue")),
                        LogStatus = reader.GetString(reader.GetOrdinal("LogStatus")),
                        LogType = reader.GetString(reader.GetOrdinal("LogType")),
                        LogDate = reader.GetDateTime(reader.GetOrdinal("LogDate")),
                        UserID = reader.GetInt32(reader.GetOrdinal("UserID"))
                    };

                    logs.Add(glucoseLog);
                }

                return logs;
            }
            catch (Exception ex)
            {
                throw new Exception("Error retrieving glucose logs for user", ex);
            }
            finally
            {
                con?.Close();
            }
        }

    }
}

