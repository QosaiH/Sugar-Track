using ST_Server.DAL;
using System;
using ST_Server.Controllers;

using System.Collections.Generic;

namespace ST_Server.Models
{
    public class GlucoseLog
    {
        // Auto-implemented properties are preferred for clarity and brevity
        public int LogID { get; set; }
        public string LogType { get; set; }
        public string LogStatus { get; set; }
        public DateTime LogDate { get; set; }
        public int UserID { get; set; }

        // Parameterless constructor
        public GlucoseLog() { }

        // Constructor with parameters
        public GlucoseLog(int logID, string logType, string logStatus, DateTime logDate, int userID)
        {
            LogID = logID;
            LogType = logType;
            LogStatus = logStatus;
            LogDate = logDate;
            UserID = userID;
        }

        // Read method to get a list of logs
        public static List<GlucoseLog> Read()
        {
            GlucoseLogDBservices dbs = new GlucoseLogDBservices();
            return dbs.GetGlucoseLogsList();
        }

        // Insert method to add a new log
        public static int Insert(GlucoseLog glucoseLog)
        {
            GlucoseLogDBservices dbs = new GlucoseLogDBservices();
            return dbs.InsertGlucoseLog(glucoseLog); // Capitalized 'Insert' for naming consistency
        }
        public static List<GlucoseLog> GetGlucoseLogsByUserId(int UserID)
        {
            GlucoseLogDBservices dbs = new GlucoseLogDBservices();
            return dbs.GetLogsByUserId(UserID);
        }

    }
}
