const { Job } = require("../model/job.model");
const userServices = require("../services/user.services");
const { MESSAGES } = require("../common/constants.common");
const {
  errorMessage,
  successMessage,
  unAuthMessage,
} = require("../common/messages.common");
const jobServices = require("../services/job.services");

class JobController {
  async getStatus(req, res) {
    res.status(200).send({ message: MESSAGES.DEFAULT, success: true });
  }
  //Create a new job

  async createJob(req, res) {
    const { companyId, jobStatus, price, jobTitle, duration } = req.body;

    const [company] = await userServices.getUserByRole("company", companyId);
    if (!company) res.status(404).send(errorMessage("company"));

    // makes sure the authenticated user is the same person as the user passed in the body of request
    let job = new Job({
      companyId,
      jobStatus,
      price,
      jobTitle,
      duration,
    });

    company.company.jobs.push(job._id);

    await Promise.all([
      jobServices.createJob(job),
      userServices.updateUserById(companyId, company),
    ]);

    // Sends the created job as response
    res.send(successMessage(MESSAGES.CREATED, job));
  }

  //get all jobs in the job collection/table
  async fetchAllJobs(req, res) {
    const jobs = await jobServices.getAllJobs();

    res.send(successMessage(MESSAGES.FETCHED, jobs));
  }

  //get job from the database, using their email
  async getJobById(req, res) {
    const job = await jobServices.getJobById(req.params.id);

    if (job) {
      res.send(successMessage(MESSAGES.FETCHED, job));
    } else {
      res.status(404).send(errorMessage("job"));
    }
  }

  async getJobsByCompanyId(req, res) {
    const job = await jobServices.getJobsByCompanyId(req.params.id);

    if (job) {
      res.send(successMessage(MESSAGES.FETCHED, job));
    } else {
      res.status(404).send(errorMessage("job", "post"));
    }
  }

  //Update/edit job data
  async updateJob(req, res) {
    let job = await jobServices.getJobById(req.params.id);
    if (!job) return res.status(404).send(errorMessage("job"));

    job = await jobServices.updateJobById(req.params.id, req.body);

    res.send(successMessage(MESSAGES.UPDATED, job));
  }

  async addFreelancer(req, res) {
    const { freelancerId } = req.body;

    let job = await jobServices.getJobById(req.params.id);
    if (!job) return res.status(404).send(errorMessage("job"));

    const freelancer = await userServices.getUserByRole(
      "freelancer",
      freelancerId
    );
    if (!freelancer) return res.status(404).send(errorMessage("freelancer"));

    if (job.applicants.includes(freelancerId))
      return res.status(400).send({
        success: false,
        message: "You have already applied for this job",
      });

    job.applicants.push(freelancerId);

    job = await jobServices.updateJobById(req.params.id, job);

    res.send(successMessage(MESSAGES.UPDATED, job));
  }

  //Delete job account entirely from the database
  async deleteJob(req, res) {
    let job = await jobServices.getJobById(req.params.id);

    if (!job) return res.status(404).send(errorMessage("job"));

    await jobServices.deleteJob(req.params.id);

    res.send(successMessage(MESSAGES.DELETED, job));
  }
}

module.exports = new JobController();
