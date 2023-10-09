const { Appointment } = require("../model/appointment.model");

class AppointmentService {
  //Create new appointment
  async createAppointment({
    staff,
    customerEmail,
    startTime,
    endTime,
    description,
  }) {
    const appointment = new Appointment({
      staff,
      customerEmail,
      endTime,
      startTime,
      description,
    });

    return await appointment.save();
  }

  async getAppointmentById(appointmentId) {
    return await Appointment.findById(appointmentId);
  }

  getOverlappingAppointments = async ({ staffIds, startTime, endTime }) => {
    const overlappingAppointments = await Appointment.find({
      staff: { $in: staffIds },
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
    let currentFreeSlot = { startTime };

    for (const event of allAppointments) {
      if (event.isStart) {
        // If the current free slot has a duration, add it to the available time slots
        if (currentFreeSlot.endTime) {
          availableTimeSlots.push({
            startTime: currentFreeSlot.startTime,
            endTime: event.time,
          });
        }
        // Update the current free slot start time
        currentFreeSlot.startTime = event.time;
        currentFreeSlot.endTime = null;
      } else {
        // Update the current free slot end time
        currentFreeSlot.endTime = event.time;
      }
    }

    // If there's a remaining free slot at the end of the day, add it
    if (currentFreeSlot.endTime === null) {
      availableTimeSlots.push({
        startTime: currentFreeSlot.startTime,
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

  async getAllAppointments() {
    return await Appointment.find().sort({ _id: -1 });
  }

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
