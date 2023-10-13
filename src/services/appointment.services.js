const { Appointment } = require("../model/appointment.model");
const entryUtils = require("../utils/entry.utils");

class AppointmentService {
  //Create new appointment
  async createAppointment({ body, staffId }) {
    let { startTime, endTime } = body;

    startTime = new Date(startTime);
    endTime = new Date(endTime);

    const appointment = new Appointment({
      staffId,
      ...body,
    });

    return await appointment.save();
  }

  async getAppointmentById(appointmentId) {
    return await Appointment.findById(appointmentId);
  }

  async getAppointmentByDate({ date }) {
    const { endDate, startDate } = entryUtils.getDateRange({
      type: "day",
      date,
    });
    return Appointment.find({
      startTime: { $gte: startDate, $lt: endDate },
    });
  }

  getOverlappingAppointments = async ({ staffIds, startTime, endTime }) => {
    endTime = new Date(endTime);
    startTime = new Date(startTime);

    const overlappingAppointments = await Appointment.find({
      staffId: { $in: staffIds },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    return overlappingAppointments;
  };

  getAllAppointments({ overlappingAppointments }) {
    const allAppointments = overlappingAppointments.reduce(
      (acc, appointment) => {
        acc.push({ time: appointment.startTime, isStart: true });
        acc.push({ time: appointment.endTime, isStart: false });
        return acc;
      },
      []
    );

    return allAppointments.sort((a, b) => a.time - b.time);
  }

  getAvailableTimeSlots({ allAppointments, startTime, endTime }) {
    const availableTimeSlots = [];
    let isInsideAppointment = false;
    let currentSlotStart = startTime;

    for (const event of allAppointments) {
      if (event.isStart) {
        if (!isInsideAppointment) {
          // Start of a new appointment, add available time slot
          availableTimeSlots.push({
            startTime: currentSlotStart,
            endTime: event.time,
          });
        }
        // Update currentSlotStart for the next available time slot
        currentSlotStart = event.time;
        isInsideAppointment = true;
      } else {
        // End of the current appointment, update isInsideAppointment flag
        isInsideAppointment = false;
      }
    }

    // If there's a remaining free slot at the end of the day, add it
    if (currentSlotStart < endTime && !isInsideAppointment) {
      availableTimeSlots.push({
        startTime: currentSlotStart,
        endTime,
      });
    }

    return availableTimeSlots;
  }

  async validateAppointmentIds(appointmentIds) {
    const appointments = await Appointment.find({
      _id: { $in: appointmentIds },
    });

    const foundIds = appointments.map((d) => d._id.toString());

    const missingIds = appointmentIds.filter((id) => !foundIds.includes(id));

    return missingIds;
  }

  async getAppointmentByEntryIdAndStaffId(entryId, staffId) {
    return await Appointment.findOne({ entryId, staffId });
  }

  // async getAllAppointments() {
  //   return await Appointment.find().sort({ _id: -1 });
  // }

  async updateAppointmentById(id, appointment) {
    return await Appointment.findByIdAndUpdate(
      id,
      {
        $set: appointment,
      },
      { new: true }
    );
  }

  async deleteAppointment(id) {
    return await Appointment.findByIdAndRemove(id);
  }
}

module.exports = new AppointmentService();
