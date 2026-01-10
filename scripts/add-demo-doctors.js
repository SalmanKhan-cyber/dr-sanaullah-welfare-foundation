// Script to add demo doctors directly to Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './apps/backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
	console.error('❌ Error: Missing Supabase credentials in .env file');
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const demoDoctors = [
	{ name: 'Dr. Ahmed Ali Khan', specialization: 'Cardiologist', discount_rate: 50.00 },
	{ name: 'Dr. Fatima Noor', specialization: 'Pediatrician', discount_rate: 50.00 },
	{ name: 'Dr. Hassan Mahmood', specialization: 'Orthopedic Surgeon', discount_rate: 50.00 },
	{ name: 'Dr. Ayesha Siddiqui', specialization: 'Gynecologist', discount_rate: 50.00 },
	{ name: 'Dr. Bilal Qureshi', specialization: 'Dermatologist', discount_rate: 50.00 },
	{ name: 'Dr. Zainab Rasheed', specialization: 'General Physician', discount_rate: 50.00 },
	{ name: 'Dr. Usman Farooq', specialization: 'Neurologist', discount_rate: 50.00 },
	{ name: 'Dr. Mariam Khalid', specialization: 'Ophthalmologist', discount_rate: 50.00 },
	{ name: 'Dr. Saad Jameel', specialization: 'ENT Specialist', discount_rate: 50.00 },
	{ name: 'Dr. Hina Tariq', specialization: 'Psychiatrist', discount_rate: 50.00 },
	{ name: 'Dr. Imran Shah', specialization: 'Urologist', discount_rate: 50.00 },
	{ name: 'Dr. Sana Malik', specialization: 'Radiologist', discount_rate: 50.00 },
];

async function addDemoDoctors() {
	console.log('🩺 Adding demo doctors to database...\n');

	try {
		// Check if doctors already exist
		const { data: existingDoctors, error: checkError } = await supabase
			.from('doctors')
			.select('count');

		if (checkError) {
			throw checkError;
		}

		if (existingDoctors && existingDoctors.length > 0) {
			console.log('⚠️  Doctors already exist in database. Clearing first...\n');
			// Optional: Clear existing doctors (comment out if you want to keep existing)
			// await supabase.from('doctors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
		}

		// Insert demo doctors
		const { data, error } = await supabase
			.from('doctors')
			.insert(demoDoctors)
			.select();

		if (error) {
			throw error;
		}

		console.log('✅ Successfully added demo doctors!\n');
		console.log(`📊 Total doctors added: ${data.length}\n`);
		
		console.log('👨‍⚕️ Doctors List:');
		console.log('═══════════════════════════════════════════════════');
		data.forEach((doctor, index) => {
			console.log(`${index + 1}. ${doctor.name} - ${doctor.specialization} (${doctor.discount_rate}% discount)`);
		});
		console.log('═══════════════════════════════════════════════════\n');

		console.log('🎉 Done! Refresh your homepage to see the doctors.');
		console.log('🌐 Homepage: http://localhost:5173\n');

	} catch (error) {
		console.error('❌ Error adding doctors:', error.message);
		process.exit(1);
	}
}

// Run the script
addDemoDoctors();

