// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


//Inicializar variables
var app = express();


//CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  next();
});



//Body-parser
//parse application/x-www/form/urlencoded
app.use(bodyParser.urlencoded({extend: false}));

//parse application/json
app.use(bodyParser.json());





//Importar rutas 
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');


//Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
	if(err){
		throw err;
	}else {
		console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
	}
});


//Server index config  -- Si se descomenta, ver localhost:3000/uploads..... ahi salen todas las fotos
//var serveIndex = require('serve-index');
//app.use(express.static(__dirname+'/'));
//app.use('/uploads', serveIndex(__dirname+ '/uploads'));



//Rutas
app.use('/imagenes', imagenesRoutes);
app.use('/upload', uploadRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/medico', medicoRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);




// Escuchar peticiones
app.listen(3000, () => {
	console.log('Express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});
