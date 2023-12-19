"use strict"

import mongoose from 'mongoose'
/* ------------------------------------------------------- *
{
    "username": "admin",
    "password": "aA*123456",
    "email": "admin@site.com",
    "first_name": "admin",
    "last_name": "admin",
    "is_active": true,
    "is_staff": true,
    "is_superadmin": true
}

{
    "username": "test",
    "password": "aA*123456",
    "email": "test@site.com",
    "first_name": "test",
    "last_name": "test",
    "is_active": true,
    "is_staff": false,
    "is_superadmin": false
}
/* ------------------------------------------------------- */
// User Model:

const UserSchema = new mongoose.Schema({

    username: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        index: true
    },

    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        index: true
    },
    
    password: {
        type: String,
        trim: true,
        required: true
    },
    
    box:[],

    purchases:[],

    is_active: {
        type: Boolean,
        default: true
    },

    is_superadmin: {
        type: Boolean,
        default: false
    },

}, { collection: 'users', timestamps: true })

/* ------------------------------------------------------- */
// Schema Configs:

const passwordEncrypt = require('../helpers/passwordEncrypt')

UserSchema.pre('save', function (next) {

    // get data from "this" when create;
    // if process is updateOne, data will receive in "this._update"
    const data = this

    // email@domain.com
    const isEmailValidated = data.email
        ? /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.email) // test from "data".
        : true

    if (isEmailValidated) {

        if (data?.password) {

            // pass == (min 1: lowerCase, upperCase, Numeric, @$!%*?& + min 8 chars)
            const isPasswordValidated = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.]).{8,}$/.test(data.password)

            if (isPasswordValidated) {

                this.password = data.password = passwordEncrypt(data.password)

            } else {

                next(new Error('Password not validated.'))
            }
        }

        next() // Allow to save.

    } else {

        next(new Error('Email not validated.'))
    }
})


UserSchema.pre('findOneAndUpdate', async function (next) {
    const update:any = this.getUpdate();
    let password = update.password;
  
    const isEmailValidated = update.email
    ? /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(update.email) // test from "data".
    : true

if (isEmailValidated) {

    if (!password) {
        return next();
      }

    if (password) {

        // pass == (min 1: lowerCase, upperCase, Numeric, @$!%*?& + min 8 chars)
        const isPasswordValidated = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.]).{8,}$/.test(password)

        if (isPasswordValidated) {

         const  cryptedPassword = passwordEncrypt(password)

         this.setUpdate({ ...update, password: cryptedPassword })

        } else {

            next(new Error('Password not validated.'))
        }
    }

    next() // Allow to save.

} else {

    next(new Error('Email not validated.'))
}
})
/* ------------------------------------------------------- */
interface IUserDocument extends mongoose.Document {
    username: string;
    password: string;
    createds?: string; // Yeni eklenen değişken
  }
UserSchema.pre('init', function (data:any) {

    
    data.createds = data.createdAt.toLocaleDateString('tr-tr')
  
  });
  
  
  
module.exports = mongoose.model('User', UserSchema)
