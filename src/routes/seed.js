import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// Seed demo doctors (public endpoint for setup)
router.post('/doctors', async (req, res) => {
	try {
		const demoDoctors = [
			{ name: 'Dr. Ahmed Ali Khan', specialization: 'Cardiologist', discount_rate: 50.00, degrees: 'MBBS, FCPS (Cardiology)' },
			{ name: 'Dr. Fatima Noor', specialization: 'Pediatrician', discount_rate: 50.00, degrees: 'MBBS, FCPS (Pediatrics)' },
			{ name: 'Dr. Hassan Mahmood', specialization: 'Orthopedic Surgeon', discount_rate: 50.00, degrees: 'MBBS, MS (Orthopedics)' },
			{ name: 'Dr. Ayesha Siddiqui', specialization: 'Gynecologist', discount_rate: 50.00, degrees: 'MBBS, FCPS (Gynecology)' },
			{ name: 'Dr. Bilal Qureshi', specialization: 'Dermatologist', discount_rate: 50.00, degrees: 'MBBS, FCPS (Dermatology)' },
			{ name: 'Dr. Zainab Rasheed', specialization: 'General Physician', discount_rate: 50.00, degrees: 'MBBS, MRCGP' },
			{ name: 'Dr. Usman Farooq', specialization: 'Neurologist', discount_rate: 50.00, degrees: 'MBBS, FCPS (Neurology)' },
			{ name: 'Dr. Mariam Khalid', specialization: 'Ophthalmologist', discount_rate: 50.00, degrees: 'MBBS, FCPS (Ophthalmology)' },
			{ name: 'Dr. Saad Jameel', specialization: 'ENT Specialist', discount_rate: 50.00, degrees: 'MBBS, FCPS (ENT)' },
			{ name: 'Dr. Hina Tariq', specialization: 'Psychiatrist', discount_rate: 50.00, degrees: 'MBBS, FCPS (Psychiatry)' },
			{ name: 'Dr. Imran Shah', specialization: 'Urologist', discount_rate: 50.00, degrees: 'MBBS, FCPS (Urology)' },
			{ name: 'Dr. Sana Malik', specialization: 'Radiologist', discount_rate: 50.00, degrees: 'MBBS, FCPS (Radiology)' },
		];

		// Insert doctors
		const { data, error } = await supabaseAdmin
			.from('doctors')
			.insert(demoDoctors)
			.select();

		if (error) {
			// If duplicate, return success anyway
			if (error.code === '23505') {
				return res.json({ 
					message: 'Doctors already exist in database',
					count: 0,
					doctors: []
				});
			}
			throw error;
		}

		res.json({ 
			message: 'Demo doctors added successfully!',
			count: data.length,
			doctors: data
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

export default router;

