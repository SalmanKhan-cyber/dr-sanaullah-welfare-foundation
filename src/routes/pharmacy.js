import { Router } from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../lib/supabase.js';
import { uploadFile } from '../lib/storage.js';
import { rbac } from '../middleware/rbac.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// Legacy pharmacy_items routes (for old schema)
router.get('/items', async (_req, res) => {
	const { data, error } = await supabaseAdmin.from('pharmacy_items').select('*').order('name');
	if (error) return res.status(400).json({ error: error.message });
	res.json({ items: data });
});

router.post('/items', async (req, res) => {
	const { name, stock, expiry, discount_rate } = req.body || {};
	const { data, error } = await supabaseAdmin
		.from('pharmacy_items')
		.insert({ name, stock, expiry, discount_rate })
		.select('*')
		.single();
	if (error) return res.status(400).json({ error: error.message });
	res.json({ item: data });
});

// New pharmacy_inventory routes (for updated schema)
// Optimized: Only select necessary fields, handle missing columns gracefully, no expensive count query
router.get('/inventory', async (req, res) => {
	const queryStartTime = Date.now();
	let timeoutId = null;
	
	try {
		const limit = parseInt(req.query.limit) || 100; // Default limit to 100 items
		const offset = parseInt(req.query.offset) || 0;
		
		console.log(`📦 Loading pharmacy inventory (limit: ${limit}, offset: ${offset})`);
		
		// Set a timeout for the query (5 seconds max - fail fast)
		const queryPromise = (async () => {
			// Try with image_url first, fallback without it if column doesn't exist
			let selectFields = 'medicine_id, name, category, price, discount_percentage, stock_quantity, supplier_info, image_url';
			
			let { data, error } = await supabaseAdmin
				.from('pharmacy_inventory')
				.select(selectFields)
				.order('name', { ascending: true })
				.range(offset, offset + limit - 1);
			
			// If error is about missing column, retry without image_url
			if (error && (error.message?.includes('image_url') || error.message?.includes('column') || error.message?.includes('schema cache'))) {
				console.warn('⚠️ image_url column not found, querying without it...');
				selectFields = 'medicine_id, name, category, price, discount_percentage, stock_quantity, supplier_info';
				const retry = await supabaseAdmin
					.from('pharmacy_inventory')
					.select(selectFields)
					.order('name', { ascending: true })
					.range(offset, offset + limit - 1);
				
				if (retry.error) {
					throw retry.error;
				}
				
				// Add null image_url for consistency
				data = (retry.data || []).map(item => ({ ...item, image_url: null }));
				error = null;
			}
			
			if (error) {
				throw error;
			}
			
			return data || [];
		})();
		
		// Race the query against a timeout (reduced to 3 seconds for faster failure)
		const timeoutPromise = new Promise((_, reject) => {
			timeoutId = setTimeout(() => {
				reject(new Error('Database query timeout after 3 seconds'));
			}, 3000);
		});
		
		const items = await Promise.race([queryPromise, timeoutPromise]);
		clearTimeout(timeoutId);
		
		const queryTime = Date.now() - queryStartTime;
		console.log(`✅ Loaded ${items.length} pharmacy items in ${queryTime}ms`);
		
		res.json({ 
			items,
			total: items.length, // Don't fetch exact count - it's expensive and causes timeouts
			limit,
			offset
		});
	} catch (err) {
		if (timeoutId) clearTimeout(timeoutId);
		console.error('❌ Pharmacy inventory error:', err);
		
		if (!res.headersSent) {
			// Provide helpful error message
			if (err.message?.includes('timeout')) {
				res.status(504).json({ 
					error: 'Database query timeout',
					hint: 'The database is taking too long to respond. This may be due to network issues or a large dataset.'
				});
			} else if (err.message?.includes('image_url') || err.message?.includes('column')) {
				res.status(400).json({ 
					error: err.message,
					hint: 'The image_url column is missing. Please run: ALTER TABLE pharmacy_inventory ADD COLUMN IF NOT EXISTS image_url TEXT;'
				});
			} else {
				res.status(500).json({ error: err.message });
			}
		}
	}
});

