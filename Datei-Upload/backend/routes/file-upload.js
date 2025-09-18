// routes/users.js
const express = require('express');
const router = express.Router();

// Define a route
router.get('/', (req, res) => {
    res.send('this is the file upload route');// this gets executed when user visit http://localhost:3000/file-upload
});


// export the router module so that server.js file can use it
module.exports = router;