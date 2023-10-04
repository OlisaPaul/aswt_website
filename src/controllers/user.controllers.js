const _ = require("lodash");
const { User } = require("../model/user.model");
const userService = require("../services/user.services");
const { MESSAGES } = require("../common/constants.common");
const propertiesToPick = require("../common/propertiesToPick.common");
const { transporter, mailOptions } = require("../utils/email.utils");
const {
  errorMessage,
  errorMessageUserName,
  successMessage,
} = require("../common/messages.common");
const generateRandomAvatar = require("../utils/generateRandomAvatar.utils");

class UserController {
  async getStatus(req, res) {
    res.status(200).send({ message: MESSAGES.DEFAULT, success: true });
  }

  //Create a new user
  async register(req, res) {
    // Checks if a user already exist by using the email id
    let user = await userService.getUserByEmail(req.body.email);
    if (user)
      return res
        .status(400)
        .send({ success: false, message: "User already registered" });

    const userName = await userService.getUserByUsername(
      `@${req.body.userName}`
    );
    if (userName)
      return res.status(400).send({
        success: false,
        message: "Username has been taken, please use another one",
      });

    user = new User(_.pick(req.body, [...propertiesToPick, "password"]));

    const avatarUrl = await generateRandomAvatar(user.email);
    user.avatarUrl = avatarUrl;
    user.avatarImgTag = `<img src=${avatarUrl} alt=${user._id}>`;

    user.userName = `@${req.body.userName}`;

    user.role = user.role.toLowerCase();

    user = await userService.createUser(user);

    // it creates a token which is sent as an header to the client
    const token = user.generateAuthToken();

    user = _.pick(user, propertiesToPick);

    transporter.sendMail(
      mailOptions(user.email, user.firstName),
      (error, info) => {
        if (error) {
          console.error("Error occurred:", error);
        } else {
          console.log("Email sent successfully:", info.response);
        }
      }
    );

    res
      .header("x-auth-header", token)
      .header("access-control-expose-headers", "x-auth-token")
      // It determines what is sent back to the client
      .send(successMessage(MESSAGES.CREATED, user));
  }

  //get user from the database, using their email
  async gethUserById(req, res) {
    const user = await userService.getUserById(req.params.id);

    if (!user) return res.status(404).send(errorMessage("user"));

    res.send(successMessage(MESSAGES.FETCHED, user));
  }

  async getUserByUsername(req, res) {
    let userName = req.params.userName;
    if (userName && !userName.startsWith("@")) userName = `@${userName}`;

    const user = await userService.getUserByUsername(userName);

    if (!user) return res.status(404).send(errorMessageUserName());

    res.send(successMessage(MESSAGES.FETCHED, user));
  }

  //get all users in the user collection/table
  async fetchAllUsers(req, res) {
    const users = await userService.getAllUsers();

    res.send(successMessage(MESSAGES.FETCHED, users));
  }

  async getUsersByRole(req, res) {
    const roles = ["freelancer", "company"];
    if (!roles.includes(req.params.role))
      return res
        .status(400)
        .send({ success: false, message: `role can only be one of ${roles}` });

    const freelancers = await userService.getUsersByRole(req.params.role);

    res.send(successMessage(MESSAGES.FETCHED, freelancers));
  }

  async getUserByRole(req, res) {
    const { role, id } = req.params;

    const roles = ["freelancer", "company"];
    if (!roles.includes(role))
      return res
        .status(400)
        .send({ success: false, message: `role can only be one of ${roles}` });

    const user = await userService.getUserByRole(role, id);
    if (!user) return res.status(404).send(errorMessage("user"));

    res.send(successMessage(MESSAGES.FETCHED, user));
  }

  //Update/edit user data
  async updateUserProfile(req, res) {
    let user = await userService.getUserById(req.params.id);

    if (!user) return res.status(404).send(errorMessage("user"));

    let updatedUser = req.body;

    const avatarUrl = await generateRandomAvatar(user.email);

    updatedUser.avatarUrl = avatarUrl;
    updatedUser.avatarImgTag = `<img src=${avatarUrl} alt=${user._id}>`;

    updatedUser = await userService.updateUserById(req.params.id, updatedUser);

    res.send(successMessage(MESSAGES.UPDATED, updatedUser));
  }

  //Delete user account entirely from the database
  async deleteUserAccount(req, res) {
    const user = await userService.getUserById(req.params.id);

    if (!user) return res.status(404).send(errorMessage("user"));

    await userService.deleteUser(req.params.id);

    res.send(successMessage(MESSAGES.DELETED, user));
  }
}

module.exports = new UserController();
