import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
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

    }, { timestamps: true })

export const Shop = mongoose.model("Shop", shopSchema);
