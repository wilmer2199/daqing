const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require ('../database')
const helpers = require ('../lib/helpers');


passport.use('local.signin', new LocalStrategy({
    usernameField: 'nombre_usuario',
    passwordField: 'contrasena',
    passReqToCallback: true // ¡Necesario para tener acceso a req en la estrategia!

}, async (req, nombre_usuario, contrasena, done) => {
    console.log(req.body);
    const rows = await pool.query('SELECT * FROM inicio WHERE nombre_usuario = ?', [nombre_usuario]);
    if (rows.length > 0) {
        const user = rows[0];
        const validPassword = await helpers.matchPassword(contrasena, user.contrasena);
        if (validPassword) {
            // ¡NO USAR req.flash AQUÍ!
            // Usa el objeto 'info' para pasar el mensaje
            done(null, user, { message: 'Bienvenido ' + user.nombre_usuario });
        } else {
            // ¡NO USAR req.flash AQUÍ!
            done(null, false,{ message: 'Contraseña Incorrecta' });
            
        }
    } else {
        return done(null, false, { message: 'Nombre de usuario no existe' });
    }
}));



passport.use ('local.signup', new LocalStrategy ({
    usernameField: 'nombre_usuario',
    passwordField: 'contrasena',
    passReqToCallback: true

}, async(req, nombre_usuario, contrasena, done) => {
    console.log(req.body);
    const {nombre_completo} = req.body;
    const newUser = {
   
        nombre_usuario,
        contrasena,
        nombre_completo,
        rol: 'Cliente'

   }
   newUser.contrasena = await helpers.encryptPassword(contrasena);
   const result = await pool.query(' INSERT INTO inicio SET ?', [newUser]);
   newUser.id = result.insertId;
   return done (null, newUser  );
}));




passport.serializeUser( (user, done) => {
    done(null,  { id: user.id, rol: user.rol } );
});


passport.deserializeUser(async (idAndRol, done) => {
    try {
        console.log('DESERIALIZE (MySQL): idAndRol recibido:', idAndRol);
        console.log('DESERIALIZE (MySQL): Tipo de idAndRol:', typeof idAndRol);
        console.log('DESERIALIZE (MySQL): Valor de idAndRol.id:', idAndRol.id);

        // 1. Obtener los datos básicos del usuario de la tabla 'inicio'
        // Con el módulo 'mysql', pool.query para SELECT suele devolver directamente el array de filas.
        const inicioUserRows = await pool.query('SELECT id, nombre_usuario, rol FROM inicio WHERE id = ?', [idAndRol.id]);
        
        console.log('DESERIALIZE (MySQL): `inicioUserRows` (resultado de la consulta a `inicio`):', inicioUserRows);
        console.log('DESERIALIZE (MySQL): ¿Es `inicioUserRows` un Array?:', Array.isArray(inicioUserRows));
        console.log('DESERIALIZE (MySQL): Longitud de `inicioUserRows`:', inicioUserRows.length);

        if (inicioUserRows.length === 0) {
            console.error(`DESERIALIZE ERROR (MySQL): Usuario de inicio con ID ${idAndRol.id} no encontrado en la DB.`);
            return done(new Error('Usuario de inicio no encontrado.'), null);
        }

        // Si inicioUserRows es un array de filas, tomamos la primera.
        const inicioUser = inicioUserRows[0]; 
        
        console.log('DESERIALIZE (MySQL): `inicioUser` (objeto final extraído):', inicioUser);
        console.log('DESERIALIZE (MySQL): `inicioUser.rol` (valor):', inicioUser ? inicioUser.rol : 'undefined');

        // Verificación de seguridad adicional
        if (!inicioUser || typeof inicioUser.rol === 'undefined') {
             console.error('DESERIALIZE ERROR (MySQL): Objeto de usuario inicioUser inválido o rol no definido:', inicioUser);
             return done(new Error('Datos de usuario incompletos.'), null);
        }

        let controlId = null; // Inicializamos controlId a null

        // 2. Si el rol es 'Cliente', busca su ID correspondiente en la tabla 'Control'
        if (inicioUser.rol === 'Cliente') {
            const controlRows = await pool.query('SELECT id FROM Control WHERE inicio_id = ?', [inicioUser.id]);
            
            console.log('DESERIALIZE (MySQL): `controlRows` (resultado de la consulta a `Control`):', controlRows);
            console.log('DESERIALIZE (MySQL): Longitud de `controlRows`:', controlRows.length);

            if (controlRows.length > 0) {
                controlId = controlRows[0].id; // ¡Este es el ID de la tabla Control que necesitamos!
            } else {
                console.warn(`DESERIALIZE ADVERTENCIA (MySQL): Cliente de inicio (ID: ${inicioUser.id}) no tiene registro asociado en la tabla Control.`);
            }
        } else {
            // Si el rol no es 'Cliente', asegura que controlId sea null, ya que no aplica.
            controlId = null; 
        }

        // 3. Construir el objeto `req.user` con toda la información relevante
        const fullUserObject = {
            id: inicioUser.id,           // ID de la tabla 'inicio' (ID de autenticación)
            nombre_usuario: inicioUser.nombre_usuario,
            rol: inicioUser.rol,
            control_id: controlId       // ID de la tabla 'Control' (será null si es Admin o si no se encontró un registro de control)
        };

        console.log('Deserialized User Object (MySQL - FINAL):', fullUserObject);

        done(null, fullUserObject); // Pasamos el objeto de usuario completo a Passport

    } catch (e) {
        console.error("DESERIALIZE ERROR CATASTRÓFICO (MySQL):", e);
        done(e, null); // Pasa el error a Passport para que maneje la autenticación fallida
    }
});






//passport.deserializeUser( async (idAndRol, done) =>{
    //try {
    //const rows = await pool.query('SELECT id, nombre_usuario, rol * FROM inicio Where id =?', [idAndRol.id]);
    //const user = rows [0];
    //done(null,  {id:user.id, nombre_usuario: user.nombre_usuario, rol: user.rol} );
// } catch (e) {
    //done (e,null)
    //}
//});


   // const rows = await pool.query('SELECT * FROM inicio Where id =?', [id]);
   //asi es como deberia ir pero arroja el error // done (null, rows [0]);

//});    Error: Failed to deserialize user out of session 
//para quitar ese error se usa done(null, id);  este es solo para solucionar.