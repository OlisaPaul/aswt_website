const express = require("express");
const appointmentControllers = require("../controllers/appointment.controllers");
const freeTimeSlotControllers = require("../controllers/freeTimeSlot.controllers");
const router = express.Router();
const validateMiddleware = require("../middleware/validate.middleware");
const {
  validate,
  validateAvailableTimeSlot,
} = require("../model/appointment.model");

router.post(
  "/",
  validateMiddleware(validate),
  appointmentControllers.createAppointment
);

router.post("/available-time-slots", freeTimeSlotControllers.getFreeTimeSlots);

module.exports = router;
