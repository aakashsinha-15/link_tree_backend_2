import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { type } from 'os'

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        LastName: {
            type: String,
            required: true,
        },
        email:
        {
            type: String,
            required: true,
            unique: true
        },
        password:
        {
            type: String,
            required: true,
        },
        profile_image:
        {
            type: String,
        },
        refreshToken:
        {
            type: String,
        },
        resetPasswordToken:
        {
            type: String,
        },
        resetPasswordExpires:
        {
            type: Date
        },
        accept: {
            type: Boolean,
            required: true,
        }
    }, { timestamps: true })


userSchema.pre("save", async function (next) {
    if (!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            userSchema: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    return resetToken;
};



export const User = mongoose.model("User", userSchema);


// for user => {username or email, password, profile_image?, }
