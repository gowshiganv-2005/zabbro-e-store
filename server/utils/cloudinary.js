/**
 * Cloudinary Storage Utility
 * Handles image uploads to Cloudinary and generates optimized links.
 */

const cloudinary = require('cloudinary').v2;
const path = require('path');
const dotenv = require('dotenv');

// Hardcoded Fallbacks for absolute stability
const CLOUD_NAME = 'dmsuuno0d';
const API_KEY = '539135726669395';
const API_SECRET = 'jJnB9qdoS_08vD7RX4yQI16B_6A';

// Force load the .env from root
const envPath = path.join(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath });

// Final credentials priority: Environment -> Hardcoded
const getCreds = () => ({
    name: (process.env.CLOUDINARY_CLOUD_NAME || CLOUD_NAME).trim(),
    key: (process.env.CLOUDINARY_API_KEY || API_KEY).trim(),
    secret: (process.env.CLOUDINARY_API_SECRET || API_SECRET).trim()
});

/** Verify configuration */
const isCloudinaryConfigured = () => {
    const { name, key, secret } = getCreds();
    return !!(name && key && secret);
};

/** Initialize Cloudinary */
const init = () => {
    const { name, key, secret } = getCreds();
    cloudinary.config({
        cloud_name: name,
        api_key: String(key),
        api_secret: secret,
    });
    console.log(`[Cloudinary] System Active: ${name}`);
};

init();

/** Upload image buffer to Cloudinary */
async function uploadToCloudinary(buffer, fileName) {
    if (!isCloudinaryConfigured()) {
        throw new Error("Cloudinary configuration failed. Please check credentials.");
    }

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'zabbro_store',
                use_filename: true,
                unique_filename: true,
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) {
                    console.error('❌ Cloudinary Upload Error:', error.message);
                    return reject(error);
                }
                console.log(`✅ Image uploaded to Cloudinary: ${result.secure_url}`);
                resolve(result.secure_url);
            }
        );

        const Readable = require('stream').Readable;
        const readable = new Readable();
        readable.push(buffer);
        readable.push(null);
        readable.pipe(uploadStream);
    });
}

/** Delete image from Cloudinary by URL */
async function deleteFromCloudinary(url) {
    try {
        const publicId = url.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`zabbro_store/${publicId}`);
        return true;
    } catch (error) {
        console.error('❌ Cloudinary Delete Error:', error.message);
        return false;
    }
}

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary,
};
