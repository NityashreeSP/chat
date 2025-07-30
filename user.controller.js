import User from "../models/User.js";
import friendRequest from "../models/FriendRequest.js";
import FriendRequest from "../models/FriendRequest.js";
import { populate } from "dotenv";

export async function getRecommendedUsers(req, res) {
    try{
         const currentUserId = req.user.id;
        const currentUser = req.user;

        const recommendendUsers = await User.find({
            $and:[
                {_id: {$ne: currentUserId}}, //excludes current user
                {_id :{$nin: currentUser.friends}},//excludes 
                {isOnboarded : true}
            ]
        })
        res.status(200).json(recommendendUsers)
    }catch{
       console.error("error in getRecommendedUsers controller ", error.message);
        res.status(500).json({message:"internal server error"});
    }
}

export async function getMyFriends(req, res) {
    try{
        const user = await User.findById(req.user.id).
        select("friends")
        .populate("friends"," full.name profilePic nativeLanguage LearningLanguage" );

        res.status(200).json(user.friends);

    }
    catch(error){
        console.error("error in getMyFriend controller ", error.message);
        res.status(500).json({message:"internal server error"});
    }
}

export async function sendFriendRequest(req, res){
    try{
        const myId = req.user.id;
        const {id: recipientId} = req.params
    if(myId === recipientId ){
        return res.status(400).json({message : "you can't send friend request to yourself"});
    }

    const recipient = await User.findById(recipientId)
    if(!recipient){
        return res.status(404).json({message : "User not found"});
    }
    

    if(recipient.friends.includes(myId)){
        return res.status(400).json({message : "you are already friend with this user"});
    }

    //check if request is already sent
    const existingRequest = await FriendRequest.findOne({
        $or:[
            {sender:myId, recipient:recipientId},
            {sender:recipientId, recipient:myId}
        ]
    });

    if(existingRequest){
        return res.status(400).json({message : "your friend request is already exist between you and user"});
    }


    const FriendRequest = await FriendRequest.create({
        sender:myId,
        recipient:recipientId,
    });

    return res.status(400).json(friendRequest)
    }catch(error){
        console.error("error in sendFriendRequest  controller", error.message);
        res.status(500).json({message:"internal server error"});
        
    }
}

export async function acceptFriendRequest(req, res){
    try{
        const {id:requestId} = req.params
        const friendRequest = await FriendRequest.findById(requestId);

        if(!friendRequest){
            return res.status(404).json({message : "friend request not found"});
        }

        if(!friendRequest.recipient.toString() !== req.user.id){
            return res.status(403).json({message : "you are not authorised to accept this request"});
        }

        friendRequest.status = "accepted";
        await friendRequest.save();

        //add each user to others friends array
        
        await User.findByIdAndUpdate(friendRequest.sender,{
            $addToSet : {friends : friendRequest.recipient}
        })

        await User.findByIdAndUpdate(friendRequest.recipient,{
            $addToSet : {friends : friendRequest.sender},
        })

        return res.status(400).json({message : "friend request accepted"});
       
}
    catch (error){
        console.log("error in acceptFriendRequest controller", error.message);
        return res.status(403).json({message : "Internal server error"});

    }
}

export async function getFriendRequests (req, res){
    try{
        const incomingreqs = await FriendRequest.find({
            recipient: req.user.id,
            status:pending,
        }) .populate("friends"," fullName profilePic nativeLanguage LearningLanguage" );

        const acceptedReqs = await FriendRequest.find({
            recipient: req.user.id,
            status:pending,
        }) .populate("friends"," fullName profilePic" );
        res.status(200).json({incomingreqs, acceptedReqs});
    }
    catch(error){
        console.log("error in getPendingFriendRequests controller", error.message);
        return res.status(403).json({message : "Internal server error"});

    }
}

export async function getOutgoingFriendRequests (req, res){
    try{
        const OutgoingRequests = await FriendRequest.find({
            sender: req.user.id,
            status:pending,
        }) .populate("friends"," fullName profilePic nativeLanguage LearningLanguage" );
        res.status(200).json({OutgoingRequests});
    }
    catch(error){
        console.log("error in getOutgoingFriendRequests  controller", error.message);
        return res.status(403).json({message : "Internal server error"});
    }
}