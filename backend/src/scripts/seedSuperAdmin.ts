import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { config } from '../config/env';
import { connectDB } from '../config/db';

/**
 * Seed the super admin account
 * Email: superadmin@gmail.com
 * Password: super12345
 */
async function seedSuperAdmin() {
    try {
        await connectDB();

        const email = 'superadmin@gmail.com';
        const password = 'super12345';

        // Check if super admin already exists
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            console.log(' Super admin already exists');
            await mongoose.connection.close();
            return;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create super admin
        const admin = await User.create({
            email,
            passwordHash,
            role: 'ADMIN',
            tenantId: null, // null = can access all tenants
        });

        console.log(' Super admin created successfully!');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log(`   ID: ${admin.id}`);

        await mongoose.connection.close();
    } catch (error) {
        console.error(' Error seeding super admin:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    seedSuperAdmin();
}

export { seedSuperAdmin };
