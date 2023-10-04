const { User } = require("../model/user.model");
const bcrypt = require("bcrypt");

class UserService {
  //Create new user
  async createUser(user) {
    const salt = await bcrypt.genSalt(10);
    // for hashing the password that is saved the database for security reasons
    user.password = await bcrypt.hash(user.password, salt);

    return await user.save();
  }

  async getUserById(userId) {
    return await User.findById(userId).select("-password");
  }

  async getUsersByRole(role) {
    const hiddenProperty = role == "freelancer" ? "-company" : "-freelancer";

    return await User.find({ role }).select("-password").select(hiddenProperty);
  }

  async getUserByRole(role, userId) {
    const hiddenProperty = role == "freelancer" ? "company" : "freelancer";

    return await User.find({ role, _id: userId }).select(
      `-${hiddenProperty}, -password`
    );
  }

  async getUserByEmail(email) {
    return await User.findOne({ email }).select("-password");
  }

  async getUserByUsername(userName) {
    return await User.findOne({ userName });
  }

  async getAllUsers() {
    return await User.find().sort({ _id: -1 }).select("-password");
  }

  async updateUserById(id, user) {
    return await User.findByIdAndUpdate(
      id,
      {
        $set: user,
      },
      { new: true }
    );
  }

  async deleteUser(id) {
    return await User.findByIdAndRemove(id);
  }
}

module.exports = new UserService();
