import  Jwt  from "jsonwebtoken";
// import {expressjwt} from "jwt-express";
// import { expressjwt } from "express-jwt";
import  JwksClient  from "jwks-rsa";
import JwksRsa from "jwks-rsa";

export const requireAuth=(req,res,next)=>{

    const{authorization}=req.headers;
    if(!authorization){
        console.log('no authorization');
        return res.status(401).json({error:"Authorization Token Required"});
    }
    
    const token = authorization.split(' ')[1];
    try {
        const client= JwksClient({
            jwksUri:`${process.env.AUTH0_DOMAIN}.well-known/jwks.json`
        });
        const getKey=(header,callback)=>{
            client.getSigningKey(header.kid, function(err, key) {
                var signingKey = key.publicKey || key.rsaPublicKey;
                callback(null, signingKey);
              });
        }
        const verified =Jwt.verify(token,getKey,{
            algorithms:"RS256",
            issuer:process.env.AUTH0_DOMAIN,
            audience:process.env.AUTH0_AUDIENCE,
    },(err,decoded)=>{
        if(err){
            throw err;
        }
    })
    next();

    } catch (error) {
        console.log("error occurred " ,error);
        res.status(401).json({error:'Request not authorized'});
    }
}