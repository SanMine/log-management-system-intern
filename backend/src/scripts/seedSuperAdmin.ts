import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { config } from '../config/env';
import { connectDB } from '../config/db';

async function seedSuperAdmin() {
    try {
        await connectDB();

        const email = 'superadmin@gmail.com';
        const password = 'super12345';

        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            console.log(' Super admin already exists');
            await mongoose.connection.close();
            return;
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const admin = await User.create({
            email,
            passwordHash,
            role: 'ADMIN',
            tenantId: null,
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

if (require.main === module) {
    seedSuperAdmin();
}

export { seedSuperAdmin };
