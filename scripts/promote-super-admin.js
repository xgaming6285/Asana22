const { PrismaClient } = require('@prisma/client');
const { decryptUserData, encryptUserData } = require('../src/app/utils/encryption');

const prisma = new PrismaClient();

async function promoteUserToSuperAdmin(email) {
  try {
    console.log(`Looking for user with email: ${email}`);
    
    // Since emails are encrypted, we need to find the user by decrypting all emails
    const allUsers = await prisma.user.findMany();
    
    let targetUser = null;
    for (const user of allUsers) {
      const decryptedUser = decryptUserData(user);
      if (decryptedUser.email === email) {
        targetUser = user;
        break;
      }
    }
    
    if (!targetUser) {
      console.error(`User with email ${email} not found`);
      return;
    }
    
    console.log(`Found user: ${decryptUserData(targetUser).firstName} ${decryptUserData(targetUser).lastName}`);
    
    // Check if already super admin
    if (targetUser.systemRole === 'SUPER_ADMIN') {
      console.log('User is already a super admin');
      return;
    }
    
    // Update user to super admin
    const updatedUser = await prisma.user.update({
      where: { id: targetUser.id },
      data: { systemRole: 'SUPER_ADMIN' },
    });
    
    console.log(`Successfully promoted user to super admin!`);
    console.log(`User ID: ${updatedUser.id}`);
    console.log(`Email: ${email}`);
    console.log(`System Role: ${updatedUser.systemRole}`);
    
  } catch (error) {
    console.error('Error promoting user to super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address');
  console.error('Usage: node scripts/promote-super-admin.js user@example.com');
  process.exit(1);
}

promoteUserToSuperAdmin(email); 