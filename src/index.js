const express = require ('express');
const morgan = require ('morgan');
const {engine} = require('express-handlebars');   
const path = require ('path');
const session = require('express-session');
const flash = require('connect-flash');
const MySQLStore = require ('express-mysql-session')(session);
const passport = require('passport');
const {database} =  require('./keys');
const { appendFile } = require('fs');
const router = require('./routes/auth');

// inicializacion del sistema 
const app = express ();
require ('./lib/passport');


require('./lib/handlebars');


// configuracion, del motor de vistas
app.set('views', path.join(__dirname,'views'));
app.engine('.hbs', engine({
    defaultLayout: 'main',
    layoutsDir: path.join (app.get ('views'), 'layouts'),
    partialsDir: path.join(app.get ('views'), 'partials'),
    extname: '.hbs',
    helpers: require ('./lib/handlebars'),
    cache: false,
    
}));

app.set('view engine', '.hbs');



// session de middleware funcion que se aejecuta cada que un usuario envie una peticion 
app.use (session ({
    secret: 'daqing',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore (database),
    cookie: {
        secure: false, // <-- ¡ASEGÚRATE QUE ESTO ES FALSE EN DESARROLLO HTTP!
        httpOnly: true,
        // sameSite: 'lax' // Puedes comentar esto también para descartar
    }
}));

app.use(flash());
app.use (express.urlencoded({extended: false}));
app.use (express.json());

app.use(passport.initialize());
app.use(passport.session());
app.use (morgan('dev')); 

app.use ('/' ,require('./routes/auth'));
// varibales globales la primera sera una variable que almacene el nombre de la aplicacion 

app.use ((req, res, next)=>{
    res.locals.success = req.flash('success');
    res.locals.message = req.flash('message');
    res.locals.user = req.user;
    next();
});


// routes  aqui van los puertos de nuestro servidor o las url, las url son las que visita del usuario 


app.use ('/admin', require ('./routes/admin'));

app.use ('/links', require('./routes/control'));
app.use ( require ('./routes/index'));




//public  , aqui se va a colocar todo lo que el navegador puede acceder 
app.use (express.static(path.join (__dirname, 'public')));

// starting the server, una seccion para iniciar el servidor
app.listen(12000)
console.log ('servidor escuchando en el puerto', 12000) 

