require("dotenv").config();
const mongoose = require("mongoose");
const Joi = require("joi");
const { User } = require("./user.model");
const addVirtualIdUtils = require("../utils/addVirtualId.utils");

const paymentDetailsSchema = new mongoose.Schema({
  amountPaid: {
    type: Number,
    default: 0,
  },
  paymentDate: {
    type: Date,
  },
});

const carDetailsSchema = new mongoose.Schema({
  year: {
    type: String,
    minlength: 4,
    maxlength: 4,
  },
  make: {
    type: String,
    minlength: 1,
    maxlength: 255,
  },
  model: {
    type: String,
    minlength: 1,
    maxlength: 255,
  },
});

const appointmentSchema = new mongoose.Schema({
  appointmentType: {
    type: String,
    enum: ["auto", "commercial"],
    required: true,
  },
  customerEmail: {
    type: String,
    ref: User,
    required: true,
  },
  customerNumber: {
    type: String,
    required: true,
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
  carDetails: {
    type: carDetailsSchema,
    default: undefined,
  },
  reminderSent: {
    type: Boolean,
    default: false,
  },
});

addVirtualIdUtils(appointmentSchema);

appointmentSchema.pre("validate", function (next) {
  if (this.appointmentType === "auto" && !this.carDetails) {
    this.invalidate(
      "carDetails",
      "carDetails is required for auto appointments"
    );
  }
  next();
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

function validate(appointment) {
  const schema = Joi.object({
    appointmentType: Joi.string()
      .valid("auto", "commercial")
      .insensitive()
      .required(),
    customerEmail: Joi.string().email().required(),
    customerNumber: Joi.string().required(),
    startTime: Joi.date().required(),
    endTime: Joi.date().required(),
    description: Joi.string().max(255).min(3),
    carDetails: Joi.object({
      year: Joi.string().min(4).max(4).required(),
      make: Joi.string().min(1).max(255).required(),
      model: Joi.string().min(1).max(255).required(),
    }).when("appointmentType", {
      is: "auto",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
  });

  return schema.validate(appointment);
}

function validatePatch(appointment) {
  const schema = Joi.object({
    appointmentType: Joi.string().valid("auto", "commercial").insensitive(),
    staffIds: Joi.array().items(Joi.objectId().required()),
    startTime: Joi.date().required(),
    description: Joi.string().max(255).min(3),
    carDetails: Joi.object({
      year: Joi.string().min(4).max(4),
      make: Joi.string().min(1).max(255),
      model: Joi.string().min(1).max(255),
    }).when("appointmentType", {
      is: "commercial",
      then: Joi.forbidden(),
    }),
  });

  return schema.validate(appointment);
}

exports.validate = validate;
exports.validatePatch = validatePatch;
exports.Appointment = Appointment;
