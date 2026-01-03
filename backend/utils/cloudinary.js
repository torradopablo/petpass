
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = {
    uploadImage: async (imageData) => {
        try {
            const result = await cloudinary.uploader.upload(imageData, {
                folder: 'petpass',
                transformation: [
                    { width: 500, height: 500, crop: 'limit' },
                    { quality: 'auto' }
                ]
            });
            return result.secure_url;
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw error;
        }
    },

    deleteImage: async (imageUrl) => {
        try {
            // Extract public_id from Cloudinary URL
            // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
            const urlParts = imageUrl.split('/');
            const fileWithExt = urlParts[urlParts.length - 1];
            const publicId = `petpass/${fileWithExt.split('.')[0]}`;

            const result = await cloudinary.uploader.destroy(publicId);
            console.log('Image deleted from Cloudinary:', publicId, result);
            return result;
        } catch (error) {
            console.error('Cloudinary delete error:', error);
            // Don't throw error, just log it - we don't want to fail the operation if image deletion fails
            return null;
        }
    }
};
