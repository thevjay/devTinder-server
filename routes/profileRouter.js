const express=require("express")
const route=express.Router();
const {userAuth} =require('../middleware/auth')

const { validateEditProfileData } = require('../utils/validation')

route.get('/profile/view',userAuth,async(req,res)=>{
    try{

        // const cookies=req.cookies;

        // const {token}=cookies;

        // if(!token){
        //     throw new Error("Invalid Token")
        // }
        // //validation my token
        // //verify(token,secret key)
        // const decodedMessage=await jwt.verify(token,"kjbfkjdbkjds")  

        // const { _id }=decodedMessage;

        // const user=await User.findById(_id)

        const user = req.user;

        res.send(user)
    }
    catch(error){
        res.status(400).send("ERROR :" + error.message);
    }
})

route.put('/profile/edit', userAuth, async ( req, res ) => {
    
    try{
        
        if(!validateEditProfileData(req)){
            throw new Error("Invalid Edit Request")
        }

        const loggedInUser = req.user;

        Object.keys(req.body).forEach((key) => (
            loggedInUser[key] = req.body[key]
        ))

        //console.log(loggedInUser)

        await loggedInUser.save()

        res.json({
            message: `${ loggedInUser.firstName }, your profile updated successfuly`,
            data: loggedInUser,
        })
    }
    catch(error){
        res.status(400).send("ERROR : " + error.message);
    }
})
module.exports=route;