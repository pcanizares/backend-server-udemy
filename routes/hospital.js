var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');


//RUTAS

//==========================================
//Obtener todos los hospitales
//==========================================
app.get('/', (req, res, next) => {

	var desde = req.query.desde || 0;

	desde = Number(desde);

	Hospital.find({ }, 'nombre img usuario')
		.skip(desde)
		.limit(5)
		.populate('usuario', 'nombre email')
		.exec((err, hospitales) => {

			if(err){
				return res.status(500).json({
					ok: false,
					mensaje: 'Error cargando hospitales',
					errors: err
				});
			}

			Hospital.count({}, (err, conteo) => {

				res.status(200).json({
					ok: true,
					hospitales: hospitales,
					total: conteo
				});

			});
		});
});


//==========================================
//Obtener hospital por id
//==========================================
app.get('/:id', (req, res) => {
	var id = req.params.id;

	Hospital.findById(id)
		.populate('usuario', 'nombre img email')
		.exec((err, hospital) => {
			if(err){
				return res.stauts(500).json({
					ok: false,
					mensaje: 'Error al buscar hospital',
					errors: err
				});
			}

			if(!hospital){
				return res.stauts(400).json({
					ok: false,
					mensaje: 'No existe un hospital con ese id',
					errors: err
				});
			}

			res.status(200).json({
				ok: true,
				hospital: hospital
			});


		});
});



 

//==========================================
//Insertar un nuevo hospital
//==========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
	var body = req.body;


	var hospital = new Hospital({
		nombre: body.nombre,
		img: body.img,
		usuario: req.usuario._id
	});

	hospital.save((err, hospitalGuardado) => {
		if(err){
			return res.status(400).json({
				ok:false,
				mensaje: 'Error al crear hospital',
				errors: err
			});
		}

		res.status(201).json({
			ok:true,
			hospital: hospitalGuardado,
			usuariotoken: req.usuario
		});

	});

});

//==========================================
//Actualizar un nuevo
//==========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
	var id = req.params.id;
	var body = req.body;

	Hospital.findById(id, (err, hospital) => {
		if(err){
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar hospital',
				errors: err
			});
		}

		if(!hospital){
			return res.status(400).json({
				ok: false,
				mensaje: 'El hospital con el id '+id+' no existe',
				errors: {mensaje: 'No existe un hospital con ese ID'}
			});
		}else{
			/*if(hospital.usuario != req.usuario._id){
				return res.status(403).json({
					ok: false,
					mensaje: 'No tienes permisos para editar este hospital',
					errors: err
				});
			}*/
		}


		hospital.nombre = body.nombre;
		hospital.usuario = req.usuario._id;

		hospital.save((err, hospitalGuardado) => {
			if(err){
				return res.status(400).json({
					ok: false,
					mernsaje: 'Error al actualizar hospital',
					errors: err
				});
			}

			res.status(200).json({
				ok: true,
				hospital: hospitalGuardado
			});


		});

	});

});


//==========================================
//Eliminar un hospital
//==========================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

	var id = req.params.id;
	/*Hospital.findById(id, (err, hospital) => {
		if(err){
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar el hospital',
				errors: err
			});
		}

		if(hospital){
			if(req.usuario._id != hospital.usuario){
				return res.status(403).json({
					ok: false,
					mensaje: 'No tienes permiso para borrar este hospital',
					errors: err
				});
			}
		}
	});*/


	Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

		if(err){
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al borrar hospital',
				errors: err
			});
		}

		if(!hospitalBorrado){
			return res.status(400).json({
				ok: false,
				mensaje: 'No existe un hospital con ese id',
				errors: err
			});
		}

		res.status(200).json({
			ok: true,
			hospital: hospitalBorrado
		});

	});

});








module.exports = app;