import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    authType: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Exporting the models
export const User = mongoose.models.User || mongoose.model("User", userSchema);