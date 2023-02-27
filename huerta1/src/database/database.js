const mysql = require('mysql');


//crear conexión con mi base de datos
const mysqlConeccion= mysql.createConnection({
host:'localhost',
user: 'root',
password: 'root',
database: 'huerta'
});

//crear función para ver si me conectó bien
 mysqlConeccion.connect(function(err){
    if(err){
        console.log('mi error es ', err);
        return;
    }else{
        console.log('mi conexión se realizó correctamente')
    }
 });

 module.exports = mysqlConeccion;