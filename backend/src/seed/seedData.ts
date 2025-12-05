import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { connectDB } from '../config/db';
import { Tenant } from '../models/Tenant';
import { User } from '../models/User';
import { LogEvent } from '../models/LogEvent';
import { Alert } from '../models/Alert';
import { Counter } from '../models/Counter';

async function seed() {
    try {
        console.log(' Starting seed process...');

        await connectDB();

        console.log('  Clearing existing data...');
        await Tenant.deleteMany({});
        // Keep existing users (superadmin) - only delete demo users if they exist
        await User.deleteMany({ email: { $ne: 'superadmin@gmail.com' } });
        await LogEvent.deleteMany({});
        await Alert.deleteMany({});
        // Don't reset counter - keep existing IDs

        console.log(' Creating tenant...');
        const lumiqTenant = new Tenant({ name: 'Lumiq-thailand.com', key: 'LUMIQ' });
        await lumiqTenant.save();
        console.log(` Created tenant: ${lumiqTenant.id} (${lumiqTenant.name})`);

        console.log(' Creating log events...');

        const now = new Date();
        const events: any[] = [];

        const eventData = [
            {
                event_type: 'login_success',
                user: 'Jimmy',
                ip: '203.0.113.7',
                url: '/login',
                method: 'POST',
                status_code: 200,
                hoursAgo: 5
            },
            {
                event_type: 'page_view',
                user: 'Jimmy',
                ip: '203.0.113.7',
                url: '/dashboard',
                method: 'GET',
                status_code: 200,
                hoursAgo: 4.5
            },
            {
                event_type: 'login_failed',
                user: 'Jimmy',
                ip: '203.0.113.7',
                url: '/login',
                method: 'POST',
                status_code: 401,
                hoursAgo: 3
            },
            {
                event_type: 'login_success',
                user: 'John',
                ip: '10.0.1.10',
                url: '/login',
                method: 'POST',
                status_code: 200,
                hoursAgo: 6
            },
            {
                event_type: 'page_view',
                user: 'John',
                ip: '10.0.1.10',
                url: '/rooms',
                method: 'GET',
                status_code: 200,
                hoursAgo: 5.5
            },
            {
                event_type: 'api_request',
                user: 'John',
                ip: '10.0.1.10',
                url: '/api/bookings',
                method: 'POST',
                status_code: 201,
                hoursAgo: 5
            },
            {
                event_type: 'login_failed',
                user: 'Franco',
                ip: '192.168.1.55',
                url: '/login',
                method: 'POST',
                status_code: 401,
                hoursAgo: 2.5
            },
            {
                event_type: 'login_failed',
                user: 'Franco',
                ip: '192.168.1.55',
                url: '/login',
                method: 'POST',
                status_code: 401,
                hoursAgo: 2
            },
            {
                event_type: 'login_success',
                user: 'Franco',
                ip: '192.168.1.55',
                url: '/login',
                method: 'POST',
                status_code: 200,
                hoursAgo: 1.5
            },
            {
                event_type: 'page_view',
                user: 'Franco',
                ip: '192.168.1.55',
                url: '/profile',
                method: 'GET',
                status_code: 200,
                hoursAgo: 1
            },
        ];

        // Use save() instead of insertMany to trigger auto-increment
        for (const data of eventData) {
            const timestamp = new Date(now.getTime() - data.hoursAgo * 60 * 60 * 1000);
            const event = new LogEvent({
                // Remove hardcoded id - let pre-save hook assign it
                timestamp,
                tenantId: lumiqTenant.id,
                source: 'api',
                event_type: data.event_type,
                user: data.user,
                src_ip: data.ip,
                severity: data.event_type.includes('failed') ? 4 : 1,
                raw: {
                    url: data.url,
                    method: data.method,
                    status_code: data.status_code
                },
            });
            await event.save();
            events.push(event);
        }

        console.log(` Created ${events.length} log events`);

        console.log(' Creating alerts...');

        // Use save() to trigger auto-increment
        const alert1 = new Alert({
            // Remove hardcoded id
            tenantId: lumiqTenant.id,
            time: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            ruleName: 'Multiple Failed Login Attempts',
            ip: '192.168.1.55',
            user: 'Franco',
            count: 2,
            status: 'OPEN',
        });
        await alert1.save();

        const alert2 = new Alert({
            // Remove hardcoded id
            tenantId: lumiqTenant.id,
            time: new Date(now.getTime() - 3 * 60 * 60 * 1000),
            ruleName: 'Failed Login',
            ip: '203.0.113.7',
            user: 'Jimmy',
            count: 1,
            status: 'RESOLVED',
        });
        await alert2.save();

        const alerts = [alert1, alert2];
        console.log(` Created ${alerts.length} alerts`);

        console.log('\n ✅ Seed completed successfully!');
        console.log('\n 🔐 Login Credentials:');
        console.log('   → superadmin@gmail.com / super12345 (Super Admin - access ALL tenants)');
        console.log('\n 📊 Seeded Data:');
        console.log(`   → Tenant: Lumiq-thailand.com (ID: ${lumiqTenant.id})`);
        console.log(`   → Log Events: ${events.length} events from users: Jimmy, John, Franco`);
        console.log(`   → Alerts: ${alerts.length} security alerts`);
        console.log('\n 💡 Note: User names in logs are just data - they don\'t need matching accounts');
        console.log('   Users can sign up their own accounts at /signup');

        process.exit(0);
    } catch (error) {
        console.error(' Seed error:', error);
        process.exit(1);
    }
}

seed();
