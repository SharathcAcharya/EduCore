/**
 * Resource Frontend Testing Script
 * 
 * This script helps test the frontend resource functionality by making direct API calls
 * and checking the resources are properly displayed in the UI.
 * 
 * How to use:
 * 1. Start your backend server
 * 2. Log in to the admin dashboard
 * 3. Open browser console
 * 4. Copy and paste this entire script
 * 5. Check console logs for test results
 */

const testResourceFrontend = async () => {
    // Function to delay execution
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    console.log("--- Resource Frontend Test: STARTING ---");
    
    // Test 1: Check if Redux store has resources
    console.log("\nTest 1: Checking Redux store resources");
    
    // Get Redux store state
    const state = store.getState();
    console.log("Current resource state:", state.resource);
    
    if (state.resource && Array.isArray(state.resource.resources)) {
        console.log(`✅ Redux store has ${state.resource.resources.length} resources`);
    } else {
        console.log("❌ Redux store resources not found or not an array");
    }
    
    // Test 2: Attempt to create a new test resource
    console.log("\nTest 2: Creating a test resource");
    
    // Create test resource data
    const currentUser = state.user.currentUser;
    const testResource = {
        title: "Test Resource " + new Date().toISOString(),
        description: "This is a test resource created by the frontend test script",
        resourceType: "Document",
        fileUrl: "https://example.com/testresource",
        school: currentUser?.school || currentUser?._id,
        uploadedBy: currentUser?._id,
        uploaderModel: "admin"
    };
    
    try {
        // Manually call the addResource action
        const addResourceAction = await store.dispatch(resourceHandlers.addResource(testResource));
        console.log("Add resource result:", addResourceAction);
        
        if (addResourceAction.success) {
            console.log(`✅ Successfully created test resource with ID: ${addResourceAction.data._id}`);
            
            // Store the test resource ID for later deletion
            window.testResourceId = addResourceAction.data._id;
        } else {
            console.log("❌ Failed to create test resource:", addResourceAction.error);
        }
    } catch (error) {
        console.error("❌ Error creating test resource:", error);
    }
    
    // Test 3: Check if UI shows the newly created resource
    console.log("\nTest 3: Checking if UI updates with new resource");
    await delay(1000); // Wait for UI to update
    
    // Get updated Redux store state
    const updatedState = store.getState();
    
    if (updatedState.resource && Array.isArray(updatedState.resource.resources)) {
        const newResource = updatedState.resource.resources.find(r => r._id === window.testResourceId);
        
        if (newResource) {
            console.log("✅ Found newly created resource in Redux store:", newResource);
        } else {
            console.log("❌ Newly created resource not found in Redux store");
        }
    }
    
    // Test 4: Check DOM for the resource
    console.log("\nTest 4: Checking DOM for the resource");
    
    // Look for elements containing the resource title
    const resourceElements = Array.from(document.querySelectorAll('.MuiCard-root')).filter(
        el => el.textContent.includes(testResource.title)
    );
    
    if (resourceElements.length > 0) {
        console.log(`✅ Found ${resourceElements.length} elements in DOM containing the resource title`);
    } else {
        console.log("❌ Resource not found in DOM");
    }
    
    // Test 5: Delete the test resource
    console.log("\nTest 5: Cleaning up - deleting test resource");
    
    if (window.testResourceId) {
        try {
            const deleteResult = await store.dispatch(resourceHandlers.deleteResource(window.testResourceId));
            
            if (deleteResult.success) {
                console.log(`✅ Successfully deleted test resource ID: ${window.testResourceId}`);
            } else {
                console.log("❌ Failed to delete test resource:", deleteResult.error);
            }
        } catch (error) {
            console.error("❌ Error deleting test resource:", error);
        }
    } else {
        console.log("ℹ️ No test resource ID found to delete");
    }
    
    console.log("\n--- Resource Frontend Test: COMPLETED ---");
    console.log("Review the logs above to see if the tests passed or failed");
};

// Check if we have the Redux store and resource handlers available
if (typeof store !== 'undefined' && typeof resourceHandlers !== 'undefined') {
    // Load resource handler functions
    const resourceHandlers = {
        getAllResources: window.getAllResources || store.dispatch.getAllResources,
        addResource: window.addResource || store.dispatch.addResource,
        deleteResource: window.deleteResource || store.dispatch.deleteResource
    };
    
    // Run the tests
    testResourceFrontend();
} else {
    console.error("Redux store or resource handlers not found. Make sure you're running this script on the admin resources page.");
    console.log("Try adding these to the window object first:");
    console.log("window.getAllResources = getAllResources;");
    console.log("window.addResource = addResource;");
    console.log("window.deleteResource = deleteResource;");
}
