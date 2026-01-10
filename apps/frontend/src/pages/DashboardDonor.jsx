import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { supabase } from '../lib/supabase';
import { useVerification } from '../hooks/useVerification';

export default function DashboardDonor() {
	const { verified, checking } = useVerification('donor');
	const [donations, setDonations] = useState([]);
	const [loading, setLoading] = useState(true);
	const [receiptLoading, setReceiptLoading] = useState(null);
	const [totalDonated, setTotalDonated] = useState(0);

	useEffect(() => {
		if (!checking && verified) {
			async function fetchDonations() {
				try {
					const { donations } = await apiRequest('/api/donations/me');
					setDonations(donations);
					const total = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
					setTotalDonated(total);
				} catch (err) {
					console.error(err);
				} finally {
					setLoading(false);
				}
			}
			fetchDonations();
		}
	}, [verified, checking]);

	async function handleViewReceipt(donationId) {
		try {
			setReceiptLoading(donationId);
			
			// Get auth token
			const { data: { session } } = await supabase.auth.getSession();
			if (!session) {
				throw new Error('Please log in to view receipt');
			}
			
			// Fetch receipt HTML using authenticated request
			const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/donations/${donationId}/receipt`, {
				headers: {
					'Authorization': `Bearer ${session.access_token}`
				}
			});
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Failed to fetch receipt' }));
				throw new Error(errorData.error || 'Failed to fetch receipt');
			}
			
			const html = await response.text();
			
			// Open receipt in new window
			const receiptWindow = window.open('', '_blank');
			if (receiptWindow) {
				receiptWindow.document.write(html);
				receiptWindow.document.close();
			}
		} catch (err) {
			alert('Failed to load receipt: ' + (err.message || 'Unknown error'));
			console.error(err);
		} finally {
			setReceiptLoading(null);
		}
	}

	return (
		<div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
			{/* Animated background grid */}
			<div className="absolute inset-0 opacity-20">
				<div className="absolute inset-0" style={{
					backgroundImage: `
						linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
						linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)
					`,
					backgroundSize: '50px 50px'
				}}></div>
				<div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 animate-pulse"></div>
			</div>

			{/* Floating orbs */}
			<div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
			<div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

			<div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
				{/* Header */}
				<div className="text-center space-y-4 mb-12">
					<h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
						DONOR DASHBOARD
					</h1>
					<div className="w-32 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto"></div>
					<p className="text-cyan-300/80 text-lg font-light tracking-wider">Transparent Impact • Real-Time Tracking</p>
				</div>

				{/* Stats Card */}
				<div className="relative group">
					<div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
					<div className="relative bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 shadow-2xl">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="text-center space-y-2">
								<div className="text-3xl font-bold text-cyan-400">{donations.length}</div>
								<div className="text-sm text-gray-400 uppercase tracking-wider">Total Donations</div>
							</div>
							<div className="text-center space-y-2 border-x border-cyan-500/20">
								<div className="text-3xl font-bold text-purple-400">PKR {totalDonated.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
								<div className="text-sm text-gray-400 uppercase tracking-wider">Total Impact</div>
							</div>
							<div className="text-center space-y-2">
								<div className="text-3xl font-bold text-green-400">100%</div>
								<div className="text-sm text-gray-400 uppercase tracking-wider">Transparency</div>
							</div>
						</div>
					</div>
				</div>

				{/* Make a Donation Card */}
				<div className="relative group">
					<div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 via-cyan-500 to-green-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 animate-pulse"></div>
					<div className="relative bg-slate-900/70 backdrop-blur-xl border border-green-500/30 rounded-2xl p-8 shadow-2xl hover:border-green-500/50 transition-all duration-300">
						<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
							<div className="space-y-3 flex-1">
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center text-2xl shadow-lg shadow-green-500/50">
										✨
									</div>
									<h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
										Make a Donation
									</h2>
								</div>
								<p className="text-gray-300 text-lg leading-relaxed">
									One-time or recurring donations with <span className="text-cyan-400 font-semibold">transparent records</span> and real-time impact tracking.
								</p>
							</div>
							<Link 
								to="/donation" 
								className="relative group/btn px-8 py-4 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/50 hover:shadow-green-500/70 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
							>
								<span className="relative z-10 flex items-center gap-2">
									<span>Donate Now</span>
									<span className="text-xl">→</span>
								</span>
								<div className="absolute inset-0 bg-gradient-to-r from-green-600 to-cyan-600 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
							</Link>
						</div>
					</div>
				</div>

				{/* Your Donations Card */}
				<div className="relative group">
					<div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
					<div className="relative bg-slate-900/70 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 shadow-2xl hover:border-purple-500/50 transition-all duration-300">
						<div className="flex items-center gap-3 mb-6">
							<div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-cyan-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/50">
								📊
							</div>
							<h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
								Your Donations
							</h2>
						</div>

						{loading ? (
							<div className="flex items-center justify-center py-12">
								<div className="relative">
									<div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
									<div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
								</div>
							</div>
						) : donations.length === 0 ? (
							<div className="text-center py-12 space-y-4">
								<div className="text-6xl mb-4">🌱</div>
								<p className="text-gray-400 text-lg">No donations yet.</p>
								<p className="text-gray-500 text-sm">Start making an impact today!</p>
							</div>
						) : (
							<div className="space-y-4">
								{donations.map((d, index) => (
									<div 
										key={d.id} 
										className="group/item relative bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/50 hover:bg-slate-800/70 transition-all duration-300 transform hover:scale-[1.02]"
										style={{ animationDelay: `${index * 100}ms` }}
									>
										<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
											<div className="space-y-2 flex-1">
												<div className="flex items-center gap-3">
													<div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
													<p className="text-2xl font-bold text-cyan-400">
														PKR {Number(d.amount).toFixed(2)}
													</p>
												</div>
												<div className="flex flex-wrap items-center gap-3 text-sm">
													<span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
														{d.purpose || 'General'}
													</span>
													<span className="text-gray-400">•</span>
													<span className="text-gray-400">
														{new Date(d.created_at).toLocaleDateString('en-US', { 
															year: 'numeric', 
															month: 'short', 
															day: 'numeric' 
														})}
													</span>
												</div>
											</div>
											<button
												onClick={() => handleViewReceipt(d.id)}
												disabled={receiptLoading === d.id}
												className="relative px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 text-cyan-300 rounded-lg font-semibold hover:from-cyan-500/30 hover:to-purple-500/30 hover:border-cyan-500 hover:text-cyan-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-cyan-500/20 disabled:hover:to-purple-500/20 transform hover:scale-105"
											>
												{receiptLoading === d.id ? (
													<span className="flex items-center gap-2">
														<span className="w-4 h-4 border-2 border-cyan-300/30 border-t-cyan-300 rounded-full animate-spin"></span>
														Loading...
													</span>
												) : (
													<span className="flex items-center gap-2">
														<span>📄</span>
														View Receipt
													</span>
												)}
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