// Admin/Pharmacy only - add medicine
router.post('/inventory', rbac(['admin', 'pharmacy']), upload.single('image'), async (req, res) => {
	try {
		console.log('📥 Received POST request to add medicine');
		console.log('   Body fields:', Object.keys(req.body || {}));
		console.log('   Has file:', !!req.file);
		
		const { name, category, description, price, discount_percentage, stock_quantity, supplier_info } = req.body || {};
		
		// Validate required fields
		if (!name || !category) {
			return res.status(400).json({ error: 'Name and category are required' });
		}
		
		let imageUrl = null;
		
		// Upload image if provided
		if (req.file) {
			try {
				const path = `medicines/${Date.now()}-${req.file.originalname}`;
				console.log('📤 Uploading image to:', path);
				const uploadResult = await uploadFile('medicines', path, req.file.buffer, req.file.mimetype);
				if (uploadResult && uploadResult.url) {
					imageUrl = uploadResult.url;
					console.log('✅ Image uploaded successfully:', imageUrl);
				}
			} catch (uploadError) {
				console.error('❌ Image upload error:', uploadError);
				// Check if bucket doesn't exist
				if (uploadError.message?.includes('Bucket') || uploadError.message?.includes('not found')) {
					console.error('🚨 CRITICAL: Storage bucket "medicines" does not exist!');
					console.error('   Please create the bucket in Supabase Dashboard or run the SQL script:');
					console.error('   File: supabase/create-medicines-bucket.sql');
					// Continue without image - don't fail the entire request
				} else {
					console.error('   Upload failed:', uploadError.message);
				}
				// Continue without image if upload fails
			}
		}
		
		const insertData = {
			name,
			category,
			description: description || null,
			price: parseFloat(price) || 0,
			discount_percentage: parseFloat(discount_percentage) || 0,
			stock_quantity: parseInt(stock_quantity) || 0,
			supplier_info: supplier_info || null,
			image_url: imageUrl
		};
		
		console.log('💾 Inserting medicine:', { ...insertData, image_url: imageUrl ? 'present' : 'null' });
		
		const { data, error } = await supabaseAdmin
			.from('pharmacy_inventory')
			.insert(insertData)
			.select('*')
			.single();
			
		if (error) {
			console.error('❌ Database insert error:', error);
			return res.status(400).json({ error: error.message });
		}
		
		console.log('✅ Medicine added successfully:', data?.medicine_id || data?.id);
		res.json({ item: data });
	} catch (err) {
		console.error('❌ POST /inventory error:', err);
		res.status(500).json({ error: err.message });
	}
});

// Admin/Pharmacy only - update medicine
router.put('/items/:id', rbac(['admin', 'pharmacy']), upload.single('image'), async (req, res) => {
	try {
		const { id } = req.params;
		
		// Debug: Log all received data
		console.log('📥 Received update request:', {
			id,
			body: req.body,
			hasFile: !!req.file,
			fileField: req.file?.fieldname
		});
		
		const updates = {};
		
		// Copy all non-file fields from req.body
		Object.keys(req.body).forEach(key => {
			if (key !== 'image') {
				updates[key] = req.body[key];
			}
		});
		
		// Handle image: priority is new file > image_url from body
		if (req.file) {
			// New file uploaded - upload it
			try {
				const path = `medicines/${Date.now()}-${req.file.originalname}`;
				const uploadResult = await uploadFile('medicines', path, req.file.buffer, req.file.mimetype);
				if (uploadResult && uploadResult.url) {
					// Remove cache-busting parameters before saving
					const cleanUrl = uploadResult.url.split('?')[0];
					updates.image_url = cleanUrl;
					console.log('📸 New image uploaded and saved:', cleanUrl);
				}
			} catch (uploadError) {
				console.error('❌ Image upload error:', uploadError);
				// Continue without updating image if upload fails
				if (uploadError.message?.includes('Bucket')) {
					console.warn('⚠️ Storage bucket "medicines" may not exist. Updating medicine without image.');
				}
			}
		} else if (req.body.image_url) {
			// Image URL provided directly (already uploaded via frontend)
			// Remove cache-busting parameters before saving
			const cleanUrl = req.body.image_url.split('?')[0];
			updates.image_url = cleanUrl;
			console.log('📸 Image URL from form data, saved:', cleanUrl);
		}
		// If neither file nor image_url, image_url won't be in updates, so it won't change
		
		console.log('💾 Final updates object:', {
			...updates,
			image_url: updates.image_url ? `${updates.image_url.substring(0, 50)}...` : '(not included)'
		});
		
		const { data, error } = await supabaseAdmin
			.from('pharmacy_inventory')
			.update(updates)
			.eq('medicine_id', id)
			.select('*')
			.single();
			
		if (error) {
			console.error('❌ Database update error:', error);
			return res.status(400).json({ error: error.message });
		}
		
		console.log('✅ Medicine updated successfully. New image_url:', data?.image_url || 'null');
		res.json({ item: data });
	} catch (err) {
		console.error('❌ Update error:', err);
		res.status(500).json({ error: err.message });
	}
});

