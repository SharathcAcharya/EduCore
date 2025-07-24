const Resource = require('../models/resourceSchema.js');

const createResource = async (req, res) => {
    try {
        console.log("Creating resource with data:", req.body);
        
        // Validate required fields
        if (!req.body.title || !req.body.description || !req.body.resourceType || !req.body.fileUrl || !req.body.school) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        
        const resource = new Resource({
            ...req.body,
            uploadDate: new Date() // Ensure upload date is set
        });
        
        const result = await resource.save();
        
        if (!result) {
            throw new Error("Failed to save resource");
        }
        
        console.log("Resource created successfully:", result);
        
        // Populate the class and subject name before sending back the response
        const populatedResource = await Resource.findById(result._id)
            .populate('sclassName', 'sclassName')
            .populate('subject', 'subName');
            
        res.status(201).json(populatedResource);
    } catch (err) {
        console.error("Error in createResource:", err);
        res.status(500).json({ message: err.message || "Error creating resource" });
    }
};

const getAllResources = async (req, res) => {
    try {
        console.log("Fetching all resources for school ID:", req.params.id);
        
        const resources = await Resource.find({ school: req.params.id })
            .populate('sclassName', 'sclassName')
            .populate('subject', 'subName')
            .sort({ uploadDate: -1 }); // Sort by upload date, newest first

        console.log(`Found ${resources.length} resources`);
        
        if (resources.length > 0) {
            res.status(200).json(resources);
        } else {
            // Return empty array instead of message object for consistency
            res.status(200).json([]);
        }
    } catch (error) {
        console.error("Error in getAllResources:", error);
        res.status(500).json({ message: error.message || "Error retrieving resources" });
    }
};

const getClassResources = async (req, res) => {
    try {
        console.log("Fetching resources for school:", req.params.schoolId, "class:", req.params.classId);
        
        // Find resources for this specific class OR resources not assigned to any class
        const resources = await Resource.find({
            school: req.params.schoolId,
            $or: [
                { sclassName: req.params.classId },
                { sclassName: { $exists: false } },
                { sclassName: null }
            ]
        })
            .populate('sclassName', 'sclassName')
            .populate('subject', 'subName');

        console.log(`Found ${resources.length} resources for class`);
        
        if (resources.length > 0) {
            res.status(200).json(resources);
        } else {
            res.status(200).json({ message: "No resources found for this class" });
        }
    } catch (error) {
        console.error("Error in getClassResources:", error);
        res.status(500).json({ message: error.message || "Error retrieving class resources" });
    }
};

const getSubjectResources = async (req, res) => {
    try {
        console.log("Fetching resources for school:", req.params.schoolId, "subject:", req.params.subjectId);
        
        // Find resources for this specific subject OR resources not assigned to any subject
        const resources = await Resource.find({
            school: req.params.schoolId,
            $or: [
                { subject: req.params.subjectId },
                { subject: { $exists: false } },
                { subject: null }
            ]
        })
            .populate('sclassName', 'sclassName')
            .populate('subject', 'subName')
            .sort({ uploadDate: -1 });

        console.log(`Found ${resources.length} resources for subject`);
        
        if (resources.length > 0) {
            res.status(200).json(resources);
        } else {
            // Return empty array instead of message object for consistency
            res.status(200).json([]);
        }
    } catch (error) {
        console.error("Error in getSubjectResources:", error);
        res.status(500).json({ message: error.message || "Error retrieving subject resources" });
    }
};

const updateResource = async (req, res) => {
    try {
        const result = await Resource.findByIdAndUpdate(req.params.id,
            { $set: req.body },
            { new: true });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteResource = async (req, res) => {
    try {
        await Resource.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Resource has been deleted" });
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = {
    createResource,
    getAllResources,
    getClassResources,
    getSubjectResources,
    updateResource,
    deleteResource
};
