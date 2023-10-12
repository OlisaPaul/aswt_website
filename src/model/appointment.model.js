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

const dealershipCarDetailsSchema = new mongoose.Schema({
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
  vin: {
    type: String,
    minlength: 5,
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
    enum: ["dealership", "commercial"],
    required: true,
  },
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
  dealershipCarDetails: {
    type: dealershipCarDetailsSchema,
    default: undefined,
  },
});

addVirtualIdUtils(appointmentSchema);

appointmentSchema.pre("validate", function (next) {
  if (this.appointmentType === "dealership" && !this.dealershipCarDetails) {
    this.invalidate(
      "dealershipCarDetails",
      "dealershipCarDetails is required for dealership appointments"
    );
  }
  next();
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

function validate(appointment) {
  const schema = Joi.object({
    appointmentType: Joi.string()
      .valid("dealership", "commercial")
      .insensitive()
      .required(),
    customerEmail: Joi.string().email().required(),
    startTime: Joi.date().required(),
    endTime: Joi.date().required(),
    description: Joi.string().max(255).min(3),
    dealershipCarDetails: Joi.object({
      year: Joi.string().min(4).max(4).required(),
      make: Joi.string().min(1).max(255).required(),
      vin: Joi.string().min(5).max(255).required(),
      model: Joi.string().min(1).max(255).required(),
    }).when("appointmentType", {
      is: "dealership",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
  });

  return schema.validate(appointment);
}

function validatePatch(appointment) {
  const schema = Joi.object({
    appointmentType: Joi.string()
      .valid("dealership", "commercial")
      .insensitive(),
    staffIds: Joi.array().items(Joi.objectId().required()),
    startTime: Joi.date().required(),
    description: Joi.string().max(255).min(3),
    dealershipCarDetails: Joi.object({
      year: Joi.string().min(4).max(4),
      make: Joi.string().min(1).max(255),
      vin: Joi.string().min(5).max(255),
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
