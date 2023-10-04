const { Form } = require("../model/form.model");

class FormService {
  //Create new form
  async createForm(form) {
    return await form.save();
  }

  async getFormById(formId) {
    return await Form.findById(formId).select();
  }

  async fetchForms() {
    return await Form.find().sort({ _id: -1 }).select();
  }

  async updateFormById(id, form) {
    return await Form.findByIdAndUpdate(
      id,
      {
        $set: form,
      },
      { new: true }
    );
  }

  async deleteForm(id) {
    return await Form.findByIdAndRemove(id);
  }
}

module.exports = new FormService();
