"use strict"

// app.use(errorHandler):

import {Request, Response, NextFunction} from "express";

interface ErrRes extends Response {
    errorStatusCode: number // or any other type
  }
module.exports = (err:any, req:Request, res:ErrRes, next:NextFunction) => {

    return res.status(res?.errorStatusCode || 500).send({
        error: true,
        message: err.message,
        cause: err.cause,
        body: req.body,
        stack: err.stack
    });
}