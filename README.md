# SQL-Data-Transfer-Script

**Script Overview**:
The script is designed to perform data extraction and transformation tasks between two SQL Server databases. It utilizes the Node.js runtime environment and several libraries, including `mssql` for database connectivity and `csv-writer` for CSV file writing. Below is a breakdown of its main components and purpose:

1. **Database Connections**:
   - The script establishes connections to two SQL Server databases: a source database and a destination database.

2. **Data Extraction**:
   - It fetches data from the source database by executing a SQL query on a specific table (`[JxCloud].[tblClientsUFields]`) and retrieves the results into a variable called `clientData`.

3. **Column Mapping**:
   - The script analyzes the first row of the fetched data to determine the mapping between column names (e.g., `u1`, `u2`, etc.) and their corresponding meanings or labels (e.g., `[ColumnName1]`, `[ColumnName2]`, etc.).
   - It constructs a mapping object (`columnMapping`) to store these associations.

4. **Data Transformation**:
   - It dynamically generates a new SQL query using the discovered column mappings. This query retrieves data from the source database, renames columns using the mapped labels, and stores it in a variable called `query`.

5. **Table Creation**:
   - The script checks if a table named `[JxCloud].[CUSTOMFIELDS]` exists in the destination database. If not, it creates this table dynamically based on the column structure of the retrieved data.

6. **Data Transfer**:
   - It iterates through the rows of `clientData` and performs data transfer to the destination database.
   - For each row, it checks if the corresponding ID exists in the destination table (`[JxCloud].[CUSTOMFIELDS]`).
   - If the ID exists, it updates the row; otherwise, it inserts a new row.

7. **Console Output**:
   - Throughout the script, it provides informative console output messages to track progress and inform the user about the operations being performed.

8. **Error Handling**:
   - The script includes error handling to catch and log any potential errors that may occur during database operations.

**Purpose**:
The script's primary purpose is to facilitate the transfer of data from a source table (`[JxCloud].[tblClientsUFields]`) to a destination table (`[JxCloud].[CUSTOMFIELDS]`) in a SQL Server database. It ensures that the destination table structure is aligned with the source data and updates or inserts rows based on a unique ID key.

This script can be useful in scenarios where data needs to be regularly synchronized or transformed between databases, especially when the source and destination databases have different schemas or naming conventions for columns. By providing dynamic column mapping and error handling, it enhances data consistency and reliability in the destination database.

Overall, the script serves as a valuable tool for data management and automation in an Information Systems Analyst's toolkit.
