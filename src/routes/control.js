const express = require('express');
const router = express.Router();

const {handlebars1} = require ('../lib/handlebars1');

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');


router.get('/add', isLoggedIn, (req, res) => {
    res.render('links/add');

});

router.post('/add', isLoggedIn, async (req, res) => {
    const { numero_registro, nombre_empresa, nombre_apellido,  cedula_rif, telefono, placa_vehiculo, hora_entrada, hora_salida, firma, fecha_registro, observaciones} = req.body;
    const newControl = {
        numero_registro,
        nombre_empresa,
        nombre_apellido,
        cedula_rif,
        telefono,
        placa_vehiculo,
        hora_entrada,
        hora_salida,
        firma,
        fecha_registro: new Date(),
        observaciones,
        inicio_id: req.user.id   //este es para enlazar una tarea con un usuario, para que la sesion sea individual
    };
    await pool.query('INSERT INTO control set?', [newControl]);
    req.flash('success', 'Ah sido registrado exitosamente!');
    res.redirect('/links');
});

router.get('/', isLoggedIn, async (req, res) => {
    const control = await pool.query('SELECT * FROM control WHERE inicio_id =?', [req.user.id]);
    res.render('links/lits', { control });
});

router.get('/delete/id/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM control WHERE ID = ?', [id]);
    req.flash('success', 'Registro eliminado exitosamente');
    res.redirect('/links');

});

// esta ruta nova !!!!

router.get('/crearsolicitud/id/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM servicios WHERE ID = ?', [id]);  
    req.flash('success', 'Empezar Solicitud');
    res.redirect('/links1/add1');

});

// 

router.get('/edit/id/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const control = await pool.query('SELECT * FROM control WHERE ID = ?', [id]);
    res.render('links/edit', { control: control[0] });

});

router.post('/edit/id/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { numero_registro, nombre_empresa, nombre_apellido,  cedula_rif, telefono, placa_vehiculo, hora_entrada, hora_salida, firma, fecha_registro, observaciones } = req.body;
    const newControl = {
        numero_registro,
        nombre_empresa,
        nombre_apellido,
        cedula_rif,
        telefono,
        placa_vehiculo,
        hora_entrada,
        hora_salida,
        firma,
        fecha_registro: new Date(),
        observaciones

    };

    await pool.query('UPDATE control set ? WHERE id =?', [newControl, id]);
    req.flash('success', 'Registro actualizado exitosamente');
    res.redirect('/links');
});


module.exports = router;