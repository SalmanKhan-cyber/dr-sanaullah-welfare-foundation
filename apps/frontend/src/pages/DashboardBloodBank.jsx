import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { apiRequest, clearCache } from '../lib/api';
import { useVerification } from '../hooks/useVerification';

export default function DashboardBloodBank() {
	const { verified, checking } = useVerification('blood_bank');
	const [bloodBankInfo, setBloodBankInfo] = useState(null);
	const [inventory, setInventory] = useState([]);
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(false);
	const [showInventoryModal, setShowInventoryModal] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [inventoryForm, setInventoryForm] = useState({
		blood_type: '',
		quantity: '',
		expiry_date: '',
		status: 'available'
	});
	const [filterStatus, setFilterStatus] = useState('all');
	const [searchQuery, setSearchQuery] = useState('');

	const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

	useEffect(() => {
		if (!checking && verified) {
			loadBloodBankInfo();
		}
	}, [verified, checking]);

	useEffect(() => {
		if (bloodBankInfo) {
			loadInventory();
			loadRequests();
		}
	}, [bloodBankInfo]);

	async function loadBloodBankInfo() {
		setLoading(true);
		try {
			const res = await apiRequest('/api/blood-bank/me');
			setBloodBankInfo(res);
		} catch (err) {
			console.error('Failed to load blood bank info:', err);
		} finally {
			setLoading(false);
		}
	}

	async function loadInventory() {
		try {
			const res = await apiRequest('/api/blood-bank/inventory');
			setInventory(res.inventory || []);
		} catch (err) {
			console.error('Failed to load inventory:', err);
			setInventory([]);
		}
	}

	async function loadRequests() {
		try {
			const res = await apiRequest('/api/blood-bank/requests');
			setRequests(res.requests || []);
		} catch (err) {
			console.error('Failed to load requests:', err);
			setRequests([]);
		}
	}

	async function handleSaveInventory(e) {
		e.preventDefault();
		setLoading(true);
		try {
			await apiRequest('/api/blood-bank/inventory', {
				method: 'POST',
				body: JSON.stringify({
					blood_type: inventoryForm.blood_type,
					quantity: parseInt(inventoryForm.quantity),
					expiry_date: inventoryForm.expiry_date || null,
					status: inventoryForm.status
				})
			});
			
			alert('Inventory updated successfully!');
			setShowInventoryModal(false);
			setEditingItem(null);
			setInventoryForm({ blood_type: '', quantity: '', expiry_date: '', status: 'available' });
			clearCache('/api/blood-bank/inventory');
			loadInventory();
		} catch (err) {
			alert('Failed to update inventory: ' + err.message);
		} finally {
			setLoading(false);
		}
	}

	async function handleUpdateRequest(requestId, status, notes = '') {
		setLoading(true);
		try {
			await apiRequest(`/api/blood-bank/requests/${requestId}`, {
				method: 'PUT',
				body: JSON.stringify({ status, notes })
			});
			
			alert('Request updated successfully!');
			clearCache('/api/blood-bank/requests');
			clearCache('/api/blood-bank/inventory');
			loadRequests();
			loadInventory();
		} catch (err) {
			alert('Failed to update request: ' + err.message);
		} finally {
			setLoading(false);
		}
	}

	function openInventoryModal(item = null) {
		if (item) {
			setEditingItem(item);
			setInventoryForm({
				blood_type: item.blood_type,
				quantity: item.quantity.toString(),
				expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : '',
				status: item.status
			});
		} else {
			setEditingItem(null);
			setInventoryForm({ blood_type: '', quantity: '', expiry_date: '', status: 'available' });
		}
		setShowInventoryModal(true);
	}

	function closeInventoryModal() {
		setShowInventoryModal(false);
		setEditingItem(null);
		setInventoryForm({ blood_type: '', quantity: '', expiry_date: '', status: 'available' });
	}

	function getStatusBadge(status) {
		const statusMap = {
			pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Pending' },
			approved: { color: 'bg-blue-100 text-blue-800 border-blue-200', text: 'Approved' },
			fulfilled: { color: 'bg-green-100 text-green-800 border-green-200', text: 'Fulfilled' },
			rejected: { color: 'bg-red-100 text-red-800 border-red-200', text: 'Rejected' },
			available: { color: 'bg-green-100 text-green-800 border-green-200', text: 'Available' },
			low_stock: { color: 'bg-orange-100 text-orange-800 border-orange-200', text: 'Low Stock' },
			out_of_stock: { color: 'bg-red-100 text-red-800 border-red-200', text: 'Out of Stock' }
		};
		const statusInfo = statusMap[status] || statusMap.pending;
		return (
			<span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
				{statusInfo.text}
			</span>
		);
	}

	function formatDate(dateString) {
		if (!dateString) return 'N/A';
		try {
			return new Date(dateString).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			});
		} catch {
			return dateString;
		}
	}

	if (checking) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Verifying access...</p>
				</div>
			</div>
		);
	}

	if (!verified) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 flex items-center justify-center p-4">
				<div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
					<div className="text-6xl mb-4">🔒</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
					<p className="text-gray-600 mb-6">
						You don't have access to the blood bank dashboard. Please contact an administrator.
					</p>
					<button
						onClick={() => window.location.href = '/login'}
						className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
					>
						Go to Login
					</button>
				</div>
			</div>
		);
	}

	const filteredRequests = requests.filter(request => {
		const matchesSearch = 
			request.blood_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			request.patients?.users?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			request.patients?.users?.email?.toLowerCase().includes(searchQuery.toLowerCase());
		
		const matchesStatus = 
			filterStatus === 'all' || 
			request.status === filterStatus;
		
		return matchesSearch && matchesStatus;
	});

	const totalUnits = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
	const pendingRequests = requests.filter(r => r.status === 'pending').length;
	const fulfilledRequests = requests.filter(r => r.status === 'fulfilled').length;

	return (
		<div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50">
			{/* Header */}
			<div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 bg-gradient-to-br from-red-600 to-rose-600 rounded-xl flex items-center justify-center text-white text-2xl">
								🩸
							</div>
							<div>
								<h1 className="text-2xl font-bold text-gray-900">Blood Bank Dashboard</h1>
								<p className="text-sm text-gray-600">
									{bloodBankInfo?.bloodBank?.name || bloodBankInfo?.user?.name || 'Blood Bank'}
								</p>
							</div>
						</div>
						<button
							onClick={() => supabase.auth.signOut()}
							className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
						>
							Logout
						</button>
					</div>
				</div>
			</div>
			
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
					<div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600 mb-1">Total Blood Units</p>
								<p className="text-3xl font-bold text-red-600">{totalUnits}</p>
							</div>
							<div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
								<span className="text-2xl">🩸</span>
							</div>
						</div>
					</div>
					<div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600 mb-1">Pending Requests</p>
								<p className="text-3xl font-bold text-yellow-600">{pendingRequests}</p>
							</div>
							<div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
								<span className="text-2xl">⏳</span>
							</div>
						</div>
					</div>
					<div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600 mb-1">Fulfilled Requests</p>
								<p className="text-3xl font-bold text-green-600">{fulfilledRequests}</p>
							</div>
							<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
								<span className="text-2xl">✅</span>
							</div>
						</div>
					</div>
				</div>

				{/* Inventory Section */}
				<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
					<div className="p-6 border-b border-gray-200 flex items-center justify-between">
						<div>
							<h2 className="text-xl font-bold text-gray-900">Blood Inventory</h2>
							<p className="text-sm text-gray-600 mt-1">Manage blood stock levels</p>
						</div>
						<button
							onClick={() => openInventoryModal()}
							className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
						>
							+ Add/Update Stock
						</button>
					</div>
					
					{loading && inventory.length === 0 ? (
						<div className="p-12 text-center">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
							<p className="text-gray-600">Loading inventory...</p>
						</div>
					) : inventory.length === 0 ? (
						<div className="p-12 text-center">
							<div className="text-6xl mb-4">🩸</div>
							<p className="text-gray-600 text-lg">No inventory yet</p>
							<p className="text-gray-500 text-sm mt-2">Add blood stock to get started</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity (Units)</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{inventory.map((item) => (
										<tr key={item.id} className="hover:bg-gray-50">
											<td className="px-6 py-4 whitespace-nowrap">
												<span className="text-lg font-bold text-red-600">{item.blood_type}</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className="text-sm font-medium text-gray-900">{item.quantity}</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className="text-sm text-gray-600">{formatDate(item.expiry_date)}</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												{getStatusBadge(item.status)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<button
													onClick={() => openInventoryModal(item)}
													className="text-red-600 hover:text-red-700 font-medium text-sm"
												>
													Edit
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				{/* Requests Section */}
				<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
					<div className="p-6 border-b border-gray-200">
						<div className="flex items-center justify-between mb-4">
							<div>
								<h2 className="text-xl font-bold text-gray-900">Blood Requests</h2>
								<p className="text-sm text-gray-600 mt-1">Manage patient blood requests</p>
							</div>
						</div>
						
						{/* Search and Filter */}
						<div className="flex flex-col md:flex-row gap-4">
							<div className="flex-1">
								<input
									type="text"
									placeholder="Search by blood type, patient name, or email..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
								/>
							</div>
							<div className="flex gap-2">
								<button
									onClick={() => setFilterStatus('all')}
									className={`px-4 py-2 rounded-lg font-medium transition ${
										filterStatus === 'all'
											? 'bg-red-600 text-white'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
									}`}
								>
									All
								</button>
								<button
									onClick={() => setFilterStatus('pending')}
									className={`px-4 py-2 rounded-lg font-medium transition ${
										filterStatus === 'pending'
											? 'bg-yellow-600 text-white'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
									}`}
								>
									Pending
								</button>
								<button
									onClick={() => setFilterStatus('fulfilled')}
									className={`px-4 py-2 rounded-lg font-medium transition ${
										filterStatus === 'fulfilled'
											? 'bg-green-600 text-white'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
									}`}
								>
									Fulfilled
								</button>
							</div>
						</div>
					</div>
					
					{loading && requests.length === 0 ? (
						<div className="p-12 text-center">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
							<p className="text-gray-600">Loading requests...</p>
						</div>
					) : filteredRequests.length === 0 ? (
						<div className="p-12 text-center">
							<div className="text-6xl mb-4">📋</div>
							<p className="text-gray-600 text-lg">No requests found</p>
							<p className="text-gray-500 text-sm mt-2">
								{searchQuery || filterStatus !== 'all' 
									? 'Try adjusting your search or filter'
									: 'New requests will appear here'}
							</p>
						</div>
					) : (
						<div className="divide-y divide-gray-200">
							{filteredRequests.map((request) => (
								<div key={request.id} className="p-6 hover:bg-gray-50 transition">
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-2">
												<h3 className="text-lg font-semibold text-gray-900">
													Blood Type: <span className="text-red-600">{request.blood_type}</span>
												</h3>
												{getStatusBadge(request.status)}
											</div>
											
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
												{request.patients?.users?.name && (
													<div>
														<p className="text-xs text-gray-500 mb-1">Patient Name</p>
														<p className="text-sm font-medium text-gray-900">{request.patients.users.name}</p>
													</div>
												)}
												{request.quantity && (
													<div>
														<p className="text-xs text-gray-500 mb-1">Quantity Required</p>
														<p className="text-sm font-medium text-gray-900">{request.quantity} units</p>
													</div>
												)}
												{request.urgency && (
													<div>
														<p className="text-xs text-gray-500 mb-1">Urgency</p>
														<p className="text-sm font-medium text-gray-900 capitalize">{request.urgency}</p>
													</div>
												)}
												{request.created_at && (
													<div>
														<p className="text-xs text-gray-500 mb-1">Request Date</p>
														<p className="text-sm font-medium text-gray-900">{formatDate(request.created_at)}</p>
													</div>
												)}
											</div>
											
											{request.notes && (
												<div className="mt-3">
													<p className="text-xs text-gray-500 mb-1">Notes</p>
													<p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{request.notes}</p>
												</div>
											)}
										</div>
										
										<div className="flex flex-col gap-2 ml-4">
											{request.status === 'pending' && (
												<>
													<button
														onClick={() => handleUpdateRequest(request.id, 'approved')}
														className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
													>
														✅ Approve
													</button>
													<button
														onClick={() => handleUpdateRequest(request.id, 'fulfilled')}
														className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
													>
														🩸 Fulfill
													</button>
													<button
														onClick={() => handleUpdateRequest(request.id, 'rejected')}
														className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
													>
														❌ Reject
													</button>
												</>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Inventory Modal */}
			{showInventoryModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
						<div className="p-6 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h2 className="text-2xl font-bold text-gray-900">
									{editingItem ? 'Update Inventory' : 'Add Blood Stock'}
								</h2>
								<button
									onClick={closeInventoryModal}
									className="text-gray-400 hover:text-gray-600 transition"
								>
									✕
								</button>
							</div>
						</div>
						
						<form onSubmit={handleSaveInventory} className="p-6 space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Blood Type *
								</label>
								<select
									value={inventoryForm.blood_type}
									onChange={(e) => setInventoryForm({...inventoryForm, blood_type: e.target.value})}
									required
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
								>
									<option value="">Select Blood Type</option>
									{bloodTypes.map(type => (
										<option key={type} value={type}>{type}</option>
									))}
								</select>
							</div>
							
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Quantity (Units) *
								</label>
								<input
									type="number"
									min="0"
									value={inventoryForm.quantity}
									onChange={(e) => setInventoryForm({...inventoryForm, quantity: e.target.value})}
									required
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
								/>
							</div>
							
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Expiry Date (Optional)
								</label>
								<input
									type="date"
									value={inventoryForm.expiry_date}
									onChange={(e) => setInventoryForm({...inventoryForm, expiry_date: e.target.value})}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
								/>
							</div>
							
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Status *
								</label>
								<select
									value={inventoryForm.status}
									onChange={(e) => setInventoryForm({...inventoryForm, status: e.target.value})}
									required
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
								>
									<option value="available">Available</option>
									<option value="low_stock">Low Stock</option>
									<option value="out_of_stock">Out of Stock</option>
								</select>
							</div>
							
							<div className="flex gap-3 pt-4">
								<button
									type="submit"
									disabled={loading}
									className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{loading ? 'Saving...' : editingItem ? 'Update' : 'Add Stock'}
								</button>
								<button
									type="button"
									onClick={closeInventoryModal}
									className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}

