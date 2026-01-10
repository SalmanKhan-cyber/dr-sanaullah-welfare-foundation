import { supabaseAdmin } from './supabase.js';

/**
 * Upload a file to Supabase Storage
 * @param {string} bucket - Bucket name
 * @param {string} path - File path within bucket
 * @param {Buffer} buffer - File buffer
 * @param {string} contentType - MIME type
 * @returns {Promise<{url: string, path: string}>}
 */
export async function uploadFile(bucket, path, buffer, contentType) {
	console.log(`📤 Uploading to bucket "${bucket}" at path "${path}"`);
	
	const { error: uploadError } = await supabaseAdmin.storage
		.from(bucket)
		.upload(path, buffer, { contentType, upsert: false });
	
	if (uploadError) {
		console.error(`❌ Upload error for ${bucket}/${path}:`, uploadError);
		throw new Error(uploadError.message);
	}
	
	console.log(`✅ File uploaded successfully to ${bucket}/${path}`);
	
	// Try public URL first (for public buckets like 'medicines')
	const { data: publicUrlData } = supabaseAdmin.storage
		.from(bucket)
		.getPublicUrl(path);
	
	if (publicUrlData?.publicUrl) {
		console.log(`✅ Public URL created: ${publicUrlData.publicUrl.substring(0, 50)}...`);
		return { url: publicUrlData.publicUrl, path };
	}
	
	// Fallback to signed URL for private buckets
	const { data: signedData, error: signedError } = await supabaseAdmin.storage
		.from(bucket)
		.createSignedUrl(path, 60 * 60 * 24 * 365); // 1 year expiry
	
	if (signedError) {
		console.error(`❌ Error creating signed URL for ${bucket}/${path}:`, signedError);
		throw new Error(`Failed to create signed URL: ${signedError.message}`);
	}
	
	if (!signedData?.signedUrl) {
		console.error(`❌ No signed URL returned for ${bucket}/${path}`);
		throw new Error('Signed URL was not generated');
	}
	
	console.log(`✅ Signed URL created: ${signedData.signedUrl.substring(0, 50)}...`);
	
	return { url: signedData.signedUrl, path };
}

/**
 * Get a signed URL for a file
 * @param {string} bucket - Bucket name
 * @param {string} path - File path
 * @param {number} expiresIn - Expiry in seconds (default: 7 days)
 * @returns {Promise<string>}
 */
export async function getSignedUrl(bucket, path, expiresIn = 60 * 60 * 24 * 7) {
	const { data, error } = await supabaseAdmin.storage
		.from(bucket)
		.createSignedUrl(path, expiresIn);
	
	if (error) throw new Error(error.message);
	return data?.signedUrl;
}

/**
 * Delete a file from storage
 * @param {string} bucket - Bucket name
 * @param {string} path - File path
 */
export async function deleteFile(bucket, path) {
	const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
	if (error) throw new Error(error.message);
}

