const express = require('express');
const { Chat } = require('../models/chat');
const { userAuth } = require('../middleware/auth');

const chatRoute = express.Router();

chatRoute.get('/chat/:targetUserId',userAuth,async(req,res)=>{
    const {targetUserId } = req.params;
    const userId = req.user._id;

    try{
        let chat = await Chat.findOne({
            participants:{$all:[userId,targetUserId]},
        }).populate({
            path:"messages.senderId",
            select: "firstName lastName"
        })

        if(!chat){
            chat = new Chat({
                participants:[userId,targetUserId],
                messages:[],
            })
            await chat.save();
        }

        res.json(chat)
    }
    catch(error){
        console.log(error);
    }
})

module.exports = chatRoute;

