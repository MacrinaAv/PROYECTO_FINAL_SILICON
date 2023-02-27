const express=require('express');
const router=express();
// libreria de encriptación passwords
const bcrypt=require('bcrypt');
//libreria para generación de token
const jwt=require('jsonwebtoken');

//archivo de conexión con MyQSL
const mysqlConeccion  =require('../database/database');

//ruta raiz para mi aplicación
router.get('/',(req,res)=>{
    res.send('Pantalla Inicio de nuestra aplicación');
 });


//INICIO ENDPOINTS

/////////////////////////////
/////////USURIOS/////////////
////////////////////////////

// REGISTRO USUARIO, personas y generacion de la relacion en la tabla usuario_persona
router.post('/registro',async(req,res)=>{
   const {username, password,nombre,apellido,fecha_nacimiento,email,contacto}=req.body
   let hash = bcrypt.hashSync(password,10);
   let query=`INSERT INTO huerta.usuarios (username, password) VALUES ('${username}','${hash}');`
   mysqlConeccion.query(query,(err,rows)=>{
     //console.log(rows);
      if(!err){
       //res.send('se insertó correctamente el usuario: '+username);
      }else{
         console.log(err);
         res.send('ocurrió un error en el servidor');
      }
   });
   let query1=`INSERT INTO huerta.personas(nombre, apellido, fecha_nacimiento, email, contacto) VALUES ('${nombre}','${apellido}','${fecha_nacimiento}','${email}','${contacto}')`;
   mysqlConeccion.query(query1,(err,rows)=>{
      //console.log(rows);
      if(!err){
         res.send('Se insertó correctamente el usuario: '+username+' persona: '+nombre);
      }else{
         console.log(err);
         res.send('ocurrió un error en el servidor');
      }
   });
   let query2=`SELECT u.id_usuario FROM huerta.usuarios as u where username='${username}';`;
   mysqlConeccion.query(query2,(err,rows)=>{
      //console.log(rowss);
      const {id_usuario}=rows[0];
      //console.log(id_usuario);
      if(!err){
         let query3=`SELECT p.id_persona FROM huerta.personas as p where email='${email}';`;
         mysqlConeccion.query(query3,(err,rows)=>{
         //console.log(rowss);
            const {id_persona}=rows[0];
            //console.log(id_usuario);
            if(!err){
            //res.send('Tomo el id_upersona: ' +id_persona);
               let query4=`INSERT INTO huerta.usuario_persona(id_usuario, id_persona) VALUES ('${id_usuario}','${id_persona}');`;
               mysqlConeccion.query(query4,(err,rows)=>{
               //console.log(rows);
                  if(!err){
                     //res.send('Se insertó correctamente la relación: '+id_usuario+id_persona);
                  }else{
                     console.log(err);
                     res.send('ocurrió un error en el servidor quiery4');
                  }
               });
            }else{
               console.log(err);
               res.send('ocurrió un error en el servidor quiery3');
            };
         });
      }else{
         console.log(err);
         res.send('ocurrió un error en el servidor quiery2');
      }
   });   
});

//LOGIN DE USUARIOS
router.post('/login', async(req,res)=>{
    const {username,password} = req.body
    if(username!=undefined && password!=undefined){
      mysqlConeccion.query('select u.id_usuario, u.username, u.password from huerta.usuarios as u where u.username=?;',[username],(err,rows)=>{

      //mysqlConeccion.query('SELECT concat_ws(" ", p.nombre, p.apellido) Nombre, p.email, p.contacto from huerta.personas p inner join huerta.usuarios where usuarios.estado="A" and username=?;',[username],(err,rows)=>{
        if(!err){
         //cuenta cantidad de registros que devuelve base de datos
            if(rows.length!=0){
               console.log(rows);
               //pregunto si password y comparo con lo encriptado si es true/false (si pertenece o no)
               const bcryptPassword = bcrypt.compareSync(password, rows[0].password);
            if(bcryptPassword){
               jwt.sign({rows},'huerta1Key',(err,token)=>{
                  res.json({
                     exito:true,
                     datos: rows,
                     token: token
                  });
               })
             }else{
               console.log(rows);
               res.json({
                  exito: false,
                  mensaje: "contraseña incorrecta"
               });
             }
            }else{
               res.json({
                  exito: false,
                  mensaje: "El usuario no existe"
               });
            }
        }else{
         res.json({
         exito: false,
         mensaje: "Ocurrió un erorr"
      });
        }
     });
   }else{
      res.json({
         exito: false,
         mensaje: "Falta completar datos"
     });
   }
});

