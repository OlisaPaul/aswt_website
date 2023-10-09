const { Appointment } = require("../model/appointment.model");
const appointmentService = require("../services/appointment.services");
const userService = require("../services/user.services");
const serviceService = require("../services/service.services");
const entryService = require("../services/entry.services");
const { errorMessage, successMessage } = require("../common/messages.common");
const { MESSAGES, errorAlreadyExists } = require("../common/constants.common");
const appointmentServices = require("../services/appointment.services");
const customerService = require("../services/customer.service");

class AppointmentController {
  async getStatus(req, res) {
    res.status(200).send({ message: MESSAGES.DEFAULT, success: true });
  }

  //Create a new appointment
  async createAppointment(req, res) {
    const { staffId, startTime, endTime, description, customerEmail } =
      req.body;

    const [staff] = await userService.getUserByRoleAndId(staffId, "staff");

    if (!staff) return res.status(404).send(errorMessage("staff"));

    const appointment = await appointmentServices.createAppointment({
      staff,
      customerEmail,
      endTime,
      startTime,
      description,
    });

    res.send(successMessage(MESSAGES.CREATED, appointment));
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
