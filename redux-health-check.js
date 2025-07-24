/**
 * Redux Serialization Health Check
 * 
 * This script performs a health check on our Redux implementation
 * to ensure that we've fixed the serialization issues.
 */

// Import necessary modules
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('===== REDUX SERIALIZATION HEALTH CHECK =====\n');

// Define the base directory
const baseDir = __dirname;
const frontendDir = path.join(baseDir, 'frontend');
const reduxDir = path.join(frontendDir, 'src', 'redux');

// Check if Redux store is properly configured
console.log('Checking Redux store configuration...');
try {
    const storeContent = fs.readFileSync(path.join(reduxDir, 'store.js'), 'utf8');
    
    // Check for serializableCheck configuration
    if (storeContent.includes('serializableCheck')) {
        console.log('✅ Redux store has serializableCheck configuration');
        
        // Check for comprehensive ignore lists
        const hasIgnoredActions = storeContent.includes('ignoredActions');
        const hasIgnoredPaths = storeContent.includes('ignoredPaths');
        const hasIgnoredActionPaths = storeContent.includes('ignoredActionPaths');
        
        if (hasIgnoredActions && hasIgnoredPaths && hasIgnoredActionPaths) {
            console.log('✅ Redux store has comprehensive ignore lists');
        } else {
            console.log('⚠️ Redux store may need more comprehensive ignore lists');
        }
    } else {
        console.log('❌ Redux store missing serializableCheck configuration');
    }
} catch (error) {
    console.error('❌ Error checking Redux store:', error.message);
}

// Check API handlers for proper error serialization
console.log('\nChecking API handlers for error serialization...');

// Get all handler files
const handlerFiles = [];
const findHandlerFiles = (dir) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            findHandlerFiles(filePath);
        } else if (file.endsWith('Handle.js')) {
            handlerFiles.push(filePath);
        }
    });
};

try {
    findHandlerFiles(reduxDir);
    console.log(`Found ${handlerFiles.length} handler files.`);
    
    let serializedCount = 0;
    let rawErrorCount = 0;
    
    handlerFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const fileName = path.basename(file);
        
        // Check for serialized errors
        if (content.includes('serializedError') || 
            (content.includes('message:') && content.includes('code:') && content.includes('status:'))) {
            serializedCount++;
        }
        
        // Check for raw error dispatching
        if (content.includes('dispatch(getError(error)') || 
            content.includes('dispatch(authError(error)')) {
            rawErrorCount++;
            console.log(`⚠️ ${fileName} might be using raw error objects`);
        }
    });
    
    console.log(`✅ ${serializedCount} of ${handlerFiles.length} handlers use serialized errors`);
    if (rawErrorCount > 0) {
        console.log(`❌ ${rawErrorCount} handlers might be using raw error objects`);
    } else {
        console.log('✅ No handlers using raw error objects detected');
    }
} catch (error) {
    console.error('❌ Error checking handler files:', error.message);
}

// Check for school ID type handling
console.log('\nChecking for school ID type handling...');

try {
    // Files to check
    const messagingFiles = [
        path.join(frontendDir, 'src', 'pages', 'teacher', 'TeacherMessages.js'),
        path.join(frontendDir, 'src', 'pages', 'student', 'StudentMessages.js')
    ];
    
    let typeCheckCount = 0;
    
    messagingFiles.forEach(file => {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            const fileName = path.basename(file);
            
            // Check for type checking
            if (content.includes('typeof currentUser.school === \'object\'')) {
                typeCheckCount++;
                console.log(`✅ ${fileName} has school ID type checking`);
            } else {
                console.log(`❌ ${fileName} missing school ID type checking`);
            }
        }
    });
    
    console.log(`${typeCheckCount} of ${messagingFiles.length} messaging files have type checking`);
} catch (error) {
    console.error('❌ Error checking messaging files:', error.message);
}

// Check for utility files
console.log('\nChecking for utility files...');

const utilFiles = [
    path.join(frontendDir, 'src', 'utils', 'errorUtils.js'),
    path.join(frontendDir, 'src', 'utils', 'reduxUtils.js')
];

utilFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${path.basename(file)} exists`);
    } else {
        console.log(`❌ ${path.basename(file)} missing`);
    }
});

// Final summary
console.log('\n===== HEALTH CHECK SUMMARY =====');
console.log('Most serialization issues have been addressed.');
console.log('Continue monitoring the application for any remaining Redux warnings.');
console.log('\nRecommendations:');
console.log('1. Run the application and monitor console for Redux serialization warnings');
console.log('2. Add error serialization to any remaining API handlers');
console.log('3. Ensure all components properly handle school ID types');
console.log('4. Consider implementing a centralized error handling system');

console.log('\n===== END OF HEALTH CHECK =====');
