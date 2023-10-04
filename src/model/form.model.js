const _ = require("lodash");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Joi = require("joi");
require("dotenv").config();

const formSchema = new mongoose.Schema({
  customerName: {
    type: String,
    minlength: 4,
    maxlength: 255,
    trim: true,
    required: true,
  },
  customerEmail: {
    type: String,
    minlength: 5,
    maxlength: 255,
    trim: true,
    required: true,
  },
});

const Form = mongoose.model("Form", formSchema);

function validate(form) {
  const schema = Joi.object({
    customerName: Joi.string().min(4).max(255).required(),
    customerEmail: Joi.string().email().min(5).max(255).required(),
  });

  return schema.validate(form);
}

function validatePatch(form) {
  const schema = Joi.object({
    customerName: Joi.string().min(4).max(255),
    customerEmail: Joi.string().email().min(5).max(255),
  });

  return schema.validate(form);
}

exports.validatePatch = validatePatch;
exports.validate = validate;
exports.Form = Form;
