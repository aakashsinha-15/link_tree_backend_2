import { Link } from "../models/link.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"

export const addLinksAndShop = asyncHandler(async (req, res) => {
    const { link, label } = req.body
    const userId = req.user._id

    if (!link || !label) {
        throw new apiError(400, "All fields are required")
    }

    const newLink = new Link({
        link,
        label,
        userId
    })

    await newLink.save()

    return res
        .status(201)
        .json(new apiResponse(201, newLink, "Link is added successfully"))
})

export const getLinksAndShop = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const links = await Link.find({
        userId 
    })
    if(!links) {
        throw new apiError(404, "Links not found")
    }
    return res
        .status(200)
        .json(new apiResponse(200, links, "Links are fetched successfully"))    

})

export const editLinkAndShop = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { link, label } = req.body

    const newLink = await Link.findByIdAndUpdate(
        id,
        { link, label },
        { new: true }
    );

    if (!newLink) {
        throw new apiError(404, "Link not found")
    }

    return res
        .status(200)
        .json(new apiResponse(200, newLink, "Link is updated successfully"))
})

export const deleteLinkAndShop = asyncHandler(async (req, res) => {
    const { id } = req.params
    const link = await Link.findByIdAndDelete(id)

    if (!link) {
        throw new apiError(404, "Link not found")
    }

    return res
        .status(200)
        .json(new apiResponse(200, link, "Link is deleted successfully"))
})

// export const countClicksOnLinksAndPost = asyncHandler(async (req, res) => {
//     const { id } = req.params;
//     const userId = req.user._id;

//     const link = await Link.findById(id);

//     if (!link) {
//         throw new apiError(404, "Link not found");
//     }

//     if (userId.toString() === link.userId.toString()) {
//         return res.status(200).json(new apiResponse(200, link, "Owner cannot increase views"));
//     }

//     if (!link.viewedBy.some(viewedId => viewedId.toString() === userId.toString())) {
//         await Link.findByIdAndUpdate(id, {
//             $inc: { click_count: 1 },
//             $push: { viewedBy: userId }
//         });
//     }

//     return res.status(200).json(new apiResponse(200, link, "Link is clicked successfully"));
// });



// export const countClicksOnLinksAndPost = asyncHandler(async (req, res) => {
//     const { id } = req.params;
//     const { device } = req.body;
//     const userId = req.user._id;

//     const link = await Link.findById(id);

//     if (!link) {
//         throw new apiError(404, "Link not found");
//     }

//     if (userId.toString() === link.userId.toString()) {
//         return res.status(200).json(new apiResponse(200, link, "Owner cannot increase views"));
//     }

//     if (!link.viewedBy.some(viewedId => viewedId.toString() === userId.toString())) {
//         const updateFields = {
//             $inc: { click_count: 1 },
//             $push: { viewedBy: userId }
//         };

//         if (device) {
//             updateFields.$inc[`trafficByDevice.${device}`] = 1;
//         }

//         await Link.findByIdAndUpdate(id, updateFields, { new: true });
//     }

//     return res.status(200).json(new apiResponse(200, link, "Link is clicked successfully"));
// });

// Get Analytics Data


export const countClicksOnLinksAndPost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { device } = req.body;
    const userId = req.user._id;
    
    const link = await Link.findById(id);
    if (!link) {
        throw new apiError(404, "Link not found");
    }

    if (userId.toString() === link.userId.toString()) {
        return res.status(200).json(new apiResponse(200, link, "Owner cannot increase views"));
    }
    
    const today = new Date().toISOString().split('T')[0];
    const updateFields = {
        $inc: { click_count: 1 },
        $push: { viewedBy: userId, clickDetails: { date: today, device } }
    };

    await Link.findByIdAndUpdate(id, updateFields, { new: true });
    return res.status(200).json(new apiResponse(200, link, "Link clicked successfully"));
});

// export const getAnalytics = asyncHandler(async (req, res) => {
//     const links = await Link.find();

//     const analytics = {
//         clicksOnLinks: links.reduce((acc, link) => acc + link.click_count, 0),
//         trafficByDevice: links.reduce((acc, link) => {
//             Object.keys(link.trafficByDevice || {}).forEach(device => {
//                 acc[device] = (acc[device] || 0) + link.trafficByDevice[device];
//             });
//             return acc;
//         }, {}),
//     };

//     res.status(200).json(new apiResponse(200, analytics, "Analytics data fetched successfully"));
// });



// export const getUserAnalytics = asyncHandler(async (req, res) => {
//     const userId = req.user._id;
//     const links = await Link.find({ userId });

//     const analytics = links.map(link => ({
//         label: link.label,
//         click_count: link.click_count,
//         clicksByDate: link.clickDetails.reduce((acc, { date }) => {
//             acc[date] = (acc[date] || 0) + 1;
//             return acc;
//         }, {}),
//     }));

//     res.status(200).json(new apiResponse(200, analytics, "User analytics fetched successfully"));
// });


export const getUserAnalytics = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const links = await Link.find({ userId }).populate("viewedBy");

    if (!links) {
        return res.status(200).json({});
    }

    const analytics = links.map(link => ({
        id: link._id,
        label: link.label,
        click_count: link.click_count,
        viewedBy: link.viewedBy.map(user => user._id),
        createdAt: link.createdAt,
    }));

    res.status(200).json({analytics});
});

