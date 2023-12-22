"use strict"

// Middleware: permissions

import {Request, Response, NextFunction} from "express";

interface AuthUser extends Request {
    user: {
        is_active?:boolean,
        is_superadmin?:boolean
    } // or any other type
  }

  interface ErrRes extends Response {
    errorStatusCode: number // or any other type
  }

module.exports = {

    isLogin: (req:AuthUser, res:ErrRes, next:NextFunction) => {
      

        // any User:
        if (req.user && req.user.is_active) {

            next()

        } else {

            res.errorStatusCode = 403
            throw new Error('NoPermission: You must login.')
        }
    },

    isAdmin: (req:AuthUser, res:ErrRes, next:NextFunction) => {

    
        
        // only Admin:
        if (req.user && req.user.is_active && req.user.is_superadmin) {

            next()

        } else {

            res.errorStatusCode = 403
            throw new Error('NoPermission: You must login and to be Admin.')
        }
    },

}