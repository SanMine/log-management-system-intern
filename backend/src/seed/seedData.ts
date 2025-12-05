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
        await User.deleteMany({});
        await LogEvent.deleteMany({});
        await Alert.deleteMany({});
        await Counter.deleteMany({});

        console.log(' Creating tenant...');
        const lumiqTenant = new Tenant({ name: 'Lumiq-thailand.com', key: 'LUMIQ' });
        await lumiqTenant.save();
        console.log(` Created tenant: ${lumiqTenant.id} (${lumiqTenant.name})`);

        console.log(' Creating users...');

        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = new User({
            email: 'admin@system.com',
            passwordHash: adminPassword,
            role: 'ADMIN',
            tenantId: null,
        });
        await admin.save();

        const jimmyPassword = await bcrypt.hash('jimmy123', 10);
        const jimmy = new User({
            email: 'admin@lumiq.com',
            passwordHash: jimmyPassword,
            role: 'VIEWER',
            tenantId: lumiqTenant.id,
        });
        await jimmy.save();

        const johnPassword = await bcrypt.hash('john123', 10);
        const john = new User({
            email: 'john@lumiq.com',
            passwordHash: johnPassword,
            role: 'VIEWER',
            tenantId: lumiqTenant.id,
        });
        await john.save();

        const francoPassword = await bcrypt.hash('franco123', 10);
        const franco = new User({
            email: 'franco@lumiq.com',
            passwordHash: francoPassword,
            role: 'VIEWER',
            tenantId: lumiqTenant.id,
        });
        await franco.save();

        console.log(` Created users: Admin, Jimmy, John, Franco`);

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

        eventData.forEach((data, index) => {
            const timestamp = new Date(now.getTime() - data.hoursAgo * 60 * 60 * 1000);
            events.push(
                new LogEvent({
                    id: index + 1,
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
                })
            );
        });

        await LogEvent.insertMany(events);
        console.log(` Created ${events.length} log events`);

        console.log(' Creating alerts...');

        const alerts = [
            new Alert({
                id: 1,
                tenantId: lumiqTenant.id,
                time: new Date(now.getTime() - 2 * 60 * 60 * 1000),
                ruleName: 'Multiple Failed Login Attempts',
                ip: '192.168.1.55',
                user: 'Franco',
                count: 2,
                status: 'OPEN',
            }),
            new Alert({
                id: 2,
                tenantId: lumiqTenant.id,
                time: new Date(now.getTime() - 3 * 60 * 60 * 1000),
                ruleName: 'Failed Login',
                ip: '203.0.113.7',
                user: 'Jimmy',
                count: 1,
                status: 'RESOLVED',
            }),
        ];

        await Alert.insertMany(alerts);
        console.log(` Created ${alerts.length} alerts`);

        console.log('\n Seed completed successfully!');
        console.log('\n Login Credentials:');
        console.log('   Super Admin: admin@system.com / admin123 (access to ALL tenants)');
        console.log('   Lumiq Admin: admin@lumiq.com / jimmy123 (Lumiq-thailand.com only)');
        console.log('   John:        john@lumiq.com / john123 (Lumiq-thailand.com only)');
        console.log('   Franco:      franco@lumiq.com / franco123 (Lumiq-thailand.com only)');
        console.log('\n Tenant:');
        console.log('  Lumiq-thailand.com (ID: 1)');
        console.log('\n Data Summary:');
        console.log(`  ${events.length} log events`);
        console.log(`  ${alerts.length} alerts`);
        console.log('  4 users (1 Super Admin, 3 Lumiq Admins)');

        process.exit(0);
    } catch (error) {
        console.error(' Seed error:', error);
        process.exit(1);
    }
}

seed();
