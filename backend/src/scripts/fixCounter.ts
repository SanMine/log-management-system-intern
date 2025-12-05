import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Counter } from '../models/Counter';
import { LogEvent } from '../models/LogEvent';

/**
 * Fix the counter to match the current max ID in the database
 */
async function fixCounter() {
    try {
        console.log(' Fixing counter...');

        // Connect to database
        await connectDB();

        // Find the maximum ID in LogEvents
        const maxEvent = await LogEvent.findOne().sort({ id: -1 }).select('id');
        const maxId = maxEvent ? maxEvent.id : 0;

        console.log(` Current max ID in database: ${maxId}`);

        // Check current counter value
        const currentCounter = await Counter.findById('logEvent');
        console.log(` Current counter value: ${currentCounter?.seq || 'not set'}`);

        // Update the counter to start from maxId + 1
        await Counter.findByIdAndUpdate(
            'logEvent',  // Use 'logEvent' not 'logevent'
            { seq: maxId },
            { upsert: true, new: true }
        );

        const updatedCounter = await Counter.findById('logEvent');
        console.log(` Counter updated! Current value: ${updatedCounter?.seq}, Next ID will be: ${maxId + 1}`);

        process.exit(0);
    } catch (error) {
        console.error(' Error fixing counter:', error);
        process.exit(1);
    }
}

fixCounter();
