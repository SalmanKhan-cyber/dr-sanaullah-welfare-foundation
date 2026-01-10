import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { generateReceiptHTML } from '../lib/receipt.js';
import { uploadFile } from '../lib/storage.js';

const router = Router();

// Create donation (with payment gateway stub)
router.post('/', async (req, res) => {
	try {
		const donorId = req.user.id;
		const { amount, purpose, paymentMethod, donor_type, cnic, passport_number } = req.body || {};
		if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid amount required' });
		
		// Ensure user has donor role in metadata (update if not set)
		if (req.user.role !== 'donor') {
			// Update user metadata to include donor role
			const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(donorId);
			if (user) {
				const currentMetadata = user.user_metadata || {};
				const updatedMetadata = { ...currentMetadata, role: 'donor' };
				await supabaseAdmin.auth.admin.updateUserById(donorId, {
					user_metadata: updatedMetadata
				});
			}
		}
		
		// Payment gateway integration stub (Stripe/PayPal)
		// const paymentIntent = await stripe.paymentIntents.create({ amount, currency: 'pkr' });
		
		const donationData = { donor_id: donorId, amount, purpose };
		if (donor_type) donationData.donor_type = donor_type;
		if (cnic) donationData.cnic = cnic;
		if (passport_number) donationData.passport_number = passport_number;
		
		const { data: donation, error } = await supabaseAdmin
			.from('donations')
			.insert(donationData)
			.select('*, users(name, email, phone)')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		
		// Generate receipt HTML with all details
		const receiptHTML = generateReceiptHTML({
			id: donation.id,
			amount: donation.amount,
			purpose: donation.purpose,
			created_at: donation.created_at,
			donor_name: donation.users?.name,
			donor_email: donation.users?.email,
			donor_phone: donation.users?.phone,
			donor_type: donation.donor_type,
			cnic: donation.cnic,
			passport_number: donation.passport_number
		});
		
		// In production: convert HTML to PDF and upload to 'receipts' bucket
		// const pdfBuffer = await generateReceiptPDF(donation);
		// const receiptPath = `${donorId}/${donation.id}.pdf`;
		// await uploadFile('receipts', receiptPath, pdfBuffer, 'application/pdf');
		
		await supabaseAdmin.from('notifications').insert({
			user_id: donorId,
			message: `Thank you for your donation of PKR ${amount}!`
		});
		
		res.json({ donation, receiptHTML });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get my donations
router.get('/me', async (req, res) => {
	try {
		const donorId = req.user.id;
		const { data, error } = await supabaseAdmin
			.from('donations')
			.select('*')
			.eq('donor_id', donorId)
			.order('created_at', { ascending: false });
		if (error) return res.status(400).json({ error: error.message });
		res.json({ donations: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Admin: Get all donations
router.get('/all', async (req, res) => {
	try {
		if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
		
		// OPTIMIZED: Add pagination to prevent loading all donations at once
		const limit = parseInt(req.query.limit) || 1000; // Default 1000
		const offset = parseInt(req.query.offset) || 0;
		
		const { data, error } = await supabaseAdmin
			.from('donations')
			.select('id, amount, purpose, created_at, donor_type, cnic, passport_number, users(name, email)')
			.order('created_at', { ascending: false })
			.range(offset, offset + limit - 1);
		
		if (error) return res.status(400).json({ error: error.message });
		res.json({ donations: data || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Admin: Create donation on behalf of donor
router.post('/admin', async (req, res) => {
	try {
		if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
		
		const { amount, purpose, donor_id, donor_type, cnic, passport_number, donor_name, donor_email } = req.body || {};
		
		if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid amount required' });
		if (!purpose) return res.status(400).json({ error: 'Purpose required' });
		
		// If donor_id is provided, use it. Otherwise, create anonymous donation or find/create user
		let finalDonorId = donor_id || null;
		
		// If donor name/email provided but no donor_id, try to find or create user
		if (!finalDonorId && (donor_name || donor_email)) {
			if (donor_email) {
				// Try to find existing user by email
				const { data: existingUser } = await supabaseAdmin
					.from('users')
					.select('id')
					.eq('email', donor_email)
					.single();
				
				if (existingUser) {
					finalDonorId = existingUser.id;
				} else if (donor_name && donor_email) {
					// Create a basic user record if email and name provided
					// Note: This creates a user without auth account (for record keeping)
					const { data: newUser, error: userError } = await supabaseAdmin
						.from('users')
						.insert({
							name: donor_name,
							email: donor_email,
							role: 'donor'
						})
						.select('id')
						.single();
					
					if (!userError && newUser) {
						finalDonorId = newUser.id;
					}
				}
			}
		}
		
		const donationData = { 
			donor_id: finalDonorId,
			amount, 
			purpose 
		};
		
		if (donor_type) donationData.donor_type = donor_type;
		if (cnic) donationData.cnic = cnic;
		if (passport_number) donationData.passport_number = passport_number;
		// Store donor_name and donor_email directly in donations table
		if (donor_name) donationData.donor_name = donor_name;
		if (donor_email) donationData.donor_email = donor_email;
		
		const { data: donation, error } = await supabaseAdmin
			.from('donations')
			.insert(donationData)
			.select('*, users(name, email)')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		
		// Generate receipt HTML
		const receiptHTML = generateReceiptHTML({
			id: donation.id,
			amount: donation.amount,
			purpose: donation.purpose,
			created_at: donation.created_at,
			donor_name: donation.users?.name || donor_name || 'Anonymous',
			donor_email: donation.users?.email || donor_email || ''
		});
		
		// Send notification if donor_id exists
		if (finalDonorId) {
			await supabaseAdmin.from('notifications').insert({
				user_id: finalDonorId,
				message: `Thank you for your donation of PKR ${amount}!`
			});
		}
		
		res.json({ donation, receiptHTML });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Download receipt
router.get('/:id/receipt', async (req, res) => {
	try {
		const { id } = req.params;
		const { data: donation, error: fetchError } = await supabaseAdmin
			.from('donations')
			.select('*, users(name, email, phone)')
			.eq('id', id)
			.eq('donor_id', req.user.id)
			.single();
		
		if (fetchError || !donation) {
			console.error('Receipt fetch error:', fetchError);
			return res.status(404).json({ error: 'Donation not found or access denied' });
		}
		
		const receiptHTML = generateReceiptHTML({
			id: donation.id,
			amount: donation.amount,
			purpose: donation.purpose,
			created_at: donation.created_at,
			donor_name: donation.users?.name,
			donor_email: donation.users?.email,
			donor_phone: donation.users?.phone,
			donor_type: donation.donor_type,
			cnic: donation.cnic,
			passport_number: donation.passport_number
		});
		
		res.setHeader('Content-Type', 'text/html');
		res.send(receiptHTML);
	} catch (err) {
		console.error('Receipt generation error:', err);
		res.status(500).json({ error: err.message });
	}
});

// Admin: Get receipt by ID (for tracing)
router.get('/receipt/:id', async (req, res) => {
	try {
		if (req.user.role !== 'admin') {
			return res.status(403).json({ error: 'Admin access required' });
		}
		
		const { id } = req.params;
		const { data: donation, error: fetchError } = await supabaseAdmin
			.from('donations')
			.select('*, users(name, email, phone)')
			.eq('id', id)
			.single();
		
		if (fetchError || !donation) {
			console.error('Admin receipt fetch error:', fetchError);
			return res.status(404).json({ error: 'Receipt not found' });
		}
		
		const receiptHTML = generateReceiptHTML({
			id: donation.id,
			amount: donation.amount,
			purpose: donation.purpose,
			created_at: donation.created_at,
			donor_name: donation.users?.name,
			donor_email: donation.users?.email,
			donor_phone: donation.users?.phone,
			donor_type: donation.donor_type,
			cnic: donation.cnic,
			passport_number: donation.passport_number
		});
		
		res.setHeader('Content-Type', 'text/html');
		res.send(receiptHTML);
	} catch (err) {
		console.error('Admin receipt generation error:', err);
		res.status(500).json({ error: err.message });
	}
});

// Admin: Get donation details by receipt ID (JSON)
router.get('/admin/:id', async (req, res) => {
	try {
		if (req.user.role !== 'admin') {
			return res.status(403).json({ error: 'Admin access required' });
		}
		
		const { id } = req.params;
		const { data: donation, error } = await supabaseAdmin
			.from('donations')
			.select('*, users(name, email, phone)')
			.eq('id', id)
			.single();
		
		if (error || !donation) {
			return res.status(404).json({ error: 'Donation not found' });
		}
		
		res.json({ donation });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Admin: Update donation
router.put('/admin/:id', async (req, res) => {
	try {
		if (req.user.role !== 'admin') {
			return res.status(403).json({ error: 'Admin access required' });
		}
		
		const { id } = req.params;
		const { amount, purpose, donor_id, donor_type, cnic, passport_number, donor_name, donor_email } = req.body || {};
		
		const updateData = {};
		if (amount !== undefined) updateData.amount = amount;
		if (purpose !== undefined) updateData.purpose = purpose;
		if (donor_id !== undefined) updateData.donor_id = donor_id;
		if (donor_type !== undefined) updateData.donor_type = donor_type;
		if (cnic !== undefined) updateData.cnic = cnic;
		if (passport_number !== undefined) updateData.passport_number = passport_number;
		if (donor_name !== undefined) updateData.donor_name = donor_name;
		if (donor_email !== undefined) updateData.donor_email = donor_email;
		
		const { data: donation, error } = await supabaseAdmin
			.from('donations')
			.update(updateData)
			.eq('id', id)
			.select('*, users(name, email)')
			.single();
		
		if (error) {
			return res.status(400).json({ error: error.message });
		}
		
		if (!donation) {
			return res.status(404).json({ error: 'Donation not found' });
		}
		
		res.json({ donation });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Admin: Delete donation
router.delete('/admin/:id', async (req, res) => {
	try {
		if (req.user.role !== 'admin') {
			return res.status(403).json({ error: 'Admin access required' });
		}
		
		const { id } = req.params;
		
		const { error } = await supabaseAdmin
			.from('donations')
			.delete()
			.eq('id', id);
		
		if (error) {
			return res.status(400).json({ error: error.message });
		}
		
		res.json({ success: true, message: 'Donation deleted successfully' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

export default router;
