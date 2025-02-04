const express=require('express')
const route=express.Router()
const {userAuth}=require("../middleware/auth");
const ConnectionRequest = require('../models/connectionRequest');
const User=require('../models/user')


route.post('/request/send/:status/:toUserId',userAuth,async(req,res)=>{
    try{
        const fromUserId=req.user._id;
        const toUserId=req.params.toUserId;
        const status=req.params.status;

        const allowedStatus = ["ignored","interested"]
        if(!allowedStatus.includes(status)){
            return res.json({message:"Invalid status type :" + status})
        }

        const toUser= await User.findById(toUserId);
        if(!toUser){
            return res.status(404).json({
                success:true,
                message:"User not found! "
            })
        }


        //if there is an existing ConnectionRequest
        const existingConnectionRequest=await ConnectionRequest.findOne({
            $or:[
                { fromUserId, toUserId},
                { fromUserId: toUserId, toUserId: fromUserId },
            ],
        })

        if(existingConnectionRequest){
            return res.status(400).send({
                message:"Connection Request Already Exists!!"
            })
        }

        const connectionRequest=new ConnectionRequest({
            fromUserId,
            toUserId,
            status,
        })

        const data = await connectionRequest.save();

        //sending a connection request
        res.json({
            message: req.user.firstName + "is" + status + "in" + toUser.firstName,
            data,
        })
    }
    catch(error){
        res.status(400).send("Error in :" + error.message)
    }
})

route.post('/request/review/:status/:requestId',userAuth,async(req,res)=>{
    try{
        const loggedUser=req.user;
        const {status,requestId}=req.params;

        // Validate the status
        const allowedStatus=["accepted",'rejected']
        if(!allowedStatus.includes(status)){
            return res.status(400).json({
                success:false,
                message:"Status not allowed"
            })
        }

        const connectionRequest=await ConnectionRequest.findOne({
            _id:requestId,
            toUserId:loggedUser._id,
            status:'interested',
        })
        if(!connectionRequest){
            return res.status(404).json({
                success:false,
                message:"Connection request not found"
            })
        }

        connectionRequest.status=status;

        const data=await connectionRequest.save()

        res.json({
            message:"Connection request" + status,
            data
        })

        // Akshy => Elon
        // loggedInId = toUserId
        // status =interested
        // request Id should be valid

    }
    catch(error){
        res.status(400).send("ERROR: " + err.message);
    }
})


module.exports=route;