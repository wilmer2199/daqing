module.exports = {

    isLoggedIn(req, res, next){    // isloggedin estara en las rutas si el usuario esta logueado 
        if (req.isAuthenticated ()) {     // esto es para proteger las rutas
            return next();

        } 
        return res.redirect ('/signin');
    }, 
    
    isNotLoggeIn(req, res, next) {
        if (!req.isAuthenticated ()) {    // este metodo se usa para que el usuario no vea algunas rutas 
            return next ();                // cuando ya esta logueado
        }
        return res.redirect('/redirect-after-login');

    },


    // ¡¡¡NUEVO MIDDLEWARE PARA VERIFICAR EL ROL DE ADMINISTRADOR!!!
    isAdmin(req, res, next) {
        console.log('Dentro de middleware isAdmin');
         console.log('isAdmin - req.isAuthenticated():', req.isAuthenticated()); // <-- Añade este
        // Primero, verifica si el usuario está autenticado.
        // Después, verifica si el rol del usuario autenticado es 'Admin'.
        if (req.isAuthenticated()) {
        console.log('isAdmin - req.user.rol:', req.user.rol); // <-- Añade este
         }

        if (req.isAuthenticated() && req.user.rol === 'Admin') {
            console.log('isAdmin - Acceso concedido para Admin.'); // <-- Añade este
            return next(); // Si es un administrador, permite el acceso a la siguiente función de la ruta.
        }
        // Si no está autenticado O su rol no es 'Admin', niega el acceso.
        console.log('isAdmin - Acceso denegado. No es Admin o no autenticado.'); // <-- Añade este
        req.flash('message', 'Acceso denegado. Solo administradores.');
        return res.redirect('/signin'); // O puedes redirigirlo a una página de "Acceso Prohibido"
    }
};


