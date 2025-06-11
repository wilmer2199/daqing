const bcrypt = require ('bcryptjs');

const helpers = {};

helpers.encryptPassword = async (contrasena) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(contrasena, salt);
    return hash;
};

helpers.matchPassword = async(contrasena, savedPassword) =>{
    try {
        return await bcrypt.compare(contrasena, savedPassword);
    } catch (e) {
        console.log(e); 
    }
}

// este es pra hashear contraseñas 
//async function hashAdminPassword() {
   // const salt = await bcrypt.genSalt(10);
  // const hashedPassword = await bcrypt.hash('wilmeradmin', salt);
    //console.log('Contraseña Hasheada para wilmeradmin:', hashedPassword);
//}
    //hashAdminPassword();

    module.exports = helpers;