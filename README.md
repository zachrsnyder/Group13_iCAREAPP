# Group13_iCAREAPP

First, export the file to desktop.

To run the program, first open SQL Server Management Studio
- Connect to "(LocalDB)\MSSQLLocalDB" using windows authentication

  ![image](https://github.com/user-attachments/assets/3699371f-473d-4f76-a758-c102c2b0e71a)
- Right-click on "Databases" in Object Explorer
- Select "Import Data-tier Application..."

  ![image](https://github.com/user-attachments/assets/067cc1c1-fe2d-4aa0-8f0e-6eb7f57e15d2)
- Browse to the group13db.bacpac file (located in the db folder of our main repo or inside of the zipfile in the db folder)

![image](https://github.com/user-attachments/assets/8a2a9968-5ebf-464a-bd0f-32108629c1fe)

### After this, open Visual Studio 2022 and select "Open a project or solution"
  ![VisualStudioSelect](https://github.com/user-attachments/assets/cc7fe230-8c92-49df-86cd-bbaf4434dfc8)

### Navigate to the exported zip file and then open "Group13_iCAREAPP.sln"
  ![WhatToPick](https://github.com/user-attachments/assets/48b72736-7207-4387-9bb2-861b14dc9ea0)
- NOTE - You MUST have Node.js runtime installed
  
### Next, right click on the clinetapp folder in the Solution Explorer window and open a terminal there
  ![ClientApp](https://github.com/user-attachments/assets/6810e2e8-63dc-4611-a349-3fb8037e3dcf)
- Run these two commands in this order
- MAKE sure that NOTHING is running on poert 3000 already
- Run "npm install"
- Run "npm start"
- This is somewhat what the terminal should look like
  ![AfterNpmStart](https://github.com/user-attachments/assets/791d4fdc-5cca-4c4d-a050-90ced87a54b0)

  
### Refresh the database connection in the Server Explorer window

  ![RefreshDB](https://github.com/user-attachments/assets/5484c962-55e3-4203-b240-d6f807792123)

### Then build the project and run it.

  ![AboutToStart](https://github.com/user-attachments/assets/819d52f0-5570-481e-a973-8c6eb3b511c0)


