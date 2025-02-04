const socket = require('socket.io')
const crypto = require('crypto');
const { Chat } = require('../models/chat');
const ConnectionRequest = require('../models/connectionRequest')

const getSecretRoomId = (userId, targetUserId) => {
   return crypto
    .createHash("sha256")
    .update([userId,targetUserId].sort().join('_'))
    .digest('hex')
};

const initializeSocket = (server) =>{
    const io = socket(server,{
        cors:{
            origin:process.env.FRONTEND_URL,
        },
    })
    
    io.on('connection',(socket)=>{
        // Handle events
        socket.on("joinChat",({ firstName,userId, targetUserId }) => { 
            // Create a room
            const roomId = getSecretRoomId(userId, targetUserId);

            console.log(firstName + " Joining Room : " + roomId);
            socket.join(roomId);
        });

        socket.on(
            "sendMessage",async({
            firstName,lastName,userId,targetUserId,text })=>{
                const roomId = getSecretRoomId(userId,targetUserId);
                console.log(firstName +" " + text)

                // Save message to the database
                try{

                    // Check if userId & target UserId are friends
                    //TODO:ConnectionRequest.findOne({fromUserId:userId,toUserId:targetUserId,status:"accepted"},{})

                    let chat = await Chat.findOne({
                        participants:{$all:[userId,targetUserId]},
                    })

                    if(!chat){
                        chat = new Chat({
                            participants:[userId,targetUserId],
                            messages: [],
                        })
                    }

                    chat.messages.push({
                        senderId:userId,
                        text:text,
                    })

                    await chat.save();
                }
                catch(error){
                    console.log(error);
                }

                io.to(roomId).emit("messageReceived",{ firstName,lastName,text})
        });

        socket.on("disconnect",()=>{

        })
    })
}

module.exports = initializeSocket;