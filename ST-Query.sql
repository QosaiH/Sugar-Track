CREATE TABLE STusers (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL,
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
CREATE or alter PROCEDURE STgetUsersList
AS
BEGIN
    SELECT *
    FROM STusers;
END;
-----------------------------------------------------
CREATE OR ALTER PROCEDURE STinsertUser
    @name NVARCHAR(255),
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

    INSERT INTO STusers (name, email, password,profilePicture, role, coins, diabetesType, gender, isActive)
    VALUES (@name, @email, @password,@profilePicture, @role, @coins, @diabetesType, @gender, 1);

    SELECT SCOPE_IDENTITY() AS id;
END;

