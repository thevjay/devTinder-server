const express = require('express');
const { userAuth } = require('../middleware/auth');
const paymentRouter = express.Router();
const razorpayInstance = require('../utils/razorpay')
const Payment = require('../models/payment')
const {membershipAmount}=require('../utils/constants')
const {validateWebhookSignature} = require('razorpay/dist/utils/razorpay-utils');
const User = require('../models/user');


paymentRouter.post('/payment/create',userAuth,async(req,res)=>{
    try{
        const { membershipType } = req.body;
        const { firstName,lastName,emailId}=  req.user;

        const order = await razorpayInstance.orders.create({
            amount:membershipAmount[membershipType]*100,
            currency:"INR",
            receipt:"receipt#1",
            notes:{
                firstName,
                lastName,
                emailId,
                membershipType: membershipType,
            },
        })

        // Save it in my database
        console.log(order)
        

        const payment = new Payment({
            userId:req.user._id,
            orderId:order.id,
            status:order.status,
            amount:order.amount,
            currency:order.currency,
            receipt:order.receipt,
            notes:order.notes
        })

        const savedPayment = await payment.save();
        // Return back my order details to frontend
        res.json({...savedPayment.toJSON(),keyId:process.env.RAZORPAY_KEY_ID});
    }
    catch(error){
        console.error(error)
        return res.status(500).json({
            message:error.message,
        })
    }
})

paymentRouter.post('/payment/webhook',async(req,res)=>{
    try{
        const webhookSignature = req.get("X-Razorpay-Signature");

        const isWebhookValid = validateWebhookSignature(JSON.stringify(req.body), webhookSignature, process.env.RAZORPAY_WEBHOOK_SECRET)

        if(!isWebhookValid){
            return res.status(403).json({
                msg:"Webhook signature is invalid"
            })
        }

        // Update my payment status in DB
        const paymentDetails =  req.body.payload.payment.entity;
        console.log("paymentDetails webhook",paymentDetails)

         // Find payment in DB
        const payment = await Payment.findOne({ orderId: paymentDetails.order._id})
        if (!payment) {
            return res.status(404).json({ msg: "Payment record not found in database" });
        }

        // Update payment status
        payment.status = paymentDetails.status;
        await payment.save();

        // Find user in DB
        const user = await User.findOne({_id:payment.userId})
        if (!user) {
            return res.status(404).json({ msg: "User not found in database" });
        }

         // Update user membership
        user.isPremium = true;
        user.membershipType = payment.notes.membershipType;

        await user.save();  // Ensure user data is saved
        console.log(`User ${user._id} upgraded to Premium`);

        // Update the user as premium

       

        // if(req.body.event == 'payment.captured'){

        // }
        // if(req.body.event == 'payment.failed'){

        // }

        // return success response to razorpay webhook
        return res.status(500).json({
            msg:"Webhook received successfully"
        })
    }
    catch(error){
        console.error("webhook error",error)
        return res.status(500).json({
            msg:error.message
        })
    }
})



paymentRouter.get('/premium/verify',userAuth,async(req,res)=>{
    try{

        const user = req.user.toJSON();
        console.log(user)
        if(user.isPremium){
            return res.json({...user})
        }
        return res.json({...user})
    }
    catch(error){
        console.error(error);
    }
})


module.exports = paymentRouter;
