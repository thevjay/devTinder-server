const express=require('express')
const route=express.Router();

const User=require('../models/user')
const bcrypt=require('bcrypt')
const {validateSignUpData}=require('../utils/validation');
const { userAuth } = require('../middleware/auth');



route.post("/signup",async(req,res)=>{
    try{
        //validation of data
        validateSignUpData(req);

        const { firstName, lastName, emailId, password } = req.body;

        //Encrypt the password
        const passwordHashed = await bcrypt.hash(password,10)
        //dummy123 ,encryption  sgabhb86bj7879@@#$ slat rounds it generate the strong hashed code

        //Creating a new instance of the User model
        const user=new User({
            firstName,
            lastName,
            emailId,
            password: passwordHashed,
        });
        
        
       const savedUser = await user.save();
       const token = await savedUser.getJWT();

       res.cookie("token", token,{
        expires: new Date(Date.now() + 1 * 3600000),
        secure: "fsd"
       })

       res.status(200).json({
            success : true,
            message : "User created Successfully",
            data : savedUser
       })
    }
    catch(error){
        console.error(error)
        res.status(500).json({
            message: "failed to create user" + error.message,
        });
    }
    
})


route.post('/login', async (req, res) => {
    try{
        const { emailId, password } = req.body;

        //validation on email id

        //check email is present into db or not
        const user = await User.findOne({ emailId: emailId });
        if(!user){
           return res.status(404).send("Invalid credentials")
        }


        //bcrypt have compare method like it takes bcrypt.compare(req.body.password,hash)
        const isPasswordValid = await user.validatePassword(password);
        if(isPasswordValid){

            //JWT Token - takes HEADER AND PAYLOAD AND VERIFY SIGNATURE(data it is have key value pair of data) to create the token 
            const token=await user.getJWT();
            
            
            //Add the token to cookie and send the response back to the user
            res.cookie("token", token, { httpOnly:true,expires: new Date(Date.now() + 8 * 3600000)});
            res.status(200).json({
                success : true,
                message : "Login Successfully",
                user
            })
            
        }else{
            throw new Error("Invalid creadentials")
        }
    }
    catch(error){
        console.error(error)
        res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
})



route.get('/user',async(req,res)=>{
    const userEmail=req.body.email
    try{
        // {} - it is a filter it is take a filter
        const users=await User.find({ emailId : userEmail})
        if(!users){
            res.status(404).send("User did not Found")
        }else{
            res.send(users);
        }
        
    }catch(error){
        res.status(400).send("Something went Wrong")
    }
})

//Feed API - GET / feed - get all the users from the database
route.get('/feed',async(req,res)=>{
    try{
        const users=await User.find({})

        res.send(users)
    }catch(error){
        res.status(400).send("Something went Wrong")
    }
})


route.delete('/user',async(req,res)=>{
    try{

        const userId=req.body.userId;

        const user=await User.findByIdAndDelete({ _id : userId })

        res.send('User deleted successfully')
    }
    catch(error){
        res.send("Somthing went wrong")
    }
})


route.patch('/user/:userId',async(req,res)=>{
    const data= req.params?.userId;
    const userId= req.body.userId;

    const ALLOWED_UPDATES=["photoUrl","about","gender","age","skills"];

    //{
        // "userId":"1234",
        // "emailId":".com",
        // "gender":"m",
        // "skills":"c++",
        // "xyz":"sk"
    //}

    const isUpdateAllowed=Object.keys(data).every((k)=>{
        ALLOWED_UPDATES.includes(k)
    })

    if(!isUpdateAllowed){
        throw new Error("Update not allowed")
    }

    if(data?.skills.length > 10){
        throw new Error("Skills cannot be more than 10")
    }
    try{
        await User.findByIdAndUpdate({_id:userId}, ...data)

        res.send("User updated Successfully")
    }catch(error){
        res.status(400).send("Something went wrong ")
    }
})

route.post("/logout",userAuth,async(req,res)=>{
    try{
        res.cookie('token',null,{
            expires:new Date(Date.now())
        })

        res.send("Logout Successfully!! ")
    }
    catch(error){
        console.error(error)
    }
})

route


module.exports=route;