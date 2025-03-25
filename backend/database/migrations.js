const database = require('./connection');
const fs = require('fs');
const path = require('path');

const runMigrations = async () => {
    const migrationPath = path.resolve(__dirname, 'schema.sql');
    const schema = fs.readFileSync(migrationPath, 'utf-8');

    database.exec(schema, (error) => {
        if (error) {
            console.log("Error while running migrations: ", error.message);
        } else {
            console.log("Migrations executed successfully.")
        }
    })
}

(async () => {
    await runMigrations();
})();