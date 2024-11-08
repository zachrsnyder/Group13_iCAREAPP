# Group13_iCAREAPP

First, export the file to desktop.

To run the program, first open SQL Server Management Studio
- Connect to "(LocalDB)\MSSQLLocalDB" using windows authentication
- Right-click on "Databases" in Object Explorer
- Select "Import Data-tier Application..."
- Browse to the group13db.bacpac file (located in the db folder of our main repo or inside of the zipfile in the db folder)

After this, open Visual Studio 2022 and select "Open a project or solution"

Navigate to the exported zip file and then open "Group13_iCAREAPP.sln"
- NOTE - You MUST have Node.js runtime installed
  
Next, right click on the clinetapp folder in the Solution Explorer window and open a terminal there
- Run these two commands in this order
- Run "npm install"
- Run "npm start"
Refresh the database connection in the Server Explorer window
Then build the project and run it.

