import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/users.js';

const ok=200;
const Not_found = 404;
const badRequest = 400;
const serverError =500;

export const signin = async (req, res) => {
    const { email, password } = req.body;
    try{
        console.log("signin");

        const existingUser = await User.findOne({ email});
        if(!existingUser) return res.status(Not_found).json({ message: "User doesnot exist"}) ;
        
        const IsPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if(!IsPasswordCorrect)return res.status(badRequest).json({ message: "Invalid credential"});
            
        const token = jwt.sign({email:existingUser.email, id: existingUser._id} ,'winner', {expiresIn:"1hr"});
        res.status(ok).json({ token});

    } catch(error){
        res.status(serverError).json({message:'somethng went wrong'});

    }

}

export const signup = async  (req, res) => {
    const{email, password, confirmPassword, firstName, lastName} = req.body;
    try{
        const existingUser = await User.findOne({ email});
        if(existingUser) return res.status(400).json({ message: "User already exist"}) ;

        if(password !== confirmPassword) return res.status(400).json({ message: "passwords don't match"}) ;
        const hashedPassword = await bcrypt.hash(password,12);
        const result =await User.create({email, password: hashedPassword,name:`${firstName}  ${lastName}`});

        res.status(200).json({ result});
    }catch(error) {
        res.status(500).json({message:'somethng went wrong'});

    }

}