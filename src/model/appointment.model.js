const mongoose = require("mongoose");
const Joi = require("joi");
const { User } = require("./user.model");
const addVirtualIdUtils = require("../utils/addVirtualId.utils");
require("dotenv").config();

const paymentDetailsSchema = new mongoose.Schema({
  amountPaid: {
    type: Number,
    default: 0,
  },
  paymentDate: {
    type: Date,
  },
});

const appointmentSchema = new mongoose.Schema({
  customerEmail: {
    type: String,
    ref: User,
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    minlength: 3,
    maxlength: 255,
  },
  paymentDetails: {
    type: paymentDetailsSchema,
    default: undefined,
  },
});

addVirtualIdUtils(appointmentSchema);

const Appointment = mongoose.model("Appointment", appointmentSchema);

function validate(appointment) {
  const schema = Joi.object({
    customerEmail: Joi.string().email().required(),
    staffId: Joi.objectId().required(),
    startTime: Joi.date().required(),
    endTime: Joi.date().required(),
    description: Joi.string().max(255).min(3),
  });

  return schema.validate(appointment);
}

function validateAvailableTimeSlot(appointment) {
  const schema = Joi.object({
    staffIds: Joi.array().items(Joi.objectId().required()),
    startTime: Joi.date().required(),
    endTime: Joi.date().required(),
    description: Joi.string().max(255).min(3),
  });

  return schema.validate(appointment);
}

exports.validate = validate;
exports.validateAvailableTimeSlot = validateAvailableTimeSlot;
exports.Appointment = Appointment;
