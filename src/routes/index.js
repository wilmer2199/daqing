const express = require ('express');
const router = express.Router(); 

router.get ('/',(req, res) =>{
    res.render('auth/signin');
});

module.exports = router; 
