const Event = require('../models/eventSchema.js');

const createEvent = async (req, res) => {
    try {
        console.log("Creating event with data:", req.body);
        
        // Validate required fields
        if (!req.body.title || !req.body.description || !req.body.startDate || !req.body.endDate || !req.body.eventType || !req.body.school) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        
        // Convert date strings to Date objects to ensure proper storage
        const eventData = {
            ...req.body,
            startDate: new Date(req.body.startDate),
            endDate: new Date(req.body.endDate)
        };

        // Ensure the sclassName field is handled properly
        if (!eventData.sclassName || eventData.sclassName === '') {
            // If empty string or undefined, set to null to indicate "All Classes"
            eventData.sclassName = null;
        }

        const event = new Event(eventData);
        const result = await event.save();
        
        if (!result) {
            throw new Error("Failed to save event");
        }
        
        console.log("Event created successfully:", result);
        
        // Populate the class name before sending back the response
        const populatedEvent = await Event.findById(result._id).populate('sclassName', 'sclassName');
        res.status(201).json(populatedEvent);
    } catch (err) {
        console.error("Error in createEvent:", err);
        res.status(500).json({ message: err.message || "Error creating event" });
    }
};

const getAllEvents = async (req, res) => {
    try {
        console.log("Fetching all events for school ID:", req.params.id);
        
        const events = await Event.find({ school: req.params.id })
            .populate('sclassName', 'sclassName')
            .sort({ startDate: 1 }); // Sort by startDate ascending

        console.log(`Found ${events.length} events`);
        
        if (events.length > 0) {
            res.status(200).json(events);
        } else {
            console.log("No events found for school ID:", req.params.id);
            res.status(200).json([]);  // Return empty array instead of message object
        }
    } catch (error) {
        console.error("Error in getAllEvents:", error);
        res.status(500).json({ message: error.message || "Error retrieving events" });
    }
};

const getClassEvents = async (req, res) => {
    try {
        console.log("Fetching class events for school:", req.params.schoolId, "class:", req.params.classId);
        
        // Find events for this specific class OR events marked for all classes (sclassName = null)
        const events = await Event.find({
            school: req.params.schoolId,
            $or: [
                { sclassName: req.params.classId },
                { sclassName: null }  // Include events for all classes
            ]
        }).populate('sclassName', 'sclassName').sort({ startDate: 1 });

        console.log(`Found ${events.length} events for class`);
        
        if (events.length > 0) {
            res.status(200).json(events);
        } else {
            console.log("No events found for class:", req.params.classId);
            res.status(200).json([]);  // Return empty array instead of message object
        }
    } catch (error) {
        console.error("Error in getClassEvents:", error);
        res.status(500).json({ message: error.message || "Error retrieving class events" });
    }
};

const updateEvent = async (req, res) => {
    try {
        console.log("Updating event with ID:", req.params.id);
        console.log("Update data:", req.body);
        
        // Convert date strings to Date objects
        const updateData = { ...req.body };
        if (updateData.startDate) {
            updateData.startDate = new Date(updateData.startDate);
        }
        if (updateData.endDate) {
            updateData.endDate = new Date(updateData.endDate);
        }
        
        // Handle empty sclassName
        if (updateData.sclassName === '') {
            updateData.sclassName = null;
        }

        const result = await Event.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        ).populate('sclassName', 'sclassName');

        if (!result) {
            console.log("Event not found with ID:", req.params.id);
            return res.status(404).json({ message: "Event not found" });
        }

        console.log("Event updated successfully:", result);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in updateEvent:", error);
        res.status(500).json({ message: error.message || "Error updating event" });
    }
};

const deleteEvent = async (req, res) => {
    try {
        console.log("Deleting event with ID:", req.params.id);
        
        const result = await Event.findByIdAndDelete(req.params.id);
        
        if (!result) {
            console.log("Event not found with ID:", req.params.id);
            return res.status(404).json({ message: "Event not found" });
        }
        
        console.log("Event deleted successfully:", result);
        res.status(200).json({ message: "Event has been deleted", _id: req.params.id });
    } catch (error) {
        console.error("Error in deleteEvent:", error);
        res.status(500).json({ message: error.message || "Error deleting event" });
    }
};

module.exports = {
    createEvent,
    getAllEvents,
    getClassEvents,
    updateEvent,
    deleteEvent
};
