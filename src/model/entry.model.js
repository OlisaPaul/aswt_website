const mongoose = require("mongoose");
const Joi = require("joi");
const addVirtualIdUtils = require("../utils/addVirtualId.utils");
const newDate = require("../utils/newDate.utils");

const entrySchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    entryDate: {
      type: Date,
      default: newDate(),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    numberOfCarsAdded: {
      type: Number,
      default: 0,
    },
    numberOfVehicles: {
      type: Number,
      default: 0,
    },
    invoice: {
      name: {
        type: String,
        minlength: 5,
        maxlength: 255,
      },
      carDetails: [
        {
          waitingList: {
            type: Boolean,
          },
          isCompleted: {
            type: Boolean,
          },
          vin: { type: String, required: true },
          year: { type: Number },
          make: {
            type: String,
            minlength: 3,
            maxlength: 255,
          },
          entryDate: {
            type: Date,
          },
          model: {
            type: String,
            minlength: 1,
            maxlength: 255,
          },
          colour: {
            type: String,
            minlength: 3,
            maxlength: 255,
          },
          serviceIds: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "service",
            },
          ],
          servicesDone: [
            {
              serviceId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "service",
              },
              staffId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
              },
            },
          ],
          geoLocation: {
            description: {
              type: String,
              minlength: 3,
              maxlength: 255,
            },
            coordinates: {
              latitude: { type: Number, required: true },
              longitude: { type: Number, required: true },
            },
          },
          customerNote: {
            type: String,
            minlength: 5,
            maxlength: 512,
          },
          note: {
            type: String,
            minlength: 5,
            maxlength: 512,
          },
          price: {
            type: Number,
            default: 0,
          },
          category: {
            type: String,
            minlength: 3,
            maxlength: 10,
          },
          staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            default: null,
          },
          priceBreakdown: [
            {
              serviceName: String,
              serviceType: String,
              price: Number,
              serviceId: {
                type: mongoose.Schema.Types.ObjectId,
              },
              dealership: {
                type: Boolean,
              },
              qbId: {
                type: String,
              },
            },
          ],
        },
      ],
      totalPrice: {
        type: Number,
        default: 0,
      },
      qbId: String,
      invoiceNumber: String,
      paymentDetails: {
        paymentDate: {
          default: null,
          type: Date,
        },
        amountPaid: {
          default: 0,
          type: Number,
        },
        amountDue: {
          type: Number,
        },
        currency: {
          type: String,
        },
      },
      sent: {
        type: Boolean,
        default: null,
      },
    },
  },
  { toJSON: { virtuals: true } },
  { toObject: { virtuals: true } }
);

addVirtualIdUtils(entrySchema, "entryId");

entrySchema.statics.getNextInvoiceNumber = async function () {
  // Get the last entry
  const lastEntry = await this.findOne().sort("-entryDate");

  // Start with AWST00001 if no entries
  let nextNum = "00001";

  if (lastEntry) {
    const lastNum = lastEntry.invoice.name.substring(5);
    nextNum = leadingZero(parseInt(lastNum) + 1, 5);
  }

  return "ASWT" + nextNum;
};

function leadingZero(num, size) {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

entrySchema.post("save", function (doc) {
  const entryDate = doc.entryDate;
  const timeoutMs = Math.min(2 * 60 * 1000 + entryDate.getTime(), 2147483647);

  setTimeout(() => {
    doc.isActive = false;
    doc.save();
  }, timeoutMs);
});

const Entry = mongoose.model("Entry", entrySchema);

function validate(entry) {
  const schema = Joi.object({
    customerId: Joi.string().required(),
    numberOfVehicles: Joi.number().min(1).max(100000).required(),
  });

  return schema.validate(entry);
}

function validateAddVin(entry) {
  const schema = Joi.object({
    carDetails: Joi.object({
      vin: Joi.string().required(),
      customerNote: Joi.string().min(5).max(255),
    }).required(),
  });

  return schema.validate(entry);
}

function validatePatch(entry) {
  const schema = Joi.object({
    numberOfVehicles: Joi.number().min(1).max(100000),
  });

  return schema.validate(entry);
}

function validateModifyCarDetails(entry) {
  const schema = Joi.object({
    year: Joi.number().min(1000),
    colour: Joi.string().min(3),
    serviceIds: Joi.array().items(Joi.objectId().required()),
    make: Joi.string().min(3).max(255),
    model: Joi.string().min(1).max(255),
    note: Joi.string().min(5).max(255),
    category: Joi.string().valid("suv", "sedan", "truck").insensitive(),
  });

  return schema.validate(entry);
}

function validateAddInvoicePatch(entry) {
  const schema = Joi.object({
    carDetails: Joi.object({
      vin: Joi.string().required(),
      year: Joi.number().min(1000).required(),
      colour: Joi.string().min(3),
      serviceIds: Joi.array().items(Joi.objectId().required()),
      make: Joi.string().min(3).max(255).required(),
      model: Joi.string().min(1).max(255).required(),
      note: Joi.string().min(5).max(255),
      geoLocation: Joi.object({
        description: Joi.string().min(1).max(255).required(),
        coordinates: Joi.object({
          latitude: Joi.number().required(),
          longitude: Joi.number().required(),
        }),
      }).required(),
      category: Joi.string()
        .valid("suv", "sedan", "truck")
        .insensitive()
        .required(),
    }).required(),
  });

  return schema.validate(entry);
}

function validateModifyPrice(entry) {
  const schema = Joi.object({
    vin: Joi.string().required(),
    price: Joi.number().required(),
    serviceId: Joi.objectId().required(),
  });

  return schema.validate(entry);
}
function validateModifyServiceDone(entry) {
  const schema = Joi.object({
    note: Joi.string(),
    serviceId: Joi.objectId().required(),
  });

  return schema.validate(entry);
}

exports.joiValidator = {
  validate,
  validatePatch,
  validateAddVin,
  validateModifyPrice,
  validateAddInvoicePatch,
  validateModifyCarDetails,
  validateModifyServiceDone,
};
exports.Entry = Entry;
