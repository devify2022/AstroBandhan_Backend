import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { Astrologer } from "../../models/astrologer.model.js"; // Path to your astrologer model
import ChatRoom from "../../models/chatRoomSchema.js";
import mongoose from "mongoose";
import moment from "moment-timezone";

// Controller to get all astrologers with pagination
export const getAllAstrologers = asyncHandler(async (req, res) => {
  const { page = 1, size = 10 } = req.query; // Default page is 1, size is 10

  // Convert page and size to integers
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(size, 10);

  try {
    // Ensure page and size are valid
    if (pageNumber < 1 || pageSize < 1) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid pagination parameters."));
    }

    // Get total count of astrologers
    const totalCount = await Astrologer.countDocuments();

    // Get the astrologers with pagination
    const astrologers = await Astrologer.find({
      status: { $in: ["available", "busy", "offline"] }, // Only find astrologers with these statuses
    })
      .skip((pageNumber - 1) * pageSize) // Skip the documents for the current page
      .limit(pageSize); // Limit the results to the page size

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / pageSize);

    // If no astrologers are found
    if (!astrologers || astrologers.length === 0) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "No astrologers found."));
    }

    // Respond with success and the paginated astrologers
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalCount,
          totalPages,
          currentPage: pageNumber,
          astrologers,
        },
        "Astrologers fetched successfully."
      )
    );
  } catch (error) {
    console.error("Error while fetching astrologers:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(500, null, "Server error while fetching astrologers.")
      );
  }
});

export const getActiveById = async (req, res) => {
  try {
    const { astrologerId } = req.body;

    // Check if both fields are provided
    if (!astrologerId) {
      return res.status(400).json({ message: "astrologerId  are required." });
    }

    // Find astrologer by phone
    //   const chatrooms = await ChatRoom.find({ astrologer: astrologerId,status: "active" });

    const chatrooms = await ChatRoom.aggregate([
      {
        $match: {
          astrologer: new mongoose.Types.ObjectId(astrologerId),
        },
      },
      {
        $lookup: {
          from: "users", // Name of the User collection
          localField: "user", // Field in ChatRoom to match
          foreignField: "_id", // Field in User to match
          as: "userDetails", // Output array field
        },
      },
      {
        $project: {
          _id: 1,
          astrologer: 1,
          status: 1,
          user: 1,
          isUserJoined: 1,
          chatRoomId: 1,
          createdAt: 1,
          updatedAt: 1,
          rejectedBy: 1,
          isAstrologerJoined: 1,
          avatar: { $arrayElemAt: ["$userDetails.photo", 0] },
          username: {
            $arrayElemAt: ["$userDetails.name", 0],
          },
        },
      },
    ]);

    if (!chatrooms) {
      return res.status(404).json({ message: "chatrooms not found." });
    }

    // Respond with tokens and success message
    res
      .status(200)
      .json(new ApiResponse(200, chatrooms, "chatrooms List Successfully"));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Server error. Please try again later."));
  }
};

export const getAllAstrologersByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.body;

  // Validate categoryId exists
  if (!categoryId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Category ID is required."));
  }

  // Validate categoryId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid Category ID format."));
  }

  try {
    // Find astrologers where the category array contains the requested categoryId
    const astrologers = await Astrologer.find({
      "category": new mongoose.Types.ObjectId(categoryId), // Updated to match your document structure
    }).select("-password -refreshToken"); // Exclude sensitive fields

    // If no astrologers are found
    if (!astrologers || astrologers.length === 0) {
      return res
        .status(200) // Changed from 404 to 200 with empty array
        .json(
          new ApiResponse(
            200,
            { astrologers: [] },
            "No astrologers found for this category."
          )
        );
    }

    // Respond with success and the filtered astrologers
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          astrologers, // Removed pagination fields since you don't need them
        },
        "Astrologers fetched successfully by category."
      )
    );
  } catch (error) {
    console.error("Error while fetching astrologers by category:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          null,
          "Server error while fetching astrologers by category."
        )
      );
  }
});
