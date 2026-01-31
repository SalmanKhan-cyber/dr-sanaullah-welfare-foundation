import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// Get blood bank info for logged-in user
router.get('/me', async (req, res) => {
	try {
		const userId = req.user.id;
		
		// Get blood bank info for this user
		const { data: userData, error: userError } = await supabaseAdmin
			.from('users')
			.select('id, name, email, role')
			.eq('id', userId)
			.single();
		
		if (userError) return res.status(400).json({ error: userError.message });
		
		// Check if user has blood_bank entry
		const { data: bloodBankData, error: bloodBankError } = await supabaseAdmin
			.from('blood_banks')
			.select('*')
			.eq('user_id', userId)
			.single();
		
		if (bloodBankError && bloodBankError.code !== 'PGRST116') {
			return res.status(400).json({ error: bloodBankError.message });
		}
		
		res.json({ 
			bloodBank: bloodBankData || null,
			user: userData
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get blood inventory
router.get('/inventory', async (req, res) => {
	try {
		const userId = req.user.id;
		
		// Get blood bank ID for this user
		const { data: bloodBank, error: bankError } = await supabaseAdmin
			.from('blood_banks')
			.select('id')
			.eq('user_id', userId)
			.single();
		
		if (bankError || !bloodBank) {
			return res.status(404).json({ error: 'Blood bank not found. Please contact admin to set up your blood bank.' });
		}
		
		// Get inventory for this blood bank
		const { data: inventory, error } = await supabaseAdmin
			.from('blood_inventory')
			.select('*')
			.eq('blood_bank_id', bloodBank.id)
			.order('blood_type', { ascending: true });
		
		if (error) return res.status(400).json({ error: error.message });
		
		res.json({ inventory: inventory || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update blood inventory
router.post('/inventory', async (req, res) => {
	try {
		const userId = req.user.id;
		const { blood_type, quantity, expiry_date, status } = req.body || {};
		
		if (!blood_type || quantity === undefined) {
			return res.status(400).json({ error: 'Blood type and quantity are required' });
		}
		
		// Get blood bank ID for this user
		const { data: bloodBank, error: bankError } = await supabaseAdmin
			.from('blood_banks')
			.select('id')
			.eq('user_id', userId)
			.single();
		
		if (bankError || !bloodBank) {
			return res.status(404).json({ error: 'Blood bank not found. Please contact admin to set up your blood bank.' });
		}
		
		// Check if inventory entry exists
		const { data: existing, error: checkError } = await supabaseAdmin
			.from('blood_inventory')
			.select('id, quantity')
			.eq('blood_bank_id', bloodBank.id)
			.eq('blood_type', blood_type)
			.single();
		
		if (existing) {
			// Update existing entry
			const { data: updated, error: updateError } = await supabaseAdmin
				.from('blood_inventory')
				.update({
					quantity: quantity,
					expiry_date: expiry_date || null,
					status: status || 'available',
					updated_at: new Date().toISOString()
				})
				.eq('id', existing.id)
				.select('*')
				.single();
			
			if (updateError) return res.status(400).json({ error: updateError.message });
			res.json({ inventory: updated });
		} else {
			// Create new entry
			const { data: created, error: createError } = await supabaseAdmin
				.from('blood_inventory')
				.insert({
					blood_bank_id: bloodBank.id,
					blood_type: blood_type,
					quantity: quantity,
					expiry_date: expiry_date || null,
					status: status || 'available'
				})
				.select('*')
				.single();
			
			if (createError) return res.status(400).json({ error: createError.message });
			res.json({ inventory: created });
		}
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get blood requests
router.get('/requests', async (req, res) => {
	try {
		const userId = req.user.id;
		
		// Get blood bank ID for this user
		const { data: bloodBank, error: bankError } = await supabaseAdmin
			.from('blood_banks')
			.select('id')
			.eq('user_id', userId)
			.single();
		
		if (bankError || !bloodBank) {
			return res.status(404).json({ error: 'Blood bank not found.' });
		}
		
		// Get requests for this blood bank
		const { data: requests, error } = await supabaseAdmin
			.from('blood_requests')
			.select(`
				*,
				patients(
					users(name, email, phone),
					age,
					gender
				)
			`)
			.eq('blood_bank_id', bloodBank.id)
			.order('created_at', { ascending: false });
		
		if (error) return res.status(400).json({ error: error.message });
		
		res.json({ requests: requests || [] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update request status
router.put('/requests/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const { status, notes } = req.body || {};
		
		if (!status) {
			return res.status(400).json({ error: 'Status is required' });
		}
		
		const userId = req.user.id;
		
		// Get blood bank ID for this user
		const { data: bloodBank, error: bankError } = await supabaseAdmin
			.from('blood_banks')
			.select('id')
			.eq('user_id', userId)
			.single();
		
		if (bankError || !bloodBank) {
			return res.status(404).json({ error: 'Blood bank not found.' });
		}
		
		// Update request
		const { data: updated, error } = await supabaseAdmin
			.from('blood_requests')
			.update({
				status: status,
				notes: notes || null,
				updated_at: new Date().toISOString()
			})
			.eq('id', id)
			.eq('blood_bank_id', bloodBank.id)
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		
		// If request is fulfilled, reduce inventory
		if (status === 'fulfilled' && updated.blood_type) {
			const { data: inventory, error: invError } = await supabaseAdmin
				.from('blood_inventory')
				.select('quantity')
				.eq('blood_bank_id', bloodBank.id)
				.eq('blood_type', updated.blood_type)
				.single();
			
			if (!invError && inventory && inventory.quantity >= updated.quantity) {
				await supabaseAdmin
					.from('blood_inventory')
					.update({
						quantity: inventory.quantity - updated.quantity,
						updated_at: new Date().toISOString()
					})
					.eq('blood_bank_id', bloodBank.id)
					.eq('blood_type', updated.blood_type);
			}
		}
		
		res.json({ request: updated });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Create blood request (for patients/clients)
router.post('/requests', async (req, res) => {
	try {
		const userId = req.user.id;
		const userRole = req.user.role;
		const { blood_type, quantity, urgency, contact_number, requester_name, notes, patient_id } = req.body || {};
		
		if (!blood_type || !quantity) {
			return res.status(400).json({ error: 'Blood type and quantity are required' });
		}

		if (!contact_number || contact_number.trim() === '') {
			return res.status(400).json({ error: 'Contact number is required' });
		}

		if (!requester_name || requester_name.trim() === '') {
			return res.status(400).json({ error: 'Name is required' });
		}
		
		// Get patient ID - use provided patient_id or current user's patient profile
		let finalPatientId = patient_id;
		
		if (!finalPatientId && userRole === 'patient') {
			// Get patient profile for this user
			const { data: patient, error: patientError } = await supabaseAdmin
				.from('patients')
				.select('id')
				.eq('user_id', userId)
				.single();
			
			if (!patientError && patient) {
				finalPatientId = patient.id;
			}
		}
		
		// Get admin blood bank (admin acts as the blood bank)
		// First try to find admin's blood bank
		const { data: adminUsers } = await supabaseAdmin
			.from('users')
			.select('id')
			.eq('role', 'admin')
			.limit(1);
		
		let bloodBankId = null;
		
		if (adminUsers && adminUsers.length > 0) {
			const adminId = adminUsers[0].id;
			const { data: adminBloodBank } = await supabaseAdmin
				.from('blood_banks')
				.select('id')
				.eq('user_id', adminId)
				.single();
			
			if (adminBloodBank) {
				bloodBankId = adminBloodBank.id;
			} else {
				// Create admin blood bank if it doesn't exist
				const { data: userData } = await supabaseAdmin
					.from('users')
					.select('name')
					.eq('id', adminId)
					.single();
				
				const { data: newBank, error: createError } = await supabaseAdmin
					.from('blood_banks')
					.insert({
						user_id: adminId,
						name: userData?.name ? `${userData.name} Blood Bank` : 'Admin Blood Bank',
						location: 'Main Office'
					})
					.select('id')
					.single();
				
				if (!createError && newBank) {
					bloodBankId = newBank.id;
				}
			}
		}
		
		// Fallback: get any available blood bank
		if (!bloodBankId) {
			const { data: bloodBanks, error: bankError } = await supabaseAdmin
				.from('blood_banks')
				.select('id')
				.limit(1);
			
			if (bankError || !bloodBanks || bloodBanks.length === 0) {
				return res.status(404).json({ error: 'No blood bank available. Please contact admin.' });
			}
			
			bloodBankId = bloodBanks[0].id;
		}
		
		// Create blood request
		const { data: request, error } = await supabaseAdmin
			.from('blood_requests')
			.insert({
				blood_bank_id: bloodBankId,
				patient_id: finalPatientId || null,
				blood_type: blood_type,
				quantity: parseInt(quantity),
				urgency: urgency || 'normal',
				requester_name: requester_name.trim(),
				contact_number: contact_number.trim(),
				notes: notes || null,
				status: 'pending'
			})
			.select('*')
			.single();
		
		if (error) {
			console.error('Error creating blood request:', error);
			return res.status(400).json({ error: error.message });
		}
		
		console.log(`✅ Blood request created: ${request.id}`);
		res.json({ request });
	} catch (err) {
		console.error('❌ Error in /api/blood-bank/requests (POST):', err);
		res.status(500).json({ error: err.message });
	}
});

// Get all blood inventory (public - for clients to see availability)
router.get('/inventory/public', async (req, res) => {
	try {
		// Get all blood banks and their inventory
		const { data: bloodBanks, error: banksError } = await supabaseAdmin
			.from('blood_banks')
			.select('id, name, location');
		
		if (banksError) {
			return res.status(400).json({ error: banksError.message });
		}
		
		if (!bloodBanks || bloodBanks.length === 0) {
			return res.json({ inventory: [] });
		}
		
		const bankIds = bloodBanks.map(b => b.id);
		
		// Get inventory for all blood banks
		const { data: inventory, error } = await supabaseAdmin
			.from('blood_inventory')
			.select('*, blood_banks(id, name, location)')
			.in('blood_bank_id', bankIds)
			.eq('status', 'available')
			.order('blood_type', { ascending: true });
		
		if (error) {
			return res.status(400).json({ error: error.message });
		}
		
		// Group by blood type
		const groupedInventory = {};
		(inventory || []).forEach(item => {
			if (!groupedInventory[item.blood_type]) {
				groupedInventory[item.blood_type] = {
					blood_type: item.blood_type,
					total_quantity: 0,
					banks: []
				};
			}
			groupedInventory[item.blood_type].total_quantity += item.quantity || 0;
			groupedInventory[item.blood_type].banks.push({
				bank_name: item.blood_banks?.name || 'Unknown',
				location: item.blood_banks?.location || 'N/A',
				quantity: item.quantity
			});
		});
		
		res.json({ 
			inventory: Object.values(groupedInventory),
			detailed: inventory || []
		});
	} catch (err) {
		console.error('❌ Error in /api/blood-bank/inventory/public:', err);
		res.status(500).json({ error: err.message });
	}
});

// Get all blood requests (admin only)
router.get('/requests/all', async (req, res) => {
	try {
		const userRole = req.user.role;
		
		if (userRole !== 'admin') {
			return res.status(403).json({ error: 'Admin access required' });
		}
		
		// Get all blood requests - try with relations first, fallback to basic query
		let { data: requests, error } = await supabaseAdmin
			.from('blood_requests')
			.select(`
				*,
				blood_banks(
					id,
					name,
					location
				)
			`)
			.order('created_at', { ascending: false });
		
		// If query fails, try without relations
		if (error) {
			console.log('⚠️ Blood requests query with relations failed, trying basic query...', error);
			const { data: basicRequests, error: basicError } = await supabaseAdmin
				.from('blood_requests')
				.select('*')
				.order('created_at', { ascending: false });
			
			if (basicError) {
				console.error('❌ Error loading blood requests:', basicError);
				return res.status(400).json({ error: basicError.message });
			}
			
			requests = basicRequests;
		}
		
		// Enrich with patient info if patient_id exists
		if (requests && requests.length > 0) {
			const patientIds = [...new Set(requests.map(r => r.patient_id).filter(Boolean))];
			
			if (patientIds.length > 0) {
				// Get patient info
				const { data: patientsData } = await supabaseAdmin
					.from('patients')
					.select('user_id, age, gender')
					.in('user_id', patientIds);
				
				// Get user info for patients
				if (patientsData && patientsData.length > 0) {
					const userIds = patientsData.map(p => p.user_id);
					const { data: usersData } = await supabaseAdmin
						.from('users')
						.select('id, name, email, phone')
						.in('id', userIds);
					
					// Create maps for easy lookup
					const patientsMap = {};
					patientsData.forEach(p => {
						patientsMap[p.user_id] = p;
					});
					
					const usersMap = {};
					if (usersData) {
						usersData.forEach(u => {
							usersMap[u.id] = u;
						});
					}
					
					// Enrich requests with patient and user info
					requests = requests.map(request => {
						if (request.patient_id && patientsMap[request.patient_id]) {
							const patient = patientsMap[request.patient_id];
							const user = usersMap[patient.user_id];
							return {
								...request,
								patients: {
									id: patient.user_id,
									user_id: patient.user_id,
									age: patient.age,
									gender: patient.gender,
									users: user || null
								}
							};
						}
						return request;
					});
				}
			}
		}
		
		console.log(`✅ Loaded ${requests?.length || 0} blood requests for admin`);
		res.json({ requests: requests || [] });
	} catch (err) {
		console.error('❌ Error in /api/blood-bank/requests/all:', err);
		res.status(500).json({ error: err.message });
	}
});

// Get all blood inventory (admin only)
router.get('/inventory/all', async (req, res) => {
	try {
		const userRole = req.user.role;
		
		if (userRole !== 'admin') {
			return res.status(403).json({ error: 'Admin access required' });
		}
		
		// Get all inventory from all blood banks
		const { data: inventory, error } = await supabaseAdmin
			.from('blood_inventory')
			.select('*, blood_banks(id, name, location)')
			.order('blood_type', { ascending: true });
		
		if (error) {
			return res.status(400).json({ error: error.message });
		}
		
		res.json({ inventory: inventory || [] });
	} catch (err) {
		console.error('❌ Error in /api/blood-bank/inventory/all:', err);
		res.status(500).json({ error: err.message });
	}
});

// Admin: Add/Update inventory directly (admin acts as blood bank)
router.post('/inventory/admin', async (req, res) => {
	try {
		const userRole = req.user.role;
		const userId = req.user.id;
		
		if (userRole !== 'admin') {
			return res.status(403).json({ error: 'Admin access required' });
		}
		
		const { blood_type, quantity, expiry_date, status, inventory_id } = req.body || {};
		
		if (!blood_type || quantity === undefined) {
			return res.status(400).json({ error: 'Blood type and quantity are required' });
		}
		
		// Get or create admin blood bank entry
		let { data: adminBloodBank, error: bankError } = await supabaseAdmin
			.from('blood_banks')
			.select('id')
			.eq('user_id', userId)
			.single();
		
		// If no blood bank exists for admin, create one
		if (bankError || !adminBloodBank) {
			const { data: userData } = await supabaseAdmin
				.from('users')
				.select('name')
				.eq('id', userId)
				.single();
			
			const { data: newBank, error: createError } = await supabaseAdmin
				.from('blood_banks')
				.insert({
					user_id: userId,
					name: userData?.name ? `${userData.name} Blood Bank` : 'Admin Blood Bank',
					location: 'Main Office'
				})
				.select('id')
				.single();
			
			if (createError) {
				return res.status(400).json({ error: 'Failed to create admin blood bank: ' + createError.message });
			}
			
			adminBloodBank = newBank;
		}
		
		const bloodBankId = adminBloodBank.id;
		
		// If inventory_id is provided, update existing entry
		if (inventory_id) {
			const { data: updated, error: updateError } = await supabaseAdmin
				.from('blood_inventory')
				.update({
					blood_type: blood_type,
					quantity: parseInt(quantity),
					expiry_date: expiry_date || null,
					status: status || 'available',
					updated_at: new Date().toISOString()
				})
				.eq('id', inventory_id)
				.eq('blood_bank_id', bloodBankId)
				.select('*')
				.single();
			
			if (updateError) return res.status(400).json({ error: updateError.message });
			res.json({ inventory: updated });
		} else {
			// Check if entry exists for this blood type
			const { data: existing, error: checkError } = await supabaseAdmin
				.from('blood_inventory')
				.select('id, quantity')
				.eq('blood_bank_id', bloodBankId)
				.eq('blood_type', blood_type)
				.single();
			
			if (existing) {
				// Update existing entry
				const { data: updated, error: updateError } = await supabaseAdmin
					.from('blood_inventory')
					.update({
						quantity: parseInt(quantity),
						expiry_date: expiry_date || null,
						status: status || 'available',
						updated_at: new Date().toISOString()
					})
					.eq('id', existing.id)
					.select('*')
					.single();
				
				if (updateError) return res.status(400).json({ error: updateError.message });
				res.json({ inventory: updated });
			} else {
				// Create new entry
				const { data: created, error: createError } = await supabaseAdmin
					.from('blood_inventory')
					.insert({
						blood_bank_id: bloodBankId,
						blood_type: blood_type,
						quantity: parseInt(quantity),
						expiry_date: expiry_date || null,
						status: status || 'available'
					})
					.select('*')
					.single();
				
				if (createError) return res.status(400).json({ error: createError.message });
				res.json({ inventory: created });
			}
		}
	} catch (err) {
		console.error('❌ Error in /api/blood-bank/inventory/admin:', err);
		res.status(500).json({ error: err.message });
	}
});

// Admin: Delete inventory item
router.delete('/inventory/admin/:id', async (req, res) => {
	try {
		const userRole = req.user.role;
		const userId = req.user.id;
		const { id } = req.params;
		
		if (userRole !== 'admin') {
			return res.status(403).json({ error: 'Admin access required' });
		}
		
		// Get admin blood bank ID
		const { data: adminBloodBank } = await supabaseAdmin
			.from('blood_banks')
			.select('id')
			.eq('user_id', userId)
			.single();
		
		if (!adminBloodBank) {
			return res.status(404).json({ error: 'Admin blood bank not found' });
		}
		
		const { error } = await supabaseAdmin
			.from('blood_inventory')
			.delete()
			.eq('id', id)
			.eq('blood_bank_id', adminBloodBank.id);
		
		if (error) return res.status(400).json({ error: error.message });
		
		res.json({ success: true, message: 'Inventory item deleted' });
	} catch (err) {
		console.error('❌ Error in /api/blood-bank/inventory/admin/:id (DELETE):', err);
		res.status(500).json({ error: err.message });
	}
});

// Admin: Update blood request status
router.put('/requests/:id/admin', async (req, res) => {
	try {
		const userRole = req.user.role;
		
		if (userRole !== 'admin') {
			return res.status(403).json({ error: 'Admin access required' });
		}
		
		const { id } = req.params;
		const { status, notes } = req.body || {};
		
		if (!status) {
			return res.status(400).json({ error: 'Status is required' });
		}
		
		// Update request
		const { data: updated, error } = await supabaseAdmin
			.from('blood_requests')
			.update({
				status: status,
				notes: notes || null,
				updated_at: new Date().toISOString()
			})
			.eq('id', id)
			.select('*')
			.single();
		
		if (error) return res.status(400).json({ error: error.message });
		
		// If request is fulfilled, reduce inventory
		if (status === 'fulfilled' && updated.blood_type && updated.blood_bank_id) {
			const { data: inventory, error: invError } = await supabaseAdmin
				.from('blood_inventory')
				.select('quantity')
				.eq('blood_bank_id', updated.blood_bank_id)
				.eq('blood_type', updated.blood_type)
				.single();
			
			if (!invError && inventory && inventory.quantity >= updated.quantity) {
				await supabaseAdmin
					.from('blood_inventory')
					.update({
						quantity: inventory.quantity - updated.quantity,
						updated_at: new Date().toISOString()
					})
					.eq('blood_bank_id', updated.blood_bank_id)
					.eq('blood_type', updated.blood_type);
			}
		}
		
		res.json({ request: updated });
	} catch (err) {
		console.error('❌ Error in /api/blood-bank/requests/:id/admin:', err);
		res.status(500).json({ error: err.message });
	}
});

export default router;

