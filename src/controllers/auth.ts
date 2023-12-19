"use strict"

// Auth Controller:

import {Request, Response} from "express";
const User = require('../models/user')
const Token = require('../models/token')
const passwordEncrypt = require('../helpers/passwordEncrypt')

 interface ErrRes extends Response {
    errorStatusCode: number // or any other type
  }

module.exports = {

    login: async (req:Request, res:ErrRes) => {
        /*
            #swagger.tags = ["Authentication"]
            #swagger.summary = "Login"
            #swagger.description = 'Login with username (or email) and password for get simpleToken'
            #swagger.parameters["body"] = {
                in: "body",
                required: true,
                schema: {
                    "username": "test",
                    "password": "1234",
                }
            }
        */

        const { username, email, password } = req.body

        if ((username || email) && password) {

            const user = await User.findOne({ $or: [{ username }, { email }] })

            if (user && user.password == passwordEncrypt(password)) {

                if (user.is_active) {


                    // TOKEN:
                    let tokenData = await Token.findOne({ user_id: user._id })
                    if (!tokenData) tokenData = await Token.create({
                        user_id: user._id,
                        token: passwordEncrypt(user._id + Date.now())
                    })

                    res.send({
                        error: false,
                        // FOR REACT PROJECT:
                        key: tokenData.token,
                        // token: tokenData.token,
                        user,
                    })

                } else {

                    res.errorStatusCode = 401
                    throw new Error('This account is not active.')
                }
            } else {

                res.errorStatusCode = 401
                throw new Error('Wrong username/email or password.')
            }
        } else {

            res.errorStatusCode = 401
            throw new Error('Please enter username/email and password.')
        }
    },

    logout: async (req:Request, res:Response) => {
        /*
            #swagger.tags = ["Authentication"]
            #swagger.summary = "simpleToken: Logout"
            #swagger.description = 'Delete token key.'
        */

        const auth = req.headers?.authorization || null // Token ...tokenKey... // Bearer ...accessToken...
        const tokenKey = auth ? auth.split(' ') : null // ['Token', '...tokenKey...'] // ['Bearer', '...accessToken...']

        let message = null, result = {}

        if (tokenKey) {

            if (tokenKey[0] == 'Token') { // SimpleToken

                result = await Token.deleteOne({ token: tokenKey[1] })
                message = 'Token deleted. Logout was OK.'

            } 
        }

        res.send({
            error: false,
            message,
            result
        })
    },

    register:async (req:Request, res:Response) =>{

        /*
            #swagger.tags = ["Authentication"]
            #swagger.summary = "Register"
            #swagger.description = 'Register with username, email) and password for get simpleToken'
            #swagger.parameters["body"] = {
                in: "body",
                required: true,
                schema: {
                    "username": "test",
                    "email": "test@mail.com",
                    "password": "1234",
                }
            }
        */

        req.body.is_superadmin = false

        const data = await User.create(req.body)

        // Create token for auto-login:
        const tokenData = await Token.create({
            user_id: data._id,
            token: passwordEncrypt(data._id + Date.now())
        })

        // res.status(201).send({
        //     error: false,
        //     token: tokenData.token,
        //     data
        // })

        // FOR REACT PROJECT:
        res.status(201).send({
            error: false,
            token: tokenData.token,
            ...data._doc
        })

    }
}