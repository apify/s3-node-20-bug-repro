import { Readable } from 'stream';
import { S3 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import async from 'async';

// This script uploads a lot of testing files to S3 with a high concurrency,
// to try to reproduce the issue with InternalServer errors from S3
// that happen with Node 20.

const BUCKET = 'my-testing-s3-bucket-abcd1234'; // FIXME: Change this to your testing bucket name
const TOTAL_UPLOADS = 10_000_000; // The issue happens approximately every 1_000_000 uploads, this should be enough to reproduce it
const CONCURRENCY = 100;

// Use `maxAttempts: 1` to reproduce the issue easier, but it happens even with the default 3 attempts
const client = new S3({ maxAttempts: 1 });

let lastSlowDownErrorReportedAt = 0;

const doUpload = async (i) => {
    // Sleep for 1 second if SlowDown error was reported in the last second
    if (Date.now() - lastSlowDownErrorReportedAt < 1000) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    try {
        process.stdout.write(`Uploading ${i+1}/${TOTAL_UPLOADS}...\r`);

        const upload = new Upload({
            client,
            params: {
                Bucket: BUCKET,
                Key: `file-${i}`,
                Body: Readable.from('abcd'),
            },
        });

        await upload.done();
    } catch (e) {
        if (e.code === 'ECONNRESET') return; // Ignore ECONNRESET errors, they happen from time to time and they're not important for this test
        if (e.code === 'ENOTFOUND') return; // Ignore ENOTFOUND errors, they happen from time to time and they're not important for this test
        if (e.Code === 'SlowDown') { // Remember when SlowDown error was reported, so that we can slow down the next requests in case we're rate limited
            lastSlowDownErrorReportedAt = Date.now();
            return;
        }
        console.error(`Upload ${i} failed at ${new Date().toISOString()}`, e);
    }
}

await async.mapLimit(
    Array.from({ length: TOTAL_UPLOADS }, (_, i) => i),
    CONCURRENCY,
    doUpload,
);

console.log('\nDone');