const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    await testPasswordHashing();
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ MongoDB Error:', err.message);
  });

async function testPasswordHashing() {
  console.log('=== Testing Password Hashing ===\n');
  
  try {
    // Test 1: Create a user with plain password
    console.log('1. Creating user with password "secret123"...');
    
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'secret123'  // Plain password
    };
    
    // Delete if exists
    await User.deleteOne({ email: userData.email });
    
    // Create user
    const user = await User.create(userData);
    
    console.log('   User created:', {
      id: user._id,
      name: user.name,
      email: user.email,
      // Note: password is not returned due to select: false
    });
    console.log();
    
    // Test 2: Check what's stored in database
    console.log('2. Checking stored password in database...');
    
    // Find user WITH password (use select('+password'))
    const userWithPassword = await User.findById(user._id).select('+password');
    
    console.log('   Stored password hash:', userWithPassword.password);
    console.log('   Hash length:', userWithPassword.password.length, 'characters');
    console.log('   Is it plain text?', userWithPassword.password === 'secret123' ? '❌ YES (BAD!)' : '✅ NO (GOOD!)');
    console.log('   Looks hashed?', userWithPassword.password.startsWith('$2a$') ? '✅ YES' : '❌ NO');
    console.log();
    
    // Test 3: Verify password using comparePassword method
    console.log('3. Verifying passwords...');
    
    // Correct password
    const isCorrectPassword = await userWithPassword.comparePassword('secret123');
    console.log('   Correct password "secret123":', isCorrectPassword ? '✅ Match!' : '❌ No match');
    
    // Wrong password
    const isWrongPassword = await userWithPassword.comparePassword('wrongpassword');
    console.log('   Wrong password "wrongpassword":', isWrongPassword ? '❌ Match! (BAD)' : '✅ No match (GOOD)');
    console.log();
    
    // Test 4: Update user (password should not be re-hashed if not changed)
    console.log('4. Testing password re-hash on update...');
    
    const originalHash = userWithPassword.password;
    
    // Update name only (password not modified)
    userWithPassword.name = 'Updated Name';
    await userWithPassword.save();
    
    // Get updated user
    const updatedUser = await User.findById(user._id).select('+password');
    
    console.log('   Password changed after name update?', 
      originalHash === updatedUser.password ? '✅ NO (Good)' : '❌ YES (Bad - unnecessary rehash)');
    console.log();
    
    // Test 5: Update password (should be re-hashed)
    console.log('5. Testing password change...');
    
    updatedUser.password = 'newpassword456';
    await updatedUser.save();
    
    const userAfterPasswordChange = await User.findById(user._id).select('+password');
    
    console.log('   New password hash:', userAfterPasswordChange.password);
    console.log('   Different from old hash?', 
      originalHash !== userAfterPasswordChange.password ? '✅ YES (Good)' : '❌ NO (Bad)');
    
    // Verify new password works
    const newPasswordMatch = await userAfterPasswordChange.comparePassword('newpassword456');
    console.log('   New password verification:', newPasswordMatch ? '✅ Works' : '❌ Fails');
    console.log('   Old password still works?', 
      await userAfterPasswordChange.comparePassword('secret123') ? '❌ YES (BAD!)' : '✅ NO (GOOD!)');
    console.log();
    
    console.log('=== All tests completed! ===');
    console.log('\n✅ bcryptjs is working correctly!');
    console.log('Passwords are now securely hashed before saving.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}