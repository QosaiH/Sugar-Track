CREATE TABLE STusers (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL,
	username NVARCHAR(255) NOT NULL UNIQUE,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    profilePicture NVARCHAR(MAX),
    role NVARCHAR(50),
    coins INT DEFAULT 0,
    diabetesType NVARCHAR(50),
    gender NVARCHAR(20),
	isActive BIT DEFAULT 1
);
-----------------------------------------------------
select *
from STusers
-----------------------------------------------------

-----------------------------------------------------
CREATE OR ALTER PROCEDURE STinsertUser
    @name NVARCHAR(255),
	@username NVARCHAR(255),
    @email NVARCHAR(255),
    @password NVARCHAR(255),
	@profilePicture NVARCHAR(MAX),
    @role VARCHAR(50),
    @coins INT =0,
    @diabetesType VARCHAR(50),
    @gender NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO STusers (name,username, email, password,profilePicture, role, coins, diabetesType, gender, isActive)
    VALUES (@name,@username, @email, @password,@profilePicture, @role, @coins, @diabetesType, @gender, 1);

    SELECT SCOPE_IDENTITY() AS id;
END;
--------------------------------------------------------
CREATE OR ALTER PROCEDURE STUserLogin  
    @email NVARCHAR(255),
    @password NVARCHAR(255)
AS
BEGIN
    IF EXISTS (SELECT * FROM STusers WHERE email = @email and password=@password)
	begin
        SELECT isActive FROM STusers WHERE email = @email;
		end;
		Else
		begin
		return 0;
		end
		End;
--------------------------------------------------------
CREATE or alter PROCEDURE STisActiveUpdate
@isActive bit,
@id int
AS BEGIN
update STusers
set isActive=@isActive
where id=@id;
end;
------------------------------------------------------------
 CREATE or alter PROCEDURE STUpdateUserInfo
    @userID INT,
    @name NVARCHAR(255),
    @email NVARCHAR(255),
    @password NVARCHAR(255),
	@username NVARCHAR(255),
	@profilePicture NVARCHAR(MAX)
AS
BEGIN
    UPDATE STusers
    SET name = @name,
		username = @username,
        email = @email,
        password = @password,
		profilePicture = @profilePicture
    WHERE id = @userID;
END;
---------------------------------------------------------
 CREATE or alter PROCEDURE STGetUserById
    @id INT
AS
BEGIN
	select *
	from STusers
	where id = @id;
End;
---------------------------------------------------------
 CREATE or alter PROCEDURE STGetUserByEmail
    @email NVARCHAR(255) 
AS
BEGIN
	select *
	from STusers
	where email = @email;
End;

--------------
DBCC CHECKIDENT ('STusers', RESEED, 7)
--------------------------------

CREATE TABLE [dbo].[STGlucoseLog](
	[LogId] [int] IDENTITY(1,1) NOT NULL,
	[UserID] [int] NULL,
	[LogType] [nvarchar](70) NOT NULL,
	[LogDate] [datetime] NOT NULL,
	[LogStatus] [nvarchar](70) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[LogId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

-------------------------------------
CREATE PROCEDURE [dbo].[STInsertGlucoseLog]
    @UserID INT,
    @LogType NVARCHAR(70),
    @LogDate DATETIME,
    @LogStatus NVARCHAR(50)
AS
BEGIN
    INSERT INTO STGlucoseLog (UserID, LogType, LogDate, LogStatus)
    VALUES (@UserID, @LogType, @LogDate, @LogStatus);
END
GO
------------------------------------------------

CREATE PROCEDURE [dbo].[STGetGlucoseLogList]
AS
BEGIN
    SELECT 
        LogId,
        UserID,
        LogType,
        LogDate,
        LogStatus
    FROM 
        STGlucoseLog
    ORDER BY 
        LogDate DESC;
END
GO


--------------------------------------------------
