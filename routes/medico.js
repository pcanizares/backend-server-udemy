var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');


//RUTAS

//==========================================
//Obtener todos los medicos
//==========================================
app.get('/', (req, res, next) => {

	var desde = req.query.desde || 0;

	desde = Number(desde);

	Medico.find({}, 'nombre img usuario hospital')
	.skip(desde)
	.limit(5)
	.populate('usuario', 'nombre email')
	.populate('hospital', 'nombre')
	.exec((err, medicos) => {
		if(err){
			return res.status(500).json({
				ok: false,
				mensaje:'Error cargando médicos',
				errors: err
			});
		}

		Medico.count({}, (err, conteo) => {

			res.status(200).json({
				ok:true,
				medicos: medicos,
				total: conteo
			});

		});


	});
});


//==========================================
//Insertar un nuevo medico
//==========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

	var body = req.body;

	var medico = new Medico({
		nombre: body.nombre,
		img: body.img,
		usuario: req.usuario,
		hospital: body.hospital
	});

	medico.save((err, medicoGuardado) => {
		if(err){
			return res.status(400).json({
				ok: false,
				mensaje:'Error al crear el médico',
				errors: err
			});
		}

		res.status(200).json({
			ok: true,
			medico: medicoGuardado,
			usuariotoken: req.usuario._id
		});

	});

});


//==========================================
//Actualizar un nuevo
//==========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

	var id = req.params.id;
	var body = req.body;

	Medico.findById(id, (err, medico) => {

		if(err){
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar el medico',
				errors: err
			});
		}

		if(!medico){
			return res.status(400).json({
				ok: false,
				mensaje: 'El medico no existe',
				errors: err
			});
		}else{
			/*if(medico.usuario != req.usuario._id){
				return res.status(403).json({
					ok: false,
					mensaje: 'No tienes permisos para editar este medico',
					errors: err
				});
			}*/
		}

		medico.nombre = body.nombre;
		medico.hospital = body.hospital;
		medico.usuario = req.usuario._id;

		medico.save((err, medicoGuardado) => {
			if(err){
				return res.status(400).json({
					ok: false,
					mernsaje: 'Error al actualizar medico',
					errors: err
				});
			}

			res.status(200).json({
				ok:true,
				medico: medicoGuardado
			});
			
		});


		//test 1: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvIjp7InJvbGUiOiJBRE1JTl9ST0xFIiwiX2lkIjoiNWI4ZWI0ZmIyYmQ4YmYwNGM0MDM2NDk5Iiwibm9tYnJlIjoidGVzdDEiLCJlbWFpbCI6InRlc3QxQHRlc3QxLmNvbSIsInBhc3N3b3JkIjoiOikiLCJfX3YiOjB9LCJpYXQiOjE1MzYxMzg2MTMsImV4cCI6MTUzNjE1MzAxM30.m1yh-SLc3eI_9V75XPWFKO8mOY95n46VlSejNQhO0R0
		//test 2: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvIjp7InJvbGUiOiJBRE1JTl9ST0xFIiwiX2lkIjoiNWI4ZWI1MGYyYmQ4YmYwNGM0MDM2NDlhIiwibm9tYnJlIjoidGVzdDIiLCJlbWFpbCI6InRlc3QyQHRlc3QyLmNvbSIsInBhc3N3b3JkIjoiOikiLCJfX3YiOjB9LCJpYXQiOjE1MzYxNDA4NjksImV4cCI6MTUzNjE1NTI2OX0.Qys9LUTqwzWQs97E0cAopkODONfQuR-lChhQEUIQvYU

	});

});


app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

	var id = req.params.id;
	/*Medico.findById(id, (err, medico) => {
		if(err){
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar el medico',
				errors: err
			});
		}

		if(medico){
			if(req.usuario._id != medico.usuario){
				return res.status(403).json({
					ok: false,
					mensaje: 'No tienes permiso para borrar este medico',
					errors: err
				});
			}
		}
	});*/

	Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

		if(err){
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al borrar medico',
				errors: err
			});
		}

		if(!medicoBorrado){
			return res.status(400).json({
				ok: false,
				mensaje: 'No existe un medico con ese id',
				errors: err
			});
		}

		res.status(200).json({
			ok: true,
			medico: medicoBorrado
		});

	});


});



module.exports = app;