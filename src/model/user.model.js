const _ = require("lodash");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Joi = require("joi");
require("dotenv").config();

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    minlength: 4,
    maxlength: 255,
    trim: true,
    required: true,
  },
  lastName: {
    type: String,
    minlength: 4,
    maxlength: 255,
    trim: true,
    required: true,
  },
  password: {
    type: String,
    minlength: 5,
    maxlength: 1024,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    minlength: 5,
    maxlength: 255,
    trim: true,
    required: true,
  },
  avatarUrl: {
    type: String,
    required: true,
  },
  avatarImgTag: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["freelancer", "company"],
    required: true,
  },
  freelancer: {
    billingRate: Number,
    jobTitle: String,
    phoneNumber: String,
    totalRating: Number,
    amountOfGignex: Number,
    projects: { type: [mongoose.Schema.Types.ObjectId], ref: "job" },
  },
  company: {
    name: String,
    jobs: { type: [mongoose.Schema.Types.ObjectId], ref: "job" },
  },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      isAdmin: this.isAdmin,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      role: this.role,
      avatarUrl: this.avatarUrl,
      freelancer: this.freelancer,
      company: this.company,
    },
    process.env.jwtPrivateKey
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function validate(user) {
  const schema = Joi.object({
    firstName: Joi.string().min(4).max(255).required(),
    lastName: Joi.string().min(4).max(255).required(),
    password: Joi.string().min(5).max(1024).required(),
    email: Joi.string().email().min(5).max(255).required(),
    userName: Joi.string().min(4).max(255).required(),
    role: Joi.string()
      .min(4)
      .max(255)
      .required()
      .valid("freelancer", "company")
      .insensitive(),
    freelancer: Joi.object({
      billingRate: Joi.number().required(),
      jobTitle: Joi.string().required(),
      phoneNumber: Joi.string().required(),
      totalRating: Joi.number().required(),
      amountOfGignex: Joi.number().required(),
      projects: Joi.array().items(Joi.objectId().required()),
    }).when("role", { is: "freelancer", then: Joi.required() }),
    company: Joi.object({
      name: Joi.string().required(),
      jobs: Joi.array().items(Joi.objectId().required()),
    }).when("role", { is: "freelancer", then: Joi.optional() }),
  });

  return schema.validate(user);
}

function validatePatch(user) {
  const schema = Joi.object({
    firstName: Joi.string().min(4).max(255),
    lastName: Joi.string().min(4).max(255),
    password: Joi.string().min(5).max(1024),
    userName: Joi.string().min(4).max(255),
    eth: Joi.string().min(4).max(255),
    cohort: Joi.string().min(4).max(4),
    email: Joi.string().email().min(5).max(255),
    learningTrack: Joi.string()
      .min(4)
      .max(255)
      .valid("backend", "frontend", "product design", "web3")
      .insensitive(),
    role: Joi.string()
      .min(4)
      .max(255)
      .required()
      .valid("student", "educator")
      .insensitive(),
    freelancer: Joi.object({
      billingRate: Joi.number(),
      jobTitle: Joi.string(),
      phoneNumber: Joi.string(),
      totalRating: Joi.number(),
    }),
    company: Joi.object({
      name: Joi.string(),
    }),
  });

  return schema.validate(user);
}

exports.validatePatch = validatePatch;
exports.validate = validate;
exports.User = User;
