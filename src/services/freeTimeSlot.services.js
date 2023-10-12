const { FreeTimeSlot } = require("../model/freeTimeSlot.model");
const mongoose = require("mongoose");
const {
  VALID_TIME_SLOTS,
  COMPLETION_TIME_HOURS,
  START_OF_BUSINESS,
  TIME_OFFSET,
} = require("../common/constants.common").FREE_TIME_SLOTS;

class FreeTimeSlotService {
  //Create new freeTimeSlot
  async createFreeTimeSlot(freeTimeSlot) {
    return await freeTimeSlot.save();
  }

  async addSlotsForStaff({ timeSlotDocuments }) {
    const results = {};

    try {
      const freeTimeSlots = await FreeTimeSlot.insertMany(timeSlotDocuments);
      results.freeTimeSlots = freeTimeSlots;
    } catch (error) {
      console.error("Error inserting documents:", error);
      results.error;
    }

    return results;
  }

  getTimeSlotDocuments({ staffIds, date, clearOut }) {
    console.log(staffIds);
    const timeSlotDocuments = [];

    staffIds.forEach((staffId) => {
      const timeSlotDocument = {
        date,
        staffId: new mongoose.Types.ObjectId(staffId),
        timeSlots: clearOut ? [] : VALID_TIME_SLOTS,
      };
      timeSlotDocuments.push(timeSlotDocument);
    });

    return timeSlotDocuments;
  }

  async getStaffIdsWithoutFreeTimeSlot({ staffIds, date }) {
    const existingSlots = await FreeTimeSlot.find({
      staffId: { $in: staffIds.map((id) => new mongoose.Types.ObjectId(id)) },
      date,
    });

    const staffIdsWithSlot = existingSlots.map((slot) =>
      slot.staffId.toString()
    );

    return staffIds.filter((id) => !staffIdsWithSlot.includes(id));
  }

  async getFreeTimeSlotById(freeTimeSlotId) {
    return await FreeTimeSlot.findById(freeTimeSlotId).select();
  }

  async fetchFreeTimeSlots() {
    return await FreeTimeSlot.find().sort({ _id: -1 });
  }

  fetchFreeTimeSlotsByDate({ date }) {
    return FreeTimeSlot.find({ date }).sort({ _id: -1 });
  }

  fetchFreeTimeSlotsByDateAndStaffId({ date, staffId }) {
    return FreeTimeSlot.findOne({
      date,
      staffId,
    });
  }

  async getFreeTimeSlotsBySlotAndDate({ date, timeSlot }) {
    return await FreeTimeSlot.findOne({
      timeSlots: {
        $elemMatch: {
          $eq: timeSlot,
        },
      },
    });
  }

  async updateFreeTimeSlotById(id, freeTimeSlot) {
    return await FreeTimeSlot.findByIdAndUpdate(
      id,
      {
        $set: freeTimeSlot,
      },
      { new: true }
    );
  }

  async clearOutAppointment(date) {
    return FreeTimeSlot.updateMany({ date }, { $set: { timeSlots: [] } });
  }

  getFormattedDate(date) {
    const dateObject = new Date(date);

    // Get the date in "YYYY-MM-DD" format
    const formattedDate = dateObject.toISOString().split("T")[0];

    // Get the time in "HH:mm" format
    const formattedTime = dateObject
      .toISOString()
      .split("T")[1]
      .substring(0, 5);

    return { formattedDate, formattedTime };
  }

  updateFreeTimeSlotsInDecimal({ timeSlotsInDecimal, startTimeInDecimal }) {
    let timeSlotsGreaterThanCompletionTime = [];

    if (startTimeInDecimal - COMPLETION_TIME_HOURS < START_OF_BUSINESS) {
      timeSlotsGreaterThanCompletionTime = timeSlotsInDecimal.filter(
        (timeSlot) => timeSlot - COMPLETION_TIME_HOURS >= START_OF_BUSINESS
      );
    } else {
      timeSlotsGreaterThanCompletionTime = timeSlotsInDecimal;
    }

    const estimatedFreeTime =
      startTimeInDecimal + COMPLETION_TIME_HOURS - TIME_OFFSET;

    const estimatedBusyTime =
      startTimeInDecimal - COMPLETION_TIME_HOURS + TIME_OFFSET;

    const freeTimeSlots = timeSlotsGreaterThanCompletionTime.filter(
      (timeSlot) => {
        if (timeSlot < estimatedBusyTime) {
          return timeSlot;
        }

        return timeSlot > estimatedFreeTime;
      }
    );

    return freeTimeSlots;
  }

  reverseUpdateFreeTimeSlots = (startTimeInDecimal, timeSlotsInDecimal) => {
    let timeSlotsLessThanStartTime = [];

    if (startTimeInDecimal - COMPLETION_TIME_HOURS < START_OF_BUSINESS) {
      timeSlotsLessThanStartTime = timeSlotsInDecimal.filter(
        (timeSlot) => !(timeSlot - COMPLETION_TIME_HOURS >= START_OF_BUSINESS)
      );
    } else {
      timeSlotsLessThanStartTime = [];
    }

    const estimatedBusyTime =
      startTimeInDecimal + COMPLETION_TIME_HOURS - TIME_OFFSET;

    const estimatedFreeTime =
      startTimeInDecimal - COMPLETION_TIME_HOURS + TIME_OFFSET;

    const reversedTimeSlots = timeSlotsInDecimal.filter((timeSlot) => {
      if (timeSlot < startTimeInDecimal) {
        return timeSlot > estimatedFreeTime;
      }
      return timeSlot >= startTimeInDecimal && timeSlot < estimatedBusyTime;
    });
    if (!reversedTimeSlots.includes(startTimeInDecimal))
      reversedTimeSlots.push(startTimeInDecimal);

    return [
      ...new Set(
        [...timeSlotsLessThanStartTime, ...reversedTimeSlots].sort(
          (a, b) => a - b
        )
      ),
    ];
  };
  convertTimetoDecimal({ timeString }) {
    const [hours, minutes] = timeString.split(":");
    const decimalTime = parseFloat(hours) + parseFloat(minutes) / 60;

    return parseFloat(decimalTime.toFixed(3));
  }

  convertTimeArrayToDecimal(timeArray) {
    const decimalArray = timeArray.map((timeString) => {
      const [hours, minutes] = timeString.split(":");
      const decimalTime = parseFloat(hours) + parseFloat(minutes) / 60;
      return parseFloat(decimalTime.toFixed(3));
    });

    return decimalArray;
  }

  convertDecimalArrayToTime(decimalArray) {
    const timeArray = decimalArray.map((decimalTime) => {
      const hours = Math.floor(decimalTime);
      const minutes = Math.round((decimalTime - hours) * 60);
      let formattedTime = `${hours}:${minutes < 10 ? "0" : ""}${minutes}`;

      if (formattedTime === "9:00") formattedTime = "09:00";

      return formattedTime;
    });

    return timeArray;
  }

  async deleteFreeTimeSlot(id) {
    return await FreeTimeSlot.findByIdAndRemove(id);
  }
}

module.exports = new FreeTimeSlotService();
