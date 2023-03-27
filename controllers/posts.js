import express from 'express';
import mongoose from 'mongoose';

import Message from '../models/postMessage.js';

const router = express.Router();

const ok=200;
const Not_found = 404;
const conflict = 409;
const created = 201;


export const getPosts = async (req, res) => { 
    try {
        const postMessages = await Message.find();
                
        res.status(ok).json(postMessages);
    } catch (error) {
        res.status(Not_found).json({ message: error.message });
    }
}



export const createPost = async (req, res) => {
    const post = req.body;

    const newPostMessage = new Message({ ...post ,createdAt: new Date().toISOString() })

    try {
        await newPostMessage.save();

        res.status(created).json(newPostMessage );
    } catch (error) {
        res.status(conflict).json({ message: error.message });
    }
}

export const updatePost = async (req, res) => {
    const { id } = req.params;
    const { title, message, creator, selectedFile} = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(Not_found).send(`No post with id: ${id}`);

    const updatedPost = { creator, title, message ,selectedFile, _id: id };

    await Message.findByIdAndUpdate(id, updatedPost, { new: true });

    res.json(updatedPost);
}

export const deletePost = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(Not_found).send(`No post with id: ${id}`);

    await Message.findByIdAndRemove(id);

    res.json({ message: "Post deleted successfully." });
}

export const likePost = async (req, res) => {
    const { id } = req.params;
    //const likes=[];
    
    try{
       if (!req.userId) {
            return res.json({ message: "Unauthenticated" });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(Not_found).send(`No post with id: ${id}`);
        
        const post = await Message.findById(id);

        const index =  post.likes.findIndex((id) => id === String(req.userId));

        if (index === -1) {
        post.likes.push(req.userId);
        } else {
        post.likes = post.likes.filter((id) => id !== String(req.userId));
        }
        const updatedPost = await Message.findByIdAndUpdate(id, post, { new: true });
        res.status(ok).json(updatedPost);
    } catch (error) {
        console.log("error catched");
    }
}


export default router;