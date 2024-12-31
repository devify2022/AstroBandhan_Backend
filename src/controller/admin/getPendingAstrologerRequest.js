import { asyncHandler } from '../../utils/asyncHandler.js';
import PendingAstrologerRequest from '../../models/pendingAstrologerRequest.js';
import { ApiResponse } from '../../utils/apiResponse.js';  // Assuming ApiResponse is a custom class for standardizing responses


export const getPendingAstrologerRequests = asyncHandler(async (req, res) => {
    const { page = 1, size = 10 } = req.query; // Default to page 1, size 10 if not provided
    const skip = (page - 1) * size; // Calculate the skip value for pagination
    const limit = parseInt(size, 10); // Limit value
    console.log({ skip })
    try {
        // Fetch pending astrologer requests with pagination, filtering by isApproved: false
        const pendingRequests = await PendingAstrologerRequest.find({ isApproved: false })
            .skip(skip)
            .limit(limit)
            .populate('language', 'name'); // Populate 'languages' field with the 'name' from the languages collection
        const totalCount = pendingRequests.length || 0; // Total count of pending requests
        const totalPages = Math.ceil(totalCount / limit);

        // Format response with pagination info
        const response = {
            totalCount,
            totalPages,
            currentPage: page,
            requests: pendingRequests,
        };

        return res.status(200).json(new ApiResponse(200, response, "Pending astrologer requests fetched successfully."));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(500, null, "Server error while fetching pending astrologer requests."));
    }
});

export const deleteAstrologerRequest = asyncHandler(async (req, res) => {
    const { userId } = req.body; // Take userID from request body

    if (!userId) {
        return res.status(400).json(new ApiResponse(400, null, "User ID is required."));
    }

    try {
        // Find and delete the astrologer request by userId
        const deletedRequest = await PendingAstrologerRequest.findByIdAndDelete(userId);

        if (!deletedRequest) {
            return res.status(404).json(new ApiResponse(404, null, "Astrologer request not found."));
        }

        return res.status(200).json(new ApiResponse(200, deletedRequest, "Astrologer request deleted successfully."));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(500, null, "Server error while deleting astrologer request."));
    }
});