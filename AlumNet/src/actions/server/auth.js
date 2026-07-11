'use server';

import { dbConnect } from "@/lib/dbConnect";
import bcrypt, { hash } from 'bcryptjs'

export const postUser = async (payload) => {

    // 1 check user exist or not
    const isExist = await dbConnect('users').findOne({ email: payload.email })
    if (isExist) return {
        success: false,
        message:'user already existed'
        
    }

    const hashPassword = await bcrypt.hash(payload.password, 10)
  

    // 2 create new user

    const newUser = {
        ...payload,
        createdAt: new Date().toString(),
        role: 'user',
        password:hashPassword
    }
    console.log(newUser);


    // 3 send user to database


    const result = await dbConnect('users').insertOne(newUser);
    if (result.acknowledged) {
        return {
          success: true,
          message: `user create with ${result.insertedId.toString()}`,
        };
    } else {
         return {
           success: false,
           message: `Something went wrong, try again`,
         };
    }
}