const appointmentService = require("../services/appointment.services");
const userService = require("../services/user.services");
const {
  errorMessage,
  successMessage,
  jsonResponse,
} = require("../common/messages.common");
const { MESSAGES } = require("../common/constants.common");
const freeTimeSlotServices = require("../services/freeTimeSlot.services");
const freeTimeSlotControllers = require("./freeTimeSlot.controllers");

class AppointmentController {
  async getStatus(req, res) {
    res.status(200).send({ message: MESSAGES.DEFAULT, success: true });
  }

  //Create a new appointment
  async createAppointment(req, res) {
    const { startTime, endTime, description, customerEmail } = req.body;
    const { formattedDate: date, formattedTime: timeString } =
      freeTimeSlotServices.getFormattedDate(startTime);

    const startTimeInDecimal = freeTimeSlotServices.convertTimetoDecimal({
      timeString,
    });

    let staffIds = await userService.fetchIdsOfStaffsWhoCanTakeAppointments();
    if (staffIds.length > 0) {
      staffIds = staffIds.map((staffId) => staffId.toString());
    } else {
      return jsonResponse(
        res,
        404,
        false,
        "No staff is available to take apointments"
      );
    }

    const availableTimeSlots =
      await freeTimeSlotControllers.generateFreeTimeSlots({
        staffIds,
        date,
      });

    if (availableTimeSlots.length < 1)
      return jsonResponse(
        res,
        400,
        false,
        "No free time slot for the date you selected"
      );
    if (!availableTimeSlots.includes(timeString))
      return jsonResponse(
        res,
        400,
        false,
        "The time you selected has already been taken"
      );

    const freeTimeSlots =
      await freeTimeSlotServices.getFreeTimeSlotsBySlotAndDate({
        date,
        timeSlot: timeString,
      });

    const timeSlots = freeTimeSlots.timeSlots;
    const freeTimeSlotId = freeTimeSlots._id;
    const staffId = freeTimeSlots.staffId;

    const timeSlotsInDecimal =
      freeTimeSlotServices.convertTimeArrayToDecimal(timeSlots);
    const freeTimeSlotInDecimal =
      freeTimeSlotServices.updateFreeTimeSlotsInDecimal({
        timeSlotsInDecimal,
        startTimeInDecimal,
      });
    const updatedTimeSlots = freeTimeSlotServices.convertDecimalArrayToTime(
      freeTimeSlotInDecimal
    );

    freeTimeSlots.timeSlots = updatedTimeSlots;

    await freeTimeSlotServices.updateFreeTimeSlotById(
      freeTimeSlotId,
      freeTimeSlots
    );

    const appointment = await appointmentService.createAppointment({
      staffId,
      customerEmail,
      endTime,
      startTime,
      description,
    });

    res.send(successMessage(MESSAGES.CREATED, appointment));
  }

  async getAvailableTimeSlots(req, res) {
    const { staffIds, startTime, endTime } = req.body;

    const overlappingAppointments =
      await appointmentService.getOverlappingAppointments({
        staffIds,
        startTime,
        endTime,
      });

    const allAppointments = await appointmentService.getAllAppointments({
      overlappingAppointments,
    });

    // console.log(allAppointments);

    const availableTimeSlots = appointmentService.getAvailableTimeSlots({
      allAppointments,
      startTime,
      endTime,
    });

    res.send(successMessage(MESSAGES.FETCHED, availableTimeSlots));
  }

  //get appointment from the database, using their email
  async getAppointmentById(req, res) {
    const appointment = await appointmentService.getAppointmentById(
      req.params.id
    );
    if (!appointment) return res.status(404).send(errorMessage("appointment"));

    res.send(successMessage(MESSAGES.FETCHED, appointment));
  }

  async getAppointmentByEntryIdAndStaffId(req, res) {
    const { entryId, staffId } = req.body;

    const appointment =
      await appointmentService.getAppointmentByEntryIdAndStaffId(
        entryId,
        staffId
      );
    if (!appointment) return res.status(404).send(errorMessage("appointment"));

    res.send(successMessage(MESSAGES.FETCHED, appointment));
  }

  //get all entries in the appointment collection/table
  async fetchAllAppointments(req, res) {
    const entries = await appointmentService.getAllAppointments();

    res.send(successMessage(MESSAGES.FETCHED, entries));
  }

  //Update/edit appointment data
  async updateAppointment(req, res) {
    const appointment = await appointmentService.getAppointmentById(
      req.params.id
    );
    if (!appointment) return res.status(404).send(errorMessage("appointment"));

    let updatedAppointment = req.body;
    updatedAppointment = await appointmentService.updateAppointmentById(
      req.params.id,
      updatedAppointment
    );

    res.send(successMessage(MESSAGES.UPDATED, updatedAppointment));
  }

  //Delete appointment account entirely from the database
  async deleteAppointment(req, res) {
    const appointment = await appointmentService.getAppointmentById(
      req.params.id
    );
    if (!appointment) return res.status(404).send(errorMessage("appointment"));

    await appointmentService.deleteAppointment(req.params.id);

    res.send(successMessage(MESSAGES.DELETED, appointment));
  }
}

module.exports = new AppointmentController();
