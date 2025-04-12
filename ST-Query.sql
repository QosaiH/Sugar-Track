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
DBCC CHECKIDENT ('STusers', RESEED, 5)
