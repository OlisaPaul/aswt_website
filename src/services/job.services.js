const { Job } = require("../model/job.model");

class JobService {
  //Create new job
  async createJob(job) {
    return await job.save();
  }

  async getJobById(jobId) {
    return await Job.findById(jobId);
  }

  async getJobsByCompanyId(companyId) {
    return await Job.find({ companyId });
  }

  async getAllJobs() {
    return await Job.find().sort({ _id: -1 });
  }

  async updateJobById(id, job) {
    return await Job.findByIdAndUpdate(
      id,
      {
        $set: job,
      },
      { new: true }
    );
  }

  async deleteJob(id) {
    return await Job.findByIdAndRemove(id);
  }
}

module.exports = new JobService();
