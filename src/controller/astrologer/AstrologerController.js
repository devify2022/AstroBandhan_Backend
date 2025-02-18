import { asyncHandler } from "../../utils/asyncHandler.js";
import { Astrologer } from "../../models/astrologer.model.js";
import ChatRoom from "../../models/chatRoomSchema.js";

export const toggle_Offline_Online = asyncHandler(async (req, res) => {
  try {
    const { astrologerId, available_status } = req.body;

    // Find the astrologer by astrologerId
    const astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return res.status(404).json({ message: "Astrologer not found" });
    }

    // Check if the astrologer is attempting to go offline and has an active chat room
    if (available_status === "offline") {
      // Check if the astrologer has any active chat rooms
      const activeChatRoom = await ChatRoom.findOne({
        astrologer: astrologerId,
        status: "active",
      });

      if (activeChatRoom) {
        return res.status(400).json({
          message:
            "Cannot go offline. Please end your active chat session first.",
        });
      }

      // If no active chat rooms, proceed to set the astrologer as offline
      astrologer.available = {
        isAvailable: false,
        isCallAvailable: false,
        isChatAvailable: false,
        isVideoCallAvailable: false,
      };
      astrologer.isOffline = true;
    } else if (available_status === "online") {
      // If astrologer is going online, set all availability fields to true
      astrologer.available = {
        isAvailable: true,
        isCallAvailable: true,
        isChatAvailable: true,
        isVideoCallAvailable: true,
      };
      astrologer.isOffline = false;
    }
    // Save the updated astrologer document
    await astrologer.save();

    // Respond with success message
    res.status(200).json({
      message: "Astrologer availability updated successfully",
      astrologer,
    });
  } catch (error) {
    // Catch and handle any errors
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get Astrologer by ID
export const getAstrologerById = asyncHandler(async (req, res) => {
  try {
    const { astrologerId } = req.params;

    // Find the astrologer by ID
    const astrologer = await Astrologer.findById(astrologerId);

    if (!astrologer) {
      return res.status(404).json({ message: "Astrologer not found" });
    }

    // Respond with astrologer data
    res
      .status(200)
      .json({ message: "Astrologer fetched successfully", astrologer });
  } catch (error) {
    res.status(200).json({ message: "Server error", error: error.message });
  }
});

// Update Astrologer by ID
export const updateAstrologerById = asyncHandler(async (req, res) => {
  try {
    const { astrologerId } = req.params;

    // Find the astrologer by ID
    const astrologer = await Astrologer.findById(astrologerId);

    if (!astrologer) {
      return res.status(404).json({ message: "Astrologer not found" });
    }

    // Update the astrologer's data with the request body
    const updatedAstrologer = await Astrologer.findByIdAndUpdate(
      astrologerId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    // Respond with updated astrologer data
    res.status(200).json({
      message: "Astrologer updated successfully",
      astrologer: updatedAstrologer,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
