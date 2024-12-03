import mongoose from "mongoose";
import User from "../models/user.js";
import { generateReferralCode } from "../utils/referralCodeGen.js";
import { buildReferralTree } from "../utils/referralTree.js";

export const createUser = async (req, res) => {
  try {
    const { fullName, username, email, phone, password, referralCode } =
      req.body;
    let referrer = null;

    // Handle referral code if provided
    if (referralCode) {
      const referringUser = await User.findOne({ referralCode }).select("_id");
      if (!referringUser) {
        return res.status(400).json({ message: "Invalid referral code." });
      }
      referrer = referringUser._id;
    }

    // Generate a unique referral code
    let userReferralCode;
    const maxAttempts = 5;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      userReferralCode = generateReferralCode();
      const exists = await User.exists({ referralCode: userReferralCode });
      if (!exists) break;
      if (attempt === maxAttempts - 1)
        throw new Error("Failed to generate unique referral code.");
    }

    // Create the new user
    // TODO : Incase the user add fails, the previous operation needs to be reverted
    const newUser = await User.create({
      fullName,
      username,
      email,
      phone,
      password,
      referralCode: userReferralCode,
      referrer,
    });

    // Update the referral tree if a referrer exists
    if (referrer) {
      const updatedTree = await buildReferralTree(referrer);

      // Update the referrer and all ancestors
      const updateAncestors = async (userId, tree) => {
        await User.findByIdAndUpdate(userId, { referralTree: tree });
        const parent = await User.findById(userId).select("referrer");
        if (parent?.referrer) {
          await updateAncestors(
            parent.referrer,
            await buildReferralTree(parent.referrer)
          );
        }
      };
      await updateAncestors(referrer, updatedTree);
    }

    return res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUser = async (req, res) => {
  const userId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const userId = req.params.id;
  const currentuser = await User.findById(userId);
  if (!currentuser) {
    return res.status(404).json({ message: "User not found" });
  }
  try {
    const user = await User.findByIdAndUpdate(userId, req.body);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const userId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteUsers = async (req, res) => {
  try {
    await User.deleteMany({});
    res.status(200).json({ message: "All users deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getReferralTreeHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select(
      "fullName username referralTree"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
      },
      referralTree: user.referralTree,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve referral tree." });
  }
};
