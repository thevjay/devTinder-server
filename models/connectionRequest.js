const mongoose=require('mongoose')

const connectionRequestSchema=new mongoose.Schema({

    fromUserId: {
        type : mongoose.Schema.Types.ObjectId,
        ref  : "User",  // reference to the user collection
        required:true,
    },
    toUserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    status:{
        type:String,
        enum:{
            values:["ignore","interested","accepted","rejected"],
            message:`{value} is Required`
        },
        required:true,
    }
},{
    timestamps:true
 }
)

//compound index
// ConnectionRequest.find({fromUserId : 281726373839 , toUserId : 2387484990})

connectionRequestSchema.index({fromUserId :1 , toUserId :1});

connectionRequestSchema.pre("save", function (next) {
    const connectionRequest=this;
    //Check if the fromUserId is same as toUserId
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error("Cannot send connection request to yourself")
    }
    next();
})

module.exports=mongoose.model("ConnectionRequest",connectionRequestSchema)