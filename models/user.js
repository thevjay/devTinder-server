const mongoose=require('mongoose')
const validator=require("validator")
const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt')

const userSchema= new mongoose.Schema({
    firstName:{
        type:String,
        required:true , //required field is takes boolen or fun return boolen it is used to create a document on db mandotary fields 
        index:true,
        minlength:4,
        maxlength:50
    },
    lastName:{
        type:String
    },
    emailId:{
        type:String,
        required:true,
        unique:true,//if we add unique is true it is autometically creates index:true
        trim:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid email address" + value)
            }
        }
    },
    password:{
        type:String,
        required:true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Invalid password value" + value)
            }
        }
    },
    age:{
        type:String,
        min:18,
    },
    gender:{
        type:String,
        enum:{
            values:["male","female","other"],
            message:`{value} is not a valid gender type`,
        },
        // validate(value){
        //     if(["male","famale","others"].includes(value)){
        //         throw new Error("Gender data is not validate")
        //     }
        // },
    },
    isPremium:{
        type:Boolean,
        default:false,
    },
    membershipType:{
        type:String,
    },
    photoUrl:{
        type:String,
        default:'https://geographyandyou.com/images/user-profile.png',
        validate(value){
            if(!validator.isURL(value)){
                throw new Error("It is not valid String" + value)
            }
        }
    },
    about:{
        type:String,
        default: "This is a default about of the User"
    },
    skills:{
        type:[String],
    }
},{timestamps : true})


//compound index
//User.find({firstName:"Saini",lastName:"ninne"})

// userSchema.index({firstName:1,lastName:1});
// userSchema.index({gender:1});
                      
userSchema.methods.getJWT = async function(){
    const user=this;

    const token = await jwt.sign({_id: user._id },"fsd",{expiresIn:'7h'})

    return token;
}

userSchema.methods.validatePassword=async function (passwordInputByUser) {
    const user=this;
    const passwordHashed=user.password;

    try{
        const isPasswordValid=await bcrypt.compare(
            passwordInputByUser,
            passwordHashed
        );    
       
        return isPasswordValid;
    }catch(error){
        throw new Error("Password validation failed")
    }
}

module.exports=mongoose.model("User",userSchema);