// RESETEAR CONTRASEÑA
router.put('/resetpassword/:id',(req,res)=>{
   let id= req.params.id;
   const {password}=req.body
   let hash =bcrypt.hashSync(password,10);
   let query= `UPDATE huerta.usuarios SET password='${hash}' WHERE id_usuario='${id}'`;
   mysqlConeccion.query(query,(err,registros)=>{
      if(!err){
       res.send('se cambió la constaseña');
      }else{
         res.send('ocurrió un error en el servidor');
      }
   });
});

//LISTAR USUARIOS
router.get('/usuarios', verificarToken, (req,res)=>{
   jwt.verify(req.token,'huerta1Key',(err,valido)=>{
      if(err){
         res.sendStatus(403);
      }else{
         let query= `SELECT u.username, concat_ws(" ", p.nombre,p.apellido) Nombre, up.estado FROM huerta.usuarios as u 
         inner join huerta.usuario_persona as up
         inner join huerta.personas as p
         where (u.id_usuario=up.id_usuario and up.id_persona=p.id_persona and up.estado='A');`;
      mysqlConeccion.query(query,(err,registros)=>{
         if(!err){
            console.log(registros.lenght)
            res.json(registros);
         }else{
            console.log(err);
         };
      });
      };
   });
});


/////////////////////////////
/////////HUERTA/////////////
////////////////////////////

///LISTAR Huertas con cantidad de usuarios por huerta
router.get('/huertas', verificarToken, (req,res)=>{
   jwt.verify(req.token,'huerta1Key',(err,valido)=>{
      if(err){
         res.sendStatus(403);
      }else{
         let query= `SELECT h.nombre Nombre, h.localidad Localidad, count(uh.id_huerta) Usuarios FROM huerta.huerta as h 
         INNER JOIN huerta.usuario_huerta as uh where h.id_huerta=uh.id_huerta 
         group by uh.id_huerta;`;
      mysqlConeccion.query(query,(err,registros)=>{
         if(!err){
            console.log(registros.lenght)
            res.json(registros);
         }else{
            console.log(err);
         }
       })
      }
   })
 });
///Muestra los usuarios de una huerta en particular con el id de la huerta
router.put('/huertas/:id_huerta',(req,res)=>{
   jwt.verify(req.token,'huerta1Key',(err,valido)=>{
      if(err){
         res.sendStatus(403);
      }else{
         let id_huerta= req.params.id_huerta;
         let query= `SELECT u.username FROM (SELECT uh.id_usuario, h.nombre Nombre FROM huerta.huerta as h 
         INNER JOIN huerta.usuario_huerta as uh WHERE h.id_huerta=uh.id_huerta and h.id_huerta='${id_huerta}') AS T 
         INNER JOIN huerta.usuarios AS u WHERE (T.id_usuario=u.id_usuario);`;
         mysqlConeccion.query(query,(err,registros)=>{
            if(!err){
               res.send(registros);
            }else{
               res.send('ocurrió un error en el servidor');
            }
         });
      }
   })
});

   



///////////////////////////
/////////PLANTAS//////////
/////////////////////////
//Lista de Plantas con cantidad de comentarios
router.get('/plantas', verificarToken, (req,res)=>{
   jwt.verify(req.token,'huerta1Key',(err,valido)=>{
      if(err){
         res.sendStatus(403);
      }else{
         let query= `SELECT pl.nombre, pl.comentario, pl.epoca, pl.luna, pl.forma,  count(cp.id_planta) Comentarios FROM huerta.plantas AS pl 
         LEFT JOIN comentario_planta AS cp ON pl.id_planta=cp.id_planta GROUP BY cp.id_planta;`;
      mysqlConeccion.query(query,(err,registros)=>{
          if(!err){
           console.log(registros.lenght)
             res.json(registros);
          }else{
             console.log(err);
          }
       })
      }
   })
 });








 //ruta de prueba de generación de TOKEN
 function verificarToken(req,res,next){
 const BearerHeader= req.headers ['authorization']
 if(typeof BearerHeader!=='undefined'){
    const bearerToken= BearerHeader.split(" ")[1]
    req.token= bearerToken;
    next();
 }else{
  res.sendStatus(403);
 }
 } 

 
// lista huertas 
router.get('/huertas', (req,res)=>{
    let query= 'select * from huerta';
     mysqlConeccion.query(query, (err,rows)=>{
        if(!err){
           res.json(rows);
           console.log(rows);
        }else{
           console.log(err)
        }
     });
    }
 );

 // lista plantas
 router.get('/plantas', (req,res)=>{
    let query= 'select * from plantas';
     mysqlConeccion.query(query, (err,rows)=>{
        if(!err){
           res.json(rows);
           console.log(rows);
        }else{
           console.log(err)
        }
     });
    }
 );











 module.exports=router;