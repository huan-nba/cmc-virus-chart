var sql = require('mssql'); 

var config = {
    user: 'sa',
    password: '123',
    server: '192.168.2.105', // You can use 'localhost\\instance' to connect to named instance
    database: 'cisegate',
    port: '1219',

    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
}

sql.connect(config, function(err) {
    // ... error checks
    if (err) {
        console.log(err);
    }
    console.log
    // Query

    var request = new sql.Request();
    request.query('select 1 as number', function(err, recordset) {
        // ... error checks

        console.dir(recordset);
    });

    // Stored Procedure

    var request = new sql.Request();
    request.input('input_parameter', sql.Int, 3);
    request.output('output_parameter', sql.VarChar(50));
    request.execute('procedure_name', function(err, recordsets, returnValue) {
        // ... error checks

        console.dir(recordsets);
    });

});
