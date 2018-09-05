var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

// default options
app.use(fileUpload());

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');



//Rutas

app.put('/:tipo/:id', function(req, res) {

	var tipo = req.params.tipo;
	var id = req.params.id;

	//Tipos de coleccion
	var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

	if(tiposValidos.indexOf(tipo) == -1) {
		 return res.status(400).json({
    	ok: false,
    	mensaje: 'Colección no válida',
    	errors: {message: 'Las colecciones validas son: '+tiposValidos.join(', ')}
    });
	}

  if (!req.files){

    return res.status(400).json({
    	ok: false,
    	mensaje: 'No seleccionó nada',
    	errors: {message: 'Debe seleccionar una imagen'}
    });

  }

  //Obtener nombre de archivo
  var archivo = req.files.imagen;
  var nombreCortado = archivo.name.split('.');
  var extensionArchivo = nombreCortado[nombreCortado.length-1];

  //Solo estas extensiones aceptamos:
  var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg', 'bmp'];

  if(extensionesValidas.indexOf(extensionArchivo) == -1){
  	return res.status(400).json({
    	ok: false,
    	mensaje: 'Extensión no válida',
    	errors: {message: 'Las extensiones validas son: '+extensionesValidas.join(', ')}
    });
  }

  //Nombre archivo personalizado
  var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

  //Mover el archivo del temporal a un path
  var path = `./uploads/${tipo}/${nombreArchivo}`;

  archivo.mv(path, err => {
  	if(err){
  		return res.status(500).json({
	    	ok: false,
	    	mensaje: 'Error al mover archivo',
	    	errors: err
	    });
  	}

  	subirPorTipo(tipo, id, nombreArchivo, res);

  	/*res.status(200).json({
  		ok:  true,
  		mensaje: 'Archivo movido'
  	});*/

  });

});


function subirPorTipo(tipo, id, nombreArchivo, res){

	if(tipo == 'usuarios'){
		Usuario.findById(id, (err, usuario) => {

			if(!usuario){
				return res.status(400).json({
					ok: false,
					mensaje: 'Usuario no existe',
					errors: {message: 'Usuario no existe'}
				});
			}


			var pathViejo = './uploads/usuarios/'+usuario.img;

			//Si existe, elimina la imagen anterior
			if(fs.existsSync(pathViejo)){
				fs.unlink(pathViejo);
			}

			usuario.img = nombreArchivo;

			usuario.save((err, usuarioActualizado) => {
				usuario.password = ':)';
				return res.status(200).json({
					ok: true,
					mensaje: 'Imagen de usuario actualizada',
					usuario: usuarioActualizado
				});
			});
		});

	}else if(tipo == 'medicos'){

		Medico.findById(id, (err, medico) => {

			if(!medico){
				return res.status(400).json({
					ok: false,
					mensaje: 'Medico no existe',
					errors: {message: 'Medico no existe'}
				});
			}

			var pathViejo = './uploads/medicos/'+medico.img;

			//Si existe, elimina la imagen anterior
			if(fs.existsSync(pathViejo)){
				fs.unlink(pathViejo);
			}

			medico.img = nombreArchivo;

			medico.save((err, usuarioActualizado) => {
				return res.status(200).json({
					ok: true,
					mensaje: 'Imagen de medico actualizada',
					medico: usuarioActualizado
				});
			});
		});  

	}else if(tipo == 'hospitales'){

		Hospital.findById(id, (err, hospital) => {

			if(!hospital){
				return res.status(400).json({
					ok: false,
					mensaje: 'Hospital no existe',
					errors: {message: 'Hospital no existe'}
				});
			}


			var pathViejo = './uploads/hospitales/'+hospital.img;
 
			//Si existe, elimina la imagen anterior
			if(fs.existsSync(pathViejo)){
				fs.unlink(pathViejo);
			}

			hospital.img = nombreArchivo;

			hospital.save((err, usuarioActualizado) => {
				return res.status(200).json({
					ok: true,
					mensaje: 'Imagen de hospital actualizada',
					hospital: usuarioActualizado
				});
			});
		});


	}

}



module.exports = app;