// Admin/Pharmacy only - delete medicine
router.delete('/items/:id', rbac(['admin', 'pharmacy']), async (req, res) => {
	try {
		const { id } = req.params;
		const { error } = await supabaseAdmin.from('pharmacy_inventory').delete().eq('medicine_id', id);
		if (error) return res.status(400).json({ error: error.message });
		res.json({ ok: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.post('/prescriptions', async (req, res) => {
	const { patient_id, doctor_id, pharmacy_item_id } = req.body || {};
	const { data, error } = await supabaseAdmin
		.from('prescriptions')
		.insert({ patient_id, doctor_id, pharmacy_item_id })
		.select('*')
		.single();
	if (error) return res.status(400).json({ error: error.message });
	res.json({ prescription: data });
});

// Create order (checkout)
router.post('/orders', async (req, res) => {
	try {
		// Ensure user is authenticated
		if (!req.user || !req.user.id) {
			return res.status(401).json({ error: 'Authentication required' });
		}
		
		const userId = req.user.id;
		const { items, shipping_address, contact_phone, notes, payment_method_id, payment_transaction_id } = req.body || {};
		
		if (!items || !Array.isArray(items) || items.length === 0) {
			return res.status(400).json({ error: 'Order items are required' });
		}
		
		// Validate items first
		for (const item of items) {
			if (!item.medicine_id || !item.quantity || item.quantity <= 0) {
				return res.status(400).json({ error: 'Invalid item: medicine_id and quantity are required' });
			}
		}
		
		// OPTIMIZATION: Fetch all medicines in a single query instead of N queries
		const medicineIds = items.map(item => item.medicine_id);
		const { data: medicines, error: medsError } = await supabaseAdmin
			.from('pharmacy_inventory')
			.select('medicine_id, name, price, discount_percentage, stock_quantity')
			.in('medicine_id', medicineIds);
		
		if (medsError) {
			console.error('Error fetching medicines:', medsError);
			return res.status(500).json({ error: 'Failed to fetch medicine details' });
		}
		
		// Create a map for quick lookup
		const medicinesMap = new Map(medicines.map(med => [med.medicine_id, med]));
		
		// Calculate total amount and validate
		let totalAmount = 0;
		const orderItems = [];
		
		for (const item of items) {
			const medicine = medicinesMap.get(item.medicine_id);
			
			if (!medicine) {
				console.error(`Medicine not found: ${item.medicine_id}`);
				return res.status(404).json({ 
					error: `Medicine "${item.medicine_name || item.medicine_id}" is no longer available. Please remove it from your cart and try again.`,
					medicine_id: item.medicine_id
				});
			}
			
			// Check stock availability
			if (medicine.stock_quantity < item.quantity) {
				return res.status(400).json({ 
					error: `Insufficient stock for ${medicine.name}. Available: ${medicine.stock_quantity}, Requested: ${item.quantity}` 
				});
			}
			
			// Calculate item price with discount
			const unitPrice = parseFloat(medicine.price) || 0;
			const discountPercent = parseFloat(medicine.discount_percentage) || 0;
			const discountAmount = (unitPrice * discountPercent) / 100;
			const finalPrice = unitPrice - discountAmount;
			const itemTotal = finalPrice * item.quantity;
			
			totalAmount += itemTotal;
			
			orderItems.push({
				medicine_id: item.medicine_id,
				medicine_name: medicine.name,
				quantity: item.quantity,
				unit_price: unitPrice,
				discount_percentage: discountPercent,
				total_price: itemTotal
			});
		}
		
		// Create order with payment info
		const orderData = {
			user_id: userId,
			total_amount: totalAmount,
			status: payment_transaction_id ? 'confirmed' : 'pending', // Confirm order if payment successful
			shipping_address: shipping_address || null,
			contact_phone: contact_phone || null,
			notes: notes || null,
			payment_method_id: payment_method_id || null,
			payment_status: payment_transaction_id ? 'paid' : 'pending',
			payment_transaction_id: payment_transaction_id || null,
			paid_at: payment_transaction_id ? new Date().toISOString() : null
		};
		
		const { data: order, error: orderError } = await supabaseAdmin
			.from('pharmacy_orders')
			.insert(orderData)
			.select('*')
			.single();
		
		if (orderError) {
			console.error('Error creating order:', orderError);
			
			// Check if the error is due to missing table
			if (orderError.message?.includes('relation') && orderError.message?.includes('pharmacy_orders')) {
				return res.status(500).json({ 
					error: 'Database tables not found. Please run the SQL script to create pharmacy_orders and pharmacy_order_items tables.',
					details: orderError.message
				});
			}
			
			return res.status(400).json({ error: orderError.message });
		}
		
		// Create order items
		const orderItemsWithOrderId = orderItems.map(item => ({
			...item,
			order_id: order.id
		}));
		
		const { error: itemsError } = await supabaseAdmin
			.from('pharmacy_order_items')
			.insert(orderItemsWithOrderId);
		
		if (itemsError) {
			console.error('Error creating order items:', itemsError);
			// Rollback: delete the order
			await supabaseAdmin.from('pharmacy_orders').delete().eq('id', order.id);
			return res.status(400).json({ error: 'Failed to create order items: ' + itemsError.message });
		}
		
		// OPTIMIZATION: Update stock quantities using the medicines we already fetched
		// No need to fetch again - we already have the data
		const stockUpdates = orderItems.map(item => {
			const medicine = medicinesMap.get(item.medicine_id);
			if (!medicine) return null;
			
			const newStock = Math.max(0, (medicine.stock_quantity || 0) - item.quantity);
			return {
				medicine_id: item.medicine_id,
				stock_quantity: newStock
			};
		}).filter(Boolean);
		
		// Update stock in parallel using Promise.all for better performance
		if (stockUpdates.length > 0) {
			await Promise.allSettled(stockUpdates.map(async (update) => {
				try {
					const { error: stockError } = await supabaseAdmin
						.from('pharmacy_inventory')
						.update({ stock_quantity: update.stock_quantity })
						.eq('medicine_id', update.medicine_id);
					
					if (stockError) {
						console.error(`Error updating stock for ${update.medicine_id}:`, stockError);
					}
				} catch (err) {
					console.error(`Error updating stock for ${update.medicine_id}:`, err);
				}
			}));
		}
		
		// Fetch complete order with items
		const { data: completeOrder, error: fetchError } = await supabaseAdmin
			.from('pharmacy_orders')
			.select('*, pharmacy_order_items(*)')
			.eq('id', order.id)
			.single();
		
		if (fetchError) {
			console.error('Error fetching complete order:', fetchError);
		}
		
		console.log('✅ Order created successfully:', order.id);
		res.json({ order: completeOrder || order, message: 'Order placed successfully!' });
	} catch (err) {
		console.error('Error in checkout:', err);
		res.status(500).json({ error: err.message });
	}
});

// Get user's orders
router.get('/orders/me', async (req, res) => {
	try {
		const userId = req.user.id;
		
		const { data, error } = await supabaseAdmin
			.from('pharmacy_orders')
			.select('*, pharmacy_order_items(*)')
			.eq('user_id', userId)
			.order('created_at', { ascending: false });
		
		if (error) {
			console.error('Error fetching orders:', error);
			return res.status(400).json({ error: error.message });
		}
		
		res.json({ orders: data || [] });
	} catch (err) {
		console.error('Error in get orders:', err);
		res.status(500).json({ error: err.message });
	}
});

// Get all orders (admin only)
router.get('/orders/all', async (req, res) => {
	try {
		if (req.user.role !== 'admin') {
			return res.status(403).json({ error: 'Admin only' });
		}
		
		const { data, error } = await supabaseAdmin
			.from('pharmacy_orders')
			.select('*, pharmacy_order_items(*), users(name, email, phone)')
			.order('created_at', { ascending: false });
		
		if (error) {
			console.error('Error fetching all orders:', error);
			return res.status(400).json({ error: error.message });
		}
		
		res.json({ orders: data || [] });
	} catch (err) {
		console.error('Error in get all orders:', err);
		res.status(500).json({ error: err.message });
	}
});

// Payment Methods - Get user's saved cards
router.get('/payment-methods', async (req, res) => {
	try {
		const userId = req.user.id;
		
		const { data, error } = await supabaseAdmin
			.from('payment_methods')
			.select('*')
			.eq('user_id', userId)
			.order('is_default', { ascending: false })
			.order('created_at', { ascending: false });
		
		if (error) {
			console.error('Error fetching payment methods:', error);
			return res.status(400).json({ error: error.message });
		}
		
		res.json({ payment_methods: data || [] });
	} catch (err) {
		console.error('Error in /payment-methods:', err);
		res.status(500).json({ error: err.message });
	}
});

// Payment Methods - Save a new card
router.post('/payment-methods', async (req, res) => {
	try {
		const userId = req.user.id;
		const { card_number_last4, card_brand, expiry_month, expiry_year, cardholder_name, is_default } = req.body || {};
		
		if (!card_number_last4 || !expiry_month || !expiry_year) {
			return res.status(400).json({ error: 'Card details are required' });
		}
		
		// If this is set as default, unset other defaults
		if (is_default) {
			await supabaseAdmin
				.from('payment_methods')
				.update({ is_default: false })
				.eq('user_id', userId)
				.eq('is_default', true);
		}
		
		const { data, error } = await supabaseAdmin
			.from('payment_methods')
			.insert({
				user_id: userId,
				card_number_last4: card_number_last4.slice(-4),
				card_brand: card_brand || null,
				expiry_month,
				expiry_year,
				cardholder_name: cardholder_name || null,
				is_default: is_default || false
			})
			.select('*')
			.single();
		
		if (error) {
			console.error('Error saving payment method:', error);
			return res.status(400).json({ error: error.message });
		}
		
		res.json({ payment_method: data, message: 'Card saved successfully' });
	} catch (err) {
		console.error('Error in POST /payment-methods:', err);
		res.status(500).json({ error: err.message });
	}
});

// Process Payment - Mock payment processing (replace with real payment gateway)
router.post('/process-payment', async (req, res) => {
	try {
		const userId = req.user.id;
		const { amount, payment_method_id, card_details, save_card } = req.body || {};
		
		if (!amount || amount <= 0) {
			return res.status(400).json({ error: 'Valid payment amount is required' });
		}
		
		// TODO: Integrate with real payment gateway (Stripe, PayPal, etc.)
		// For now, we'll simulate a successful payment
		
		// Validate card if provided (new card)
		if (card_details) {
			const { card_number, expiry_month, expiry_year, cvv, cardholder_name } = card_details;
			
			if (!card_number || !expiry_month || !expiry_year || !cvv) {
				return res.status(400).json({ error: 'Complete card details are required' });
			}
			
			// Basic card validation (Luhn algorithm)
			const cardNumber = card_number.replace(/\s/g, '');
			if (cardNumber.length < 13 || cardNumber.length > 19) {
				return res.status(400).json({ error: 'Invalid card number' });
			}
			
			// Validate expiry
			const currentYear = new Date().getFullYear();
			const currentMonth = new Date().getMonth() + 1;
			
			if (expiry_year < currentYear || (expiry_year === currentYear && expiry_month < currentMonth)) {
				return res.status(400).json({ error: 'Card has expired' });
			}
			
			// Save card if requested
			if (save_card) {
				// Detect card brand
				let cardBrand = 'unknown';
				if (cardNumber.startsWith('4')) cardBrand = 'visa';
				else if (cardNumber.startsWith('5') || cardNumber.startsWith('2')) cardBrand = 'mastercard';
				else if (cardNumber.startsWith('3')) cardBrand = 'amex';
				
				await supabaseAdmin.from('payment_methods').insert({
					user_id: userId,
					card_number_last4: cardNumber.slice(-4),
					card_brand: cardBrand,
					expiry_month,
					expiry_year,
					cardholder_name: cardholder_name || null,
					is_default: false
				});
			}
		}
		
		// Simulate payment processing delay
		await new Promise(resolve => setTimeout(resolve, 1000));
		
		// Generate mock transaction ID
		const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
		
		// Simulate 95% success rate (for testing)
		const paymentSuccess = Math.random() > 0.05;
		
		if (paymentSuccess) {
			res.json({
				success: true,
				transaction_id: transactionId,
				payment_status: 'paid',
				message: 'Payment processed successfully'
			});
		} else {
			res.status(400).json({
				success: false,
				payment_status: 'failed',
				message: 'Payment processing failed. Please try again or use a different card.'
			});
		}
	} catch (err) {
		console.error('Error in /process-payment:', err);
		res.status(500).json({ error: err.message });
	}
});

export default router;
