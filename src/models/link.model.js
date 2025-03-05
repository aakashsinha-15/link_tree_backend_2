import mongoose from "mongoose";

const linkSchema = new mongoose.Schema(
    {
        link: {
            type: String,
            required: true,
        },
        label: {
            type: String,
            required: true,
            unique: true,
        },
        click_count: {
            type: Number,
            default: 0,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]

    }, { timestamps: true })

export const Link = mongoose.model("Link", linkSchema);