import {StreamChat} from "stream-chat";
import "dotenv/config";

const apikey = process.env.STEAM_API_KEY;
const apiSecret = process.env.STEAM_API_SECRET;

if(!apikey || !apiSecret){
    console.error("Stream api key or secret is missing");
}

const streamClient = StreamChat.getInstance(apikey, apiSecret);


export const upsertStreamUser = async (userData)=> {
    try{
        await streamClient.upsertUsers([userData]);
        return userData
    } catch(error)
    {
        console.error("error creating stream user", error);
    }
};

//todo later

export const generateStreamToken = (userId) =>{
    try{
        const userIdStr = userId.toString();
        return streamClient.createToken(userIdStr);
    }catch(error){
        console.error("error generating stream token:" ,error);
    }
};