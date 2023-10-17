const express = require("express");
const auth = require("../middleware/auth.middleware");
const appointmentControllers = require("../controllers/appointment.controllers");
const freeTimeSlotControllers = require("../controllers/freeTimeSlot.controllers");
const router = express.Router();
const validateMiddleware = require("../middleware/validate.middleware");
const receptionistMiddleware = require("../middleware/receptionist.middleware");
const {
  validate,
  validateAvailableTimeSlot,
} = require("../model/appointment.model");
const validateTimeslotsMiddleware = require("../middleware/validateTimeslots.middleware");
const takenTimeslotsControllers = require("../controllers/takenTimeslots.controllers");

router.post(
  "/",
  validateMiddleware(validate),
  validateTimeslotsMiddleware,
  appointmentControllers.createAppointment
);
router.delete(
  "/:id",
  auth,
  receptionistMiddleware,
  appointmentControllers.cancelAppointment
);

router.get(
  "/:date",
  auth,
  receptionistMiddleware,
  appointmentControllers.getAppointmentsByDate
);

router.post(
  "/available-time-slots",
  takenTimeslotsControllers.getTakenTimeSlots
);
router.put(
  "/clear-out-appointment",
  auth,
  receptionistMiddleware,
  freeTimeSlotControllers.clearOutAppointment
);

module.exports = router;
