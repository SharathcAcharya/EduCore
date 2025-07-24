// Student Login Data Fixer
// This script diagnoses and repairs student login issues in the database

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const readline = require('readline');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
});

// Create Student Schema and Model
const studentSchema = new mongoose.Schema({
    name: String,
    rollNum: Number,
    password: String,
    sclassName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass'
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin'
    },
    role: {
        type: String,
        default: "Student"
    }
});

const Student = mongoose.model('student', studentSchema);

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Main function
async function fixStudentData() {
    console.log('=== Student Login Data Fixer ===');
    
    // Option menu
    console.log('\nChoose an option:');
    console.log('1. Check student by roll number and name');
    console.log('2. Fix student password');
    console.log('3. List all students');
    console.log('4. Exit');
    
    rl.question('\nEnter option number: ', async (option) => {
        switch(option) {
            case '1':
                await checkStudent();
                break;
            case '2':
                await fixPassword();
                break;
            case '3':
                await listAllStudents();
                break;
            case '4':
                console.log('Exiting...');
                await mongoose.connection.close();
                rl.close();
                return;
            default:
                console.log('Invalid option, please try again');
                fixStudentData();
                break;
        }
    });
}

// Function to check student
async function checkStudent() {
    rl.question('Enter roll number: ', async (rollNum) => {
        rl.question('Enter student name: ', async (name) => {
            try {
                // Convert roll number to numeric if possible
                const rollNumValue = !isNaN(rollNum) ? parseInt(rollNum) : rollNum;
                
                // Find student
                const student = await Student.findOne({ 
                    rollNum: rollNumValue, 
                    name: name 
                })
                .populate('school', 'schoolName')
                .populate('sclassName', 'sclassName');
                
                if (student) {
                    console.log('\n✅ Student found:');
                    console.log('ID:', student._id);
                    console.log('Name:', student.name);
                    console.log('Roll Number:', student.rollNum);
                    console.log('School:', student.school ? student.school.schoolName : 'Not assigned');
                    console.log('Class:', student.sclassName ? student.sclassName.sclassName : 'Not assigned');
                    console.log('Password hash:', student.password ? '(Password is set)' : '(No password)');
                } else {
                    console.log('\n❌ Student not found with provided roll number and name');
                    
                    // Try to find by partial match
                    console.log('\nSearching for similar students...');
                    const similarStudents = await Student.find({
                        $or: [
                            { name: { $regex: new RegExp(name, 'i') } },
                            { rollNum: rollNumValue }
                        ]
                    }).limit(5);
                    
                    if (similarStudents.length > 0) {
                        console.log('\nFound similar students:');
                        similarStudents.forEach((s, index) => {
                            console.log(`${index + 1}. Name: ${s.name}, Roll: ${s.rollNum}`);
                        });
                    } else {
                        console.log('No similar students found');
                    }
                }
            } catch (error) {
                console.error('Error checking student:', error);
            }
            
            // Return to main menu
            setTimeout(() => {
                fixStudentData();
            }, 1000);
        });
    });
}

// Function to fix student password
async function fixPassword() {
    rl.question('Enter roll number: ', async (rollNum) => {
        rl.question('Enter student name: ', async (name) => {
            try {
                // Convert roll number to numeric if possible
                const rollNumValue = !isNaN(rollNum) ? parseInt(rollNum) : rollNum;
                
                // Find student
                const student = await Student.findOne({ 
                    rollNum: rollNumValue, 
                    name: name 
                });
                
                if (student) {
                    console.log('\n✅ Student found. Setting new password...');
                    
                    rl.question('Enter new password: ', async (password) => {
                        // Hash password
                        const salt = await bcrypt.genSalt(10);
                        const hashedPassword = await bcrypt.hash(password, salt);
                        
                        // Update student password
                        await Student.updateOne(
                            { _id: student._id },
                            { $set: { password: hashedPassword } }
                        );
                        
                        console.log('✅ Password updated successfully!');
                        
                        // Return to main menu
                        setTimeout(() => {
                            fixStudentData();
                        }, 1000);
                    });
                } else {
                    console.log('\n❌ Student not found with provided roll number and name');
                    
                    // Return to main menu
                    setTimeout(() => {
                        fixStudentData();
                    }, 1000);
                }
            } catch (error) {
                console.error('Error fixing password:', error);
                
                // Return to main menu
                setTimeout(() => {
                    fixStudentData();
                }, 1000);
            }
        });
    });
}

// Function to list all students
async function listAllStudents() {
    try {
        const students = await Student.find()
            .populate('school', 'schoolName')
            .populate('sclassName', 'sclassName')
            .sort({ name: 1 })
            .limit(20);
        
        if (students.length > 0) {
            console.log('\n=== Student List ===');
            students.forEach((student, index) => {
                console.log(`\n${index + 1}. ${student.name} (Roll: ${student.rollNum})`);
                console.log(`   School: ${student.school ? student.school.schoolName : 'Not assigned'}`);
                console.log(`   Class: ${student.sclassName ? student.sclassName.sclassName : 'Not assigned'}`);
                console.log(`   ID: ${student._id}`);
            });
            
            console.log('\nShowing first 20 students. Total count:', await Student.countDocuments());
        } else {
            console.log('\nNo students found in the database');
        }
    } catch (error) {
        console.error('Error listing students:', error);
    }
    
    // Return to main menu
    setTimeout(() => {
        fixStudentData();
    }, 1000);
}

// Start the program
fixStudentData();
