import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../lib/cloudinary.js";

export const getSuggestedConnections = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select("connections");
    const suggestedUsers = await User.find({
      _id: { $ne: req.user._id, $nin: currentUser.connections },
    })
      .select("name username profilePicture headline")
      .limit(5);

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in getSuggestedConnections controller: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 본인 프로필이 아닐 때만 조회수 증가
    if (user._id.toString() !== req.user._id.toString()) {
      user.profileViews = (user.profileViews || 0) + 1;
      await user.save();
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getPublicProfile controller: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  const allowedFields = [
    "name",
    "headline",
    "location",
    "about",
    "skills",
    "profilePicture",
    "bannerImg",
    "experience",
    "education",
  ];
  const updateData = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      //name의 경우 기존 중복 가입자가 있는지 확인 후 없을 경우에만 변경
      if (field === "name") {
        const existingUser = await User.findOne({ name: req.body[field] });
        if (
          existingUser &&
          existingUser._id.toString() !== req.user._id.toString()
        ) {
          return res.status(400).json({ message: "Name already exists" });
        }
      }
      updateData[field] = req.body[field];
    }
  }

  try {
    // 1. 프로필 이미지 업로드
    if (
      req.body.profilePicture &&
      req.body.profilePicture.startsWith("data:image")
    ) {
      const secureUrl = await uploadOnCloudinary(
        req.body.profilePicture,
        "profile",
      );
      updateData.profilePicture = secureUrl;
    } else if (req.files && req.files.profilePicture) {
      const file = req.files.profilePicture;
      const filePath = file.path || file.tempFilePath;
      if (filePath) {
        const secureUrl = await uploadOnCloudinary(filePath, "profile");
        updateData.profilePicture = secureUrl;
      }
    }

    // 2. 배너 이미지 업로드
    if (req.body.bannerImg && req.body.bannerImg.startsWith("data:image")) {
      const secureUrl = await uploadOnCloudinary(req.body.bannerImg, "banner");
      updateData.bannerImg = secureUrl;
    } else if (req.files && req.files.bannerImg) {
      const file = req.files.bannerImg;
      const filePath = file.path || file.tempFilePath;
      if (filePath) {
        const secureUrl = await uploadOnCloudinary(filePath, "banner");
        updateData.bannerImg = secureUrl;
      }
    }
  } catch (uploadError) {
    console.error("Error uploading images to Cloudinary:", uploadError);
    return res
      .status(500)
      .json({ message: "Failed to upload images to cloud" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      returnDocument: "after",
    }).select("-password");
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateProfile controller: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
