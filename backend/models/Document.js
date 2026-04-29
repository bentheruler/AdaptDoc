const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["cv", "cover_letter", "business_proposal"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: Object,
      required: true,
    },

    history: [
      {
        content: {
          type: Object,
          required: true,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);