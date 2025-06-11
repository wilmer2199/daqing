const express = require('express');
const router = express.Router();

const passport = require('passport');
const {isLoggedIn, isNotLoggeIn, isAdmin} = require ('../lib/auth');
const { connect } = require('mssql');

router.get('/signup' , isNotLoggeIn,(req, res) => {
    res.render('auth/signup');
});


router.post('/signup', isNotLoggeIn, passport.authenticate('local.signup', {
    successRedirect: '/profile',
    failureRedirect: '/signin',
    failureFlash: true 
    
})); 

 

router.get ('/signin', isNotLoggeIn, (req, res) =>{
    res.render('auth/signin');
});


router.post('/signin', isNotLoggeIn, (req, res, next) => {
    passport.authenticate('local.signin', (err, user, info) => {
        if (err) { return next(err); }

        // 'info' contiene el mensaje que pasaste desde la estrategia
        const flashMessage = info ? info.message : 'Mensaje desconocido'; // Evita undefined

        if (!user) { // Fallo de autenticación
            req.flash('message', flashMessage); // ¡req.flash AQUÍ, en la ruta!
            return req.session.save((saveErr) => {
                if (saveErr) console.error('Error al guardar sesión después de fallo:', saveErr);
                res.redirect('/signin');
            });
        }

        // Autenticación exitosa
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            req.flash('success', flashMessage); // ¡req.flash AQUÍ, en la ruta!
            return req.session.save((saveErr) => {
                if (saveErr) console.error('Error al guardar sesión después de éxito:', saveErr);
                res.redirect('/redirect-after-login');
            });
        });
    })(req, res, next);
});





router.get('/profile', isLoggedIn, (req, res) => {
    req.flash('success', '!Bienvenido¡');
   res.render ('profile');
});

// ¡¡¡NUEVA RUTA DE REDIRECCIÓN INTELIGENTE!!!
router.get('/redirect-after-login', isLoggedIn, (req, res) => {
    if (req.isAuthenticated()) {
        if (req.user.rol === 'Admin') {
            //  Redirige a la ruta que está protegida por isAdmin
            res.redirect('/admin'); // <-- ¡ APUNTA A LA RUTA /admin!
        } else if (req.user.rol === 'Cliente') {
            res.redirect('links/add');
            
        } else {
            res.redirect('/');
        }
    } else {
        res.redirect('/signin');
    }
});

// ¡¡¡RUTA PROTEGIDA PARA ADMINISTRADORES!!!
// Esta es la ruta a la que debe llegar el admin
router.get('/admin', isLoggedIn, isAdmin, (req, res) => {
    res.render('admin/panel', { 
        title: 'Panel de Administración',
        user: req.user
    });
});

//router.get("/logout", isLoggedIn, (req, res, next) => {
    //req.logOut(req.user, err => {
        //if(err) return next (err);
       //res.redirect("/signin");
   // });
//});

router.get ('/logout', isLoggedIn, (req, res, next) =>{
    req.logOut( (e) =>{
     if (e) return next (e);
        console.error('Error durante el logout:', e);
        //req.flash('success', 'Has cerrado sesión exitosamente.');
        res.redirect('/signin');
    });  
});


router.get ('/acercade', (req, res)  =>{
    res.render ('acercade');
});


module.exports = router;



