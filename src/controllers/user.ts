"use strict";

import { Request, Response } from "express";
const User = require("../models/user");
const Token = require("../models/token");
const passwordEncrypt = require("../helpers/passwordEncrypt");

export interface AuthUser extends Request {
  user?: {
    is_superadmin?: boolean;
    _id?: string;
  };
}
module.exports = {
  list: async (req: AuthUser, res: Response) => {
    /*
            #swagger.tags = ["Users"]
            #swagger.summary = "List Users"
            
        */

    const data = await User.find();

    res.status(200).send({
      error: false,
      data,
    });

    // FOR REACT PROJECT:
    // res.status(200).send(data)
  },

  create: async (req: Request, res: Response) => {
    /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Create User"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    "username": "test",
                    "password": "1234",
                    "email": "test@site.com",
            
                }
            }
        */

    // Disallow setting admin

    // req.body.is_superadmin = false

    // Create token for auto-login:

    const data = await User.create(req.body);

    const tokenData = await Token.create({
      user_id: data._id,
      token: passwordEncrypt(data._id + Date.now()),
    });
    res.status(201).send({
      error: false,
      token: tokenData.token,
      data,
    });

    // FOR REACT PROJECT:
    // res.status(201).send({
    //     error: false,
    //     token: tokenData.token,
    //     ...data._doc
    // })
  },

  read: async (req: AuthUser, res: Response) => {
    /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Get Single User"
        */

    const filters = req.user?.is_superadmin
      ? { _id: req.params.id }
      : { _id: req.user?._id };

    const data = await User.findOne(filters);

    res.status(200).send({
      error: false,
      data,
    });
  },

  update: async (req: AuthUser, res: Response) => {
    /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Update User"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    "username": "test",
                    "password": "1234",
                    "email": "test@site.com",
                    "box":[],
                    "purchase":[]
                  
                }
            }
        */

    const filters = req.user?.is_superadmin
      ? { _id: req.params.id }
      : { _id: req.user?._id };
    req.body.is_superadmin = req.user?.is_superadmin
      ? req.body.is_superadmin
      : false;

    if (req.body.process) {
      const user = await User.findOne(filters);

      if (req.body.process == "add") {
        const filteredBox = user.box.filter(
          (item: any) => item.id == req.body.item.id
        );

        if (filteredBox.length) {
          const filteredItem = filteredBox[0];

          const newBox = user.box.map((item: any) =>
            item.id == filteredItem.id
              ? { ...item, piece: item.piece + 1 }
              : item
          );

          //    console.log(newBox);

          const data = await User.updateOne(
            filters,
            { box: newBox },
            { runValidators: true }
          );
          res.status(202).send({
            error: false,
            data,
            new: await User.findOne(filters),
          });
        } else {
          user.box.push({ ...req.body.item, piece: 1 });
          const data = await User.updateOne(
            filters,
            { box: user.box },
            { runValidators: true }
          );
          res.status(202).send({
            error: false,
            data,
            new: await User.findOne(filters),
          });
        }
      } else if (req.body.process == "remove") {
        const newBox = user.box.map((item: any) =>
          item.id == req.body.item.id
            ? { ...item, piece: item.piece - 1 }
            : item
        );
        const data = await User.updateOne(
          filters,
          { box: newBox },
          { runValidators: true }
        );
        res.status(202).send({
          error: false,
          data,
          new: await User.findOne(filters),
        });
      } else if (req.body.process == "delete") {
        const newBox = user.box.filter(
          (item: any) => item.id !== req.body.item.id && item
        );
        const data = await User.updateOne(
          filters,
          { box: newBox },
          { runValidators: true }
        );
        res.status(202).send({
          error: false,
          data,
          new: await User.findOne(filters),
        });
      } else if (req.body.process == "buy"){

        const newBox = user.box.map((item: any) => ({ ...item, date: new Date() }) );
        const data = await User.updateOne(
          filters,
          { box: [], purchases: [...user.purchases, ...newBox] },
          { runValidators: true }
        );
        res.status(202).send({
          error: false,
          data,
          new: await User.findOne(filters),
        });

      }
    } else {
      const data = await User.updateOne(filters, req.body, {
        runValidators: true,
      });

      res.status(202).send({
        error: false,
        data,
        new: await User.findOne(),
      });
    }
  },

  delete: async (req: AuthUser, res: Response) => {
    /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Delete User"
        */

    const filters = req.user?.is_superadmin
      ? { _id: req.params.id }
      : { _id: req.user?._id };

    const data = await User.deleteOne();

    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
      data,
    });
  },
};
