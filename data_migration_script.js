import sql from 'mssql';
import csvWriter from 'csv-writer';

async function main() {
    let pool; // Declare the pool variable at a higher scope
    // Define your source database config object
    const sourceConfig = {
        user: 'your_username',
        password: 'your_password',
        server: 'your_server',
        database: 'your_source_database',
        options: {
            trustServerCertificate: true,
        },
    };
    // Define your destination database config object// I know this maybe unnecessary but it is a good reference to keep track of where the data is going or coming from
    const destConfig = {
        user: 'your_username',
        password: 'your_password',
        server: 'your_server',
        database: 'your_destination_database',
        options: {
            trustServerCertificate: true,
        },
    };
    try {
        // Make sure to await connection pool to avoid premature queries
        let pool = await sql.connect(sourceConfig);
        const destPool = await sql.connect(destConfig);
        // Fetch the column names from tblLookUFieldNames
        let result = await pool.request().query('SELECT * FROM [JxCloud].[tblLookUFieldNames];');
        let record = result.recordset[0];
        // Create a column mapping from the column names to their respective values
        const columnMapping = {};
        for (let key in record) {
            console.log("Key:", key);
            // Only add to column mapping if it's in format Ux or ux (x: any number)
            if (/^u\d+$/i.test(key)) {
                columnMapping[key] = record[key];
            }
        }
        // Debugging: Print out the column mapping
        console.log("Column mapping:");
        console.log(columnMapping);
        // Create the select statement using mapped column names
        let query = "SELECT ID, ";
        let columnAliases = [];
        for (let originalCol in columnMapping) {
            let mappedCol = columnMapping[originalCol];
            // Only add non-empty or non-null alias to the column mapping
            if (mappedCol && mappedCol.trim() !== '') {
                // Use column alias for meaningful column names in the output
                // Enclose alias in square brackets to handle spaces/special characters
                columnAliases.push(`${originalCol} AS [${mappedCol}]`);
            }
        }
        query += columnAliases.join(', ');
        query += " FROM [JxCloud].[tblClientsUFields];";
        // Debugging: Print out the query
        console.log("Query:");
        console.log(query);
        // Execute the query
        const clientData = await pool.request().query(query);
        // Display data in tabular format in the console
        console.table(clientData.recordset);
        // Create the "CUSTOMFIELDS" table if it doesn't exist
        const createTableQuery = `
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'CUSTOMFIELDS')
        BEGIN
            CREATE TABLE [JxCloud].[CUSTOMFIELDS] (
                ${Object.keys(clientData.recordset[0]).map(key => `[${key}] NVARCHAR(MAX)`).join(',\n')}
            )
        END
        `;
        await destPool.request().query(createTableQuery);
        // Update or insert data into the destination database
        for (const row of clientData.recordset) {
            const id = row.ID;
            const updateQuery = `
                UPDATE [JxCloud].[CUSTOMFIELDS]
                SET ${Object.keys(row).map(key => `[${key}] = '${row[key]}'`).join(', ')}
                WHERE ID = '${id}'
            `;
            const insertQuery = `
                INSERT INTO [JxCloud].[CUSTOMFIELDS] (${Object.keys(row).map(key => `[${key}]`).join(', ')})
                VALUES (${Object.keys(row).map(key => `'${row[key]}'`).join(', ')})
            `;
            // Check if the ID exists in "CUSTOMFIELDS" and update or insert accordingly
            const checkQuery = `SELECT ID FROM [JxCloud].[CUSTOMFIELDS] WHERE ID = '${id}'`;
            const checkResult = await destPool.request().query(checkQuery);
            if (checkResult.recordset.length > 0) {
                await destPool.request().query(updateQuery);
                console.log(`Row with ID '${id}' updated.`);
            } else {
                await destPool.request().query(insertQuery);
                console.log(`Row with ID '${id}' inserted.`);
            }
        }
        // Close the destination database connection
        await destPool.close();
        if (clientData.recordset.length === 0) {
            console.log("No changes were made.");
        }
    } catch (err) {
        console.error(err);
    } finally {
        if (pool) {
            // Close the source database connection if it exists
            await pool.close();
        }
    }
}

main().catch(err => console.log(err));
