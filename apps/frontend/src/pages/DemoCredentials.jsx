export default function DemoCredentials() {
	const credentials = [
		{ role: 'Admin', email: 'admin@dswf.org', password: 'Admin123!', icon: '🧑‍💼', color: 'red', dashboard: '/dashboard/admin' },
		{ role: 'Patient', email: 'patient@dswf.org', password: 'Patient123!', icon: '🩺', color: 'blue', dashboard: '/dashboard/patient' },
		{ role: 'Donor', email: 'donor@dswf.org', password: 'Donor123!', icon: '💰', color: 'green', dashboard: '/dashboard/donor' },
		{ role: 'Blood Bank', email: 'bloodbank@dswf.org', password: 'BloodBank123!', icon: '🩸', color: 'red', dashboard: '/dashboard/blood-bank' },
		{ role: 'Laboratory', email: 'lab@dswf.org', password: 'Lab123!', icon: '🧪', color: 'green', dashboard: '/dashboard/lab' },
		{ role: 'Student', email: 'student@dswf.org', password: 'Student123!', icon: '🎓', color: 'yellow', dashboard: '/dashboard/student' },
		{ role: 'Teacher', email: 'teacher@dswf.org', password: 'Teacher123!', icon: '👨‍🏫', color: 'indigo', dashboard: '/dashboard/teacher' },
		{ role: 'Pharmacy', email: 'pharmacy@dswf.org', password: 'Pharmacy123!', icon: '💊', color: 'pink', dashboard: '/dashboard/pharmacy' },
	];

	function copyToClipboard(text) {
		navigator.clipboard.writeText(text);
		alert('Copied to clipboard!');
	}

	return (
		<div className="max-w-7xl mx-auto px-4 py-12">
			<div className="text-center mb-12">
				<h1 className="text-4xl font-bold text-brand mb-4">🔑 Demo Credentials</h1>
				<p className="text-gray-600">Use these accounts to test all features</p>
				<div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 inline-block">
					<p className="text-sm text-yellow-900">
						⚠️ <strong>Note:</strong> You may need to create these accounts first via signup, then set the role in Supabase.
					</p>
					<p className="text-xs text-yellow-800 mt-1">
						See <a href="https://github.com/yourusername/foundation" className="underline">CREATE-USERS-STEP-BY-STEP.md</a> for details.
					</p>
				</div>
			</div>

			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				{credentials.map((cred) => (
					<div key={cred.role} className={`bg-white rounded-lg shadow-lg overflow-hidden border-t-4 border-${cred.color}-500`}>
						<div className={`bg-${cred.color}-50 p-4`}>
							<div className="flex items-center justify-between">
								<div className="flex items-center">
									<span className="text-4xl mr-3">{cred.icon}</span>
									<h2 className="text-xl font-bold text-gray-800">{cred.role}</h2>
								</div>
							</div>
						</div>
						
						<div className="p-6 space-y-4">
							<div>
								<label className="block text-xs font-semibold text-gray-500 mb-1">EMAIL</label>
								<div className="flex items-center justify-between bg-gray-50 p-2 rounded">
									<code className="text-sm text-gray-800">{cred.email}</code>
									<button 
										onClick={() => copyToClipboard(cred.email)}
										className="text-brand hover:text-brand-dark text-xs"
									>
										Copy
									</button>
								</div>
							</div>

							<div>
								<label className="block text-xs font-semibold text-gray-500 mb-1">PASSWORD</label>
								<div className="flex items-center justify-between bg-gray-50 p-2 rounded">
									<code className="text-sm text-gray-800">{cred.password}</code>
									<button 
										onClick={() => copyToClipboard(cred.password)}
										className="text-brand hover:text-brand-dark text-xs"
									>
										Copy
									</button>
								</div>
							</div>

							<div>
								<label className="block text-xs font-semibold text-gray-500 mb-1">DASHBOARD</label>
								<code className="text-xs text-gray-600 bg-gray-50 p-2 rounded block">{cred.dashboard}</code>
							</div>

							<div className="pt-4 border-t flex gap-2">
								<a 
									href="/login"
									className="flex-1 bg-brand text-white text-center py-2 rounded hover:bg-brand-dark text-sm font-semibold"
								>
									Login
								</a>
								<a 
									href={cred.dashboard}
									className="flex-1 bg-gray-200 text-gray-800 text-center py-2 rounded hover:bg-gray-300 text-sm font-semibold"
								>
									Dashboard
								</a>
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
				<h3 className="text-lg font-semibold text-blue-900 mb-3">🚀 Quick Start Guide</h3>
				<ol className="space-y-2 text-sm text-blue-800">
					<li><strong>1.</strong> Click "Login" button on any card above</li>
					<li><strong>2.</strong> Enter the email and password shown</li>
					<li><strong>3.</strong> Click "Login with Email"</li>
					<li><strong>4.</strong> If account doesn't exist, it will be created (you'll need to set role in Supabase)</li>
					<li><strong>5.</strong> Explore the dashboard features!</li>
				</ol>
			</div>

			<div className="mt-8 grid md:grid-cols-2 gap-6">
				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="font-semibold text-lg mb-3">✅ Fully Built Panels</h3>
					<ul className="space-y-2 text-sm text-gray-700">
						<li>✅ <strong>Admin Panel</strong> - Full user management, donations, doctors</li>
						<li>✅ <strong>Patient Panel</strong> - Profile, doctors, reports, prescriptions</li>
					</ul>
				</div>
				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="font-semibold text-lg mb-3">⏳ Basic Panels (Being Enhanced)</h3>
					<ul className="space-y-2 text-sm text-gray-700">
						<li>⏳ Donor Panel - Donations, history, receipts</li>
						<li>⏳ Student Panel - Courses, enrollment, certificates</li>
						<li>⏳ Teacher Panel - Create courses, manage students</li>
						<li>⏳ Pharmacy Panel - Inventory, prescriptions, alerts</li>
					</ul>
				</div>
			</div>
		</div>
	);
}

