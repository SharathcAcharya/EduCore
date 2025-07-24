# School Calendar & Events - Troubleshooting Guide

## Common Issues and Solutions

### Events Not Appearing in the List

1. **Check Network Requests**

   - Open browser developer tools (F12)
   - Go to the Network tab
   - Look for API calls to `/api/Events/[school-id]`
   - Check for any errors in the response

2. **Verify School ID**

   - Ensure the admin account has a valid school ID
   - If you see errors about "school ID not found," try logging out and back in

3. **Database Connection**
   - Ensure MongoDB is running and accessible
   - Check backend logs for connection errors

### Unable to Create or Edit Events

1. **Date Format Issues**

   - Ensure dates are properly formatted (YYYY-MM-DD)
   - Make sure end date is not before start date

2. **Missing Required Fields**

   - All required fields must be completed (title, description, dates, event type)
   - Check for any validation errors in the response

3. **API Endpoint Issues**
   - Verify the API endpoint URLs are correct
   - Try using the debug mode to see detailed API request/response logs

### Debug Mode

For advanced troubleshooting, use the debug mode available from the Events page:

1. Go to School Calendar & Events page
2. Click the "Debug Mode" button
3. Debug mode provides detailed information about:
   - API calls and responses
   - State changes
   - Error messages
   - Data format issues

### API Testing

For direct API testing, you can use the script provided in `docs/events_api_test.js`:

1. Open your browser console on the application
2. Copy and paste the test script
3. Run the test functions with your specific school ID:
   ```javascript
   const events = await testEventsAPI("your-school-id");
   ```

## Still Having Issues?

If you continue to experience problems:

1. Try clearing your browser cache and cookies
2. Restart both the frontend and backend servers
3. Check for any error messages in both frontend and backend console logs
4. Ensure you have the latest version of the application
5. Contact technical support with details of the issue and any error messages
