# Resources System Testing Guide

This guide provides step-by-step instructions for testing the resources functionality in the School Management System.

## Prerequisites

- The School Management System must be running (both backend and frontend)
- You must be logged in as an admin user

## 1. Testing the Basic Functionality

### 1.1. Viewing Resources

1. Log in to the admin dashboard
2. Navigate to the Resources section
3. Verify that the resources list appears
4. Check that resource cards show:
   - Title
   - Description
   - Resource type icon
   - Upload date
   - Class name (if applicable)
   - Subject name (if applicable)
   - "Open Resource" button
   - Delete button

### 1.2. Creating a New Resource

1. Click the "Add New Resource" button
2. Fill in the resource details:
   - Title: "Test Resource"
   - Description: "This is a test resource"
   - Resource Type: "Document"
   - Resource URL: "https://example.com/test-resource"
   - Class: (Select any class or leave blank)
   - Subject: (Select any subject or leave blank)
3. Click "Add Resource"
4. Verify that:
   - Success notification appears
   - The new resource appears in the resources list
   - The resource details match what you entered

### 1.3. Deleting a Resource

1. Find the resource you just created
2. Click the delete button (trash icon)
3. Confirm the deletion
4. Verify that:
   - Success notification appears
   - The resource is removed from the list

## 2. Testing Edge Cases

### 2.1. Creating a Resource with Minimum Information

1. Click the "Add New Resource" button
2. Fill in only the required fields:
   - Title: "Minimal Resource"
   - Description: "This resource has minimal information"
   - Resource Type: "Document"
   - Resource URL: "https://example.com/minimal"
3. Leave class and subject fields blank
4. Click "Add Resource"
5. Verify the resource appears correctly

### 2.2. Creating Resources of Different Types

Test creating resources with different types:

1. Create a Video resource with a YouTube URL
2. Create a Link resource with a website URL
3. Create an Image resource with an image URL
4. Verify each displays the correct icon and formatting

### 2.3. Testing Long Text Handling

1. Create a resource with a very long title and description
2. Verify the text is properly truncated or wrapped in the UI

## 3. Automated Testing with Console Script

To test the API functionality directly, you can use the provided test scripts:

### 3.1. Backend API Testing

1. Open a terminal and navigate to the docs directory
2. Run the resource API test script:
   ```
   node resource_api_test.js
   ```
3. Verify all tests pass successfully

### 3.2. Frontend Component Testing

1. Log in to the admin dashboard and navigate to the Resources section
2. Open browser developer tools (F12 or Ctrl+Shift+I)
3. Go to the Console tab
4. Copy and paste the entire contents of the `resource_frontend_test.js` file (located in the docs directory)
5. Press Enter to run the script
6. Check the console output for test results

## 4. Visual Testing Checklist

Use this checklist to verify the visual aspects of the resources functionality:

- [ ] Resources list layout is responsive and looks good on different screen sizes
- [ ] Resource cards have consistent height and width
- [ ] Resource type icons and colors are consistent
- [ ] Text is properly formatted and readable
- [ ] Form inputs and buttons are properly aligned
- [ ] Success and error notifications appear in the correct position
- [ ] Loading indicator appears while resources are being fetched
- [ ] Empty state is shown correctly when no resources exist

## 5. Reporting Issues

If you encounter any issues during testing, please:

1. Take a screenshot of the issue
2. Note the steps to reproduce the issue
3. Check the console for any error messages
4. Create a bug report with all of the above information

## 6. Verifying Fixes

After any fixes are applied:

1. Re-test the specific functionality that had issues
2. Run through the basic functionality tests again to ensure nothing else was broken
3. Run the automated test scripts to verify the API and components are working correctly
