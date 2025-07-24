// config-test.js
// A simple script to verify the backend configuration

const fs = require('fs');
const path = require('path');

// Check backend port
const backendIndexPath = path.join(__dirname, 'backend', 'index.js');
const frontendConfigPath = path.join(__dirname, 'frontend', 'src', 'config.js');

console.log('Checking backend port configuration...');
try {
    const backendCode = fs.readFileSync(backendIndexPath, 'utf8');
    const portMatch = backendCode.match(/const PORT = process\.env\.PORT \|\| (\d+)/);
    if (portMatch) {
        console.log(`Backend is configured to use port: ${portMatch[1]}`);
    } else {
        console.log('Could not determine backend port from index.js');
    }
} catch (err) {
    console.error('Error reading backend index.js:', err.message);
}

console.log('\nChecking frontend configuration...');
try {
    const frontendConfig = fs.readFileSync(frontendConfigPath, 'utf8');
    const baseUrlMatch = frontendConfig.match(/export const BASE_URL = [^']*'([^']+)'/);
    if (baseUrlMatch) {
        console.log(`Frontend is configured to connect to: ${baseUrlMatch[1]}`);
    } else {
        console.log('Could not determine BASE_URL from config.js');
    }
} catch (err) {
    console.error('Error reading frontend config.js:', err.message);
}

console.log('\nChecking if ports are in use...');
const { execSync } = require('child_process');
try {
    const netstatOutput = execSync('netstat -ano | findstr LISTENING').toString();
    console.log('Ports in use:');
    [5000, 5001, 3000].forEach(port => {
        const portMatch = netstatOutput.match(new RegExp(`TCP.*?:${port}.*?LISTENING.*?(\\d+)`));
        if (portMatch) {
            console.log(`Port ${port} is in use by process ID: ${portMatch[1]}`);
        } else {
            console.log(`Port ${port} is not in use`);
        }
    });
} catch (err) {
    console.error('Error checking ports:', err.message);
}
