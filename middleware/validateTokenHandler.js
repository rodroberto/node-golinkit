const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const validateToken = asyncHandler(async (req, res, next) => {
    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      res.status(401);
      return;
    }
    
    token = authHeader.split(" ")[1];
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.log('err', err)
        res.status(401);
        return;
      }
      req.user = decoded.user;
      next();
    });
  });

module.exports = validateToken;
