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
const { VALID_TIME_SLOTS } =
  require("../common/constants.common").FREE_TIME_SLOTS;

class AppointmentController {
  async getStatus(req, res) {
    res.status(200).send({ message: MESSAGES.DEFAULT, success: true });
  }

  //Create a new appointment
  createAppointment = async (req, res) => {
    const { startTime } = req.body;
    let { formattedDate: date, formattedTime: timeString } =
      freeTimeSlotServices.getFormattedDate(startTime);

    const startTimeInDecimal = freeTimeSlotServices.convertTimetoDecimal({
      timeString,
    });

    const availableTimeSlots =
      await freeTimeSlotControllers.generateFreeTimeSlots({
        date,
        res,
      });

    if (availableTimeSlots.statusCode) return;

    const validateAvailableTimeSlots = this.validateAvailableTimeSlots(
      res,
      availableTimeSlots,
      timeString
    );
    if (validateAvailableTimeSlots) return;

    const staffId = await this.updateFreeTimeSlots(
      timeString,
      startTimeInDecimal,
      date
    );

    const appointment = await appointmentService.createAppointment({
      body: req.body,
      staffId,
    });

    res.send(successMessage(MESSAGES.CREATED, appointment));
  };

  async updateFreeTimeSlots(timeString, startTimeInDecimal, date) {
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
    return staffId;
  }

  validateAvailableTimeSlots(res, availableTimeSlots, timeString) {
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

  async getAppointmentsByDate(req, res) {
    const { date } = req.params;

    const appointments = await appointmentService.getAppointmentByDate({
      date,
    });

    res.send(successMessage(MESSAGES.FETCHED, appointments));
  }

  //Update/edit appointment data
  updateAppointment = async (req, res) => {
    const { startTime } = req.body;
    const appointment = await this.getAppointment(req, res);

    const { freeTimeSlots, formattedTime, formattedDate } =
      await this.getFreeTimeSlotsByDateAndStaffId(appointment);

    if (startTime) {
      const updatedTimeSlots = await this.retriveFreeTimeSlots(
        freeTimeSlots,
        formattedTime
      );

      freeTimeSlots.timeSlots = updatedTimeSlots;

      await freeTimeSlots.save();

      let { formattedDate: date, formattedTime: timeString } =
        freeTimeSlotServices.getFormattedDate(startTime);

      const availableTimeSlots =
        await freeTimeSlotControllers.generateFreeTimeSlots({
          date,
          res,
        });

      if (availableTimeSlots.statusCode) return;

      const validateAvailableTimeSlots = this.validateAvailableTimeSlots(
        res,
        availableTimeSlots,
        timeString
      );
      if (validateAvailableTimeSlots) return;

      const staffId = await this.updateFreeTimeSlots(
        timeString,
        startTimeInDecimal,
        date
      );
    }

    let updatedAppointment = req.body;
    updatedAppointment = await appointmentService.updateAppointmentById(
      req.params.id,
      updatedAppointment
    );

    res.send(successMessage(MESSAGES.UPDATED, updatedAppointment));
  };

  //Delete appointment account entirely from the database
  cancelAppointment = async (req, res) => {
    const appointment = await this.getAppointment(req, res);
    if (appointment.statusCode) return;

    const { freeTimeSlots, formattedTime } =
      await this.getFreeTimeSlotsByDateAndStaffId(appointment);

    const updatedTimeSlots = await this.retriveFreeTimeSlots(
      freeTimeSlots,
      formattedTime
    );
    freeTimeSlots.timeSlots = updatedTimeSlots;

    await freeTimeSlots.save();

    await appointmentService.deleteAppointment(req.params.id);

    res.send(successMessage(MESSAGES.DELETED, appointment));
  };

  async getFreeTimeSlotsByDateAndStaffId(appointment) {
    const { staffId, startTime } = appointment;

    const { formattedDate, formattedTime } =
      freeTimeSlotServices.getFormattedDate(startTime);

    const freeTimeSlots =
      await freeTimeSlotServices.fetchFreeTimeSlotsByDateAndStaffId({
        staffId,
        date: formattedDate,
      });

    return { freeTimeSlots, formattedTime, formattedDate };
  }

  async getAppointment(req, res) {
    const appointment = await appointmentService.getAppointmentById(
      req.params.id
    );

    if (!appointment) {
      return res.status(404).send(errorMessage("appointment"));
    }

    return appointment;
  }

  async retriveFreeTimeSlots(freeTimeSlots, formattedTime) {
    const startTimeInDecimal = freeTimeSlotServices.convertTimetoDecimal({
      timeString: formattedTime,
    });

    const timeSlotsInDecimal =
      freeTimeSlotServices.convertTimeArrayToDecimal(VALID_TIME_SLOTS);

    const retrievedTimeSlotsInDecimal =
      freeTimeSlotServices.reverseUpdateFreeTimeSlots(
        startTimeInDecimal,
        timeSlotsInDecimal
      );

    const retrievedTimeSlot = freeTimeSlotServices.convertDecimalArrayToTime(
      retrievedTimeSlotsInDecimal
    );
    const curentFreeTimeSlots = freeTimeSlots.timeSlots;

    const updatedTimeSlots = [
      ...new Set(
        [...retrievedTimeSlot, ...curentFreeTimeSlots].sort((a, b) => a - b)
      ),
    ];

    return updatedTimeSlots;
  }
}

module.exports = new AppointmentController();
