const express=require('express');
const app=express();
app.use(express.json());

const morgan =require('morgan')
const mysqlConeccion  =require('./database/database');

//CONFIGURACIONES

//puerto
app.set('puerto',3002);

 //middlewares
 app.use(morgan('dev'));
 app.use(function(req,res,next){
   res.setHeader('Access-Control-Allow-Origin','*');
   res.setHeader('Access-Control-Allow-Methods','GET,POST, OPTIONS,PUT, DELETE');
   res.setHeader('Access-Control-Allow-Headers','X-Requested-With,content-type');
   res.setHeader('Access-Control-Allow-Credentials',true);
   next();
 });

 // rutas para mi aplicación
 app.use(require('./router/router'));

 //ARRANCAR SERVIDOR
app.listen(app.get('puerto'),()=>{
   console.log('anda y corre el puerto '+app.get('puerto'));
});