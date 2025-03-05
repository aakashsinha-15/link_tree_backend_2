import { User } from "../models/user.model.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import crypto from 'crypto'
import bcrypt from 'bcrypt'


const GenerateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        // await user.save({validateBeforeSave: false})
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken };
    } catch (error) {
        throw new apiError(500, "Something went wrong while generating tokens")
    }
}

export const registerUser = asyncHandler(async (req, res) => {
    const { email, password, firstName, LastName, accept } = req.body;
    if (!email?.trim() || !password?.trim() || !firstName?.trim() || !LastName?.trim() || !accept) {
        throw new apiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
        throw new apiError(409, "User is already registered");
    }

    const user = await User.create({
        email,
        password,
        firstName,
        LastName,
        accept
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new apiError(401, "Somethign went wrong")
    }

    return res
        .status(201)
        .json(new apiResponse(201, createdUser, "User is registered successfully"))

})


export const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne(
        {
            $or: [{ email }]
        }
    )
    if (!user) {
        throw new apiError(400, "User is not registered");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new apiError(400, "Password is Not Correct");
    }

    const { accessToken, refreshToken } = await GenerateAccessAndRefreshToken(user._id);

    const loginUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: false,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(
                200,
                {
                    user: loginUser,
                    accessToken,
                    refreshToken
                },
                "User is login successfully"
            )
        )
})

export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: '',
                accessToken: '',
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", options)
        .cookie("refreshToken", options)
        .json(new apiResponse(200, "user log out succesfully"));
});

export const getUserDetailsById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken")
    return res
    .status(200)
    .json(new apiResponse(200, user, "User details fetched successfully"))
})

export const editProfile = asyncHandler(async (req, res) => {
    const { firstName, LastName, email, password } = req.body;
    if (!firstName || !LastName || !email) {
        throw new apiError(400, "All fields are required");
    }

    const updateFields = { firstName, LastName, email, password };

    if (password) {
        updateFields.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findOneAndUpdate(
        { email },
        { $set: updateFields },
        { new: true }
    );

    if (!user) {
        throw new apiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new apiResponse(200, user, "User updated successfully"));
});

export const forgetPasswordRecoveryByEmail = asyncHandler(async (req, res) => {

    const { email } = req.body;

    const user = await User.findOne({ email })
    if (!user) {
        throw new apiError(404, "User is not registed");
    }
    // console.log(user)

    const resetToken = user.generateResetPasswordToken()
    // console.log(typeof resetToken)
    await user.save()

    const resetURL = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${resetToken}`;
    const message = `Click the link below to reset your password:\n\n${resetURL}\n\nThis link is valid for 15 minutes.`;

    try {
        await sendEmail(user.email, "Password Reset Request", message);
        res.status(200).json({ message: "Reset password email sent" });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        throw new apiError(500, "Email is not sent")
    }

})

export const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body


    if (!newPassword) {
        throw new apiError(400, "Password is required")
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")
    const user = User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
    })

    if (!user) {
        throw new apiError(404, "Token is invalid")
    }

    user.password = bcrypt.hash(newPassword, 10)
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    return res
        .status(200)
        .json(new apiResponse(200, {}, "Password is reset successfully"))
})
