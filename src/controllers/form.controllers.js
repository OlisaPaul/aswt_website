const { Form } = require("../model/form.model");
const { MESSAGES } = require("../common/constants.common");
const { errorMessage, successMessage } = require("../common/messages.common");
const formServices = require("../services/form.services");

class FormController {
  async createForm(req, res) {
    const { customerName, customerEmail } = req.body;

    // makes sure the authenticated user is the same person as the user passed in the body of request
    let form = new Form({ customerEmail, customerName });

    form = await formServices.createForm(form);

    // Sends the created form as response
    res.send(successMessage(MESSAGES.CREATED, form));
  }

  //get all forms in the form collection/table
  async fetchForms(req, res) {
    const forms = await formServices.fetchForms();

    res.send(successMessage(MESSAGES.FETCHED, forms));
  }

  //get form from the database, using their email
  async getFormById(req, res) {
    const form = await formServices.getFormById(req.params.id);

    if (form) {
      res.send(successMessage(MESSAGES.FETCHED, form));
    } else {
      res.status(404).send(errorMessage("form"));
    }
  }

  //Update/edit form data
  async updateForm(req, res) {
    let form = await formServices.getFormById(req.params.id);
    if (!form) return res.status(404).send(errorMessage("form"));

    form = await formServices.updateFormById(req.params.id, req.body);

    res.send(successMessage(MESSAGES.UPDATED, form));
  }

  //Delete form account entirely from the database
  async deleteForm(req, res) {
    let form = await formServices.getFormById(req.params.id);

    if (!form) return res.status(404).send(errorMessage("form"));

    await formServices.deleteForm(req.params.id);

    res.send(successMessage(MESSAGES.DELETED, form));
  }
}

module.exports = new FormController();
