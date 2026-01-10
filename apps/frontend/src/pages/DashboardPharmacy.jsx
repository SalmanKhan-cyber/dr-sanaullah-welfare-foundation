import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { apiRequest } from '../lib/api';
import { useVerification } from '../hooks/useVerification';

export default function DashboardPharmacy() {
	const { verified, checking } = useVerification('pharmacy');
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('inventory');
	const [showAddItem, setShowAddItem] = useState(false);
	const [showEditItem, setShowEditItem] = useState(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [filterCategory, setFilterCategory] = useState('All');
	const [uploadingImage, setUploadingImage] = useState(false);
	const [itemImage, setItemImage] = useState(null);
	const [imagePreview, setImagePreview] = useState('');

	const [itemForm, setItemForm] = useState({
		name: '',
		category: '',
		description: '',
		price: 0,
		discount_percentage: 50,
		stock_quantity: 0,
		supplier_info: '',
		image_url: ''
	});

	const categories = ['All', 'Cardiology', 'Diabetes', 'Pain Relief', 'Antibiotics', 'Vitamins'];

	useEffect(() => {
		if (!checking && verified) {
			loadData();
		}
	}, [activeTab, verified, checking]);

	async function loadData() {
		setLoading(true);
		try {
			if (activeTab === 'inventory') {
				// Use optimized API endpoint with limit
				try {
					const res = await apiRequest('/api/pharmacy/inventory?limit=100', { noCache: true });
					setItems(res.items || []);
				} catch (err) {
					console.warn('API endpoint failed, using direct query:', err);
					// Fallback: only select essential fields
					const { data, error } = await supabase
						.from('pharmacy_inventory')
						.select('medicine_id, name, category, price, discount_percentage, stock_quantity, image_url, supplier_info, description')
						.order('name')
						.limit(100);
					if (!error) setItems(data || []);
				}
			}
		} catch (err) {
			console.error('Error loading data:', err);
		} finally {
			setLoading(false);
		}
	}

	async function handleImageUpload(file) {
		setUploadingImage(true);
		try {
			const fileExt = file.name.split('.').pop();
			const fileName = `${Math.random()}.${fileExt}`;
			const filePath = `medicines/${fileName}`;

			const { error: uploadError } = await supabase.storage
				.from('medicines')
				.upload(filePath, file);

			if (uploadError) throw uploadError;

			const { data } = supabase.storage
				.from('medicines')
				.getPublicUrl(filePath);

			setItemForm(prev => ({ ...prev, image_url: data.publicUrl }));
			setImagePreview(data.publicUrl);
		} catch (err) {
			alert('Image upload failed: ' + err.message);
		} finally {
			setUploadingImage(false);
		}
	}

	function handleImageChange(e) {
		const file = e.target.files?.[0];
		if (file) {
			setItemImage(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result);
			};
			reader.readAsDataURL(file);
			// Upload image and update form
			handleImageUpload(file).then(() => {
				console.log('✅ Image uploaded, image_url should be in itemForm:', itemForm.image_url);
			}).catch(err => {
				console.error('❌ Image upload failed:', err);
			});
		}
	}

	async function addItem() {
		try {
			await apiRequest('/api/pharmacy/inventory', {
				method: 'POST',
				body: JSON.stringify(itemForm)
			});
			setShowAddItem(false);
			setItemForm({ name: '', category: '', description: '', price: 0, discount_percentage: 50, stock_quantity: 0, supplier_info: '', image_url: '' });
			setImagePreview('');
			setItemImage(null);
			loadData();
		} catch (err) {
			alert(err.message);
		}
	}

	async function updateItem(id) {
		try {
			setUploadingImage(true);
			
			const formData = new FormData();
			
			// Add all form fields (convert to string for FormData)
			formData.append('name', itemForm.name || showEditItem.name);
			formData.append('category', itemForm.category || showEditItem.category);
			formData.append('description', itemForm.description || showEditItem.description || '');
			formData.append('price', (itemForm.price || showEditItem.price || 0).toString());
			formData.append('discount_percentage', (itemForm.discount_percentage || showEditItem.discount_percentage || 50).toString());
			formData.append('stock_quantity', (itemForm.stock_quantity || showEditItem.stock_quantity || 0).toString());
			formData.append('supplier_info', itemForm.supplier_info || showEditItem.supplier_info || '');
			
			// CRITICAL: Always include image_url in the update
			// Priority: new file > uploaded URL in form > existing URL
			let finalImageUrl = null;
			if (itemImage) {
				// New file selected - send file to backend, it will upload
				formData.append('image', itemImage);
				console.log('📤 Sending new image file to backend');
			} else {
				// No new file - determine which image_url to use
				// Check form first (in case image was just uploaded), then existing
				finalImageUrl = itemForm.image_url || showEditItem.image_url || null;
				
				if (finalImageUrl) {
					// Remove cache-busting parameters before sending
					const cleanUrl = finalImageUrl.split('?')[0];
					formData.append('image_url', cleanUrl);
					console.log('📤 Sending image_url to backend:', cleanUrl);
				} else {
					console.log('⚠️ No image_url available - medicine will have no image');
				}
			}
			
			// Debug logging
			console.log('📸 Update details:', {
				medicineId: id,
				hasNewFile: !!itemImage,
				formImageUrl: itemForm.image_url,
				existingImageUrl: showEditItem.image_url,
				finalImageUrl: finalImageUrl ? finalImageUrl.split('?')[0] : null,
				formDataHasImageUrl: formData.has('image_url'),
				formDataHasImage: formData.has('image')
			});
			
			// Use fetch directly for FormData
			const { data: { session } } = await supabase.auth.getSession();
			const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/pharmacy/items/${id}`, {
				method: 'PUT',
				headers: {
					...(session?.access_token && { Authorization: `Bearer ${session.access_token}` })
				},
				body: formData
			});
			
			if (!response.ok) {
				const error = await response.json().catch(() => ({ error: 'Update failed' }));
				throw new Error(error.error || response.statusText);
			}
			
			const result = await response.json();
			console.log('✅ Medicine updated successfully:', {
				id: result.item?.medicine_id,
				name: result.item?.name,
				image_url: result.item?.image_url || 'null'
			});
			
			// Clear form
			setShowEditItem(null);
			setImagePreview('');
			setItemImage(null);
			setItemForm({ name: '', category: '', description: '', price: 0, discount_percentage: 50, stock_quantity: 0, supplier_info: '', image_url: '' });
			
			// Wait a moment for backend to save, then reload
			await new Promise(resolve => setTimeout(resolve, 500));
			await loadData();
			
			alert('Medicine updated successfully!');
		} catch (err) {
			console.error('❌ Update error:', err);
			alert(err.message);
		} finally {
			setUploadingImage(false);
		}
	}

	async function deleteItem(id) {
		if (!confirm('Are you sure you want to delete this medicine?')) return;
		try {
			await apiRequest(`/api/pharmacy/items/${id}`, { method: 'DELETE' });
			loadData();
		} catch (err) {
			alert(err.message);
		}
	}

	function getMedicineIcon(category) {
		const icons = {
			'Cardiology': '❤️',
			'Diabetes': '🩺',
			'Pain Relief': '💊',
			'Antibiotics': '🔬',
			'Vitamins': '🌟',
			'default': '💉'
		};
		return icons[category] || icons.default;
	}

	const filteredItems = items.filter(item => {
		const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.description?.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
		return matchesSearch && matchesCategory;
	});

	const lowStockItems = items.filter(item => item.stock_quantity < 50);
	const totalStock = items.reduce((sum, item) => sum + item.stock_quantity, 0);

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
			{/* Animated Background Elements */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
			</div>

			<div className="max-w-7xl mx-auto px-4 py-12 relative">
				{/* Header */}
				<div className="text-center mb-12">
					<div className="inline-flex items-center gap-4 mb-6">
						<div className="relative">
							<div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
							<div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-5xl shadow-2xl">
								💊
							</div>
						</div>
						<h1 className="text-5xl md:text-6xl font-extrabold">
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
								Pharmacy Control Center
							</span>
						</h1>
					</div>
					<p className="text-xl text-gray-700 max-w-2xl mx-auto">
						Advanced medication management and prescription processing system
					</p>
				</div>

				{/* Stats Cards */}
				<div className="grid md:grid-cols-3 gap-6 mb-12">
					<div className="group relative bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-2xl p-6 text-white overflow-hidden transform hover:scale-105 transition-all duration-300">
						<div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
						<div className="relative">
							<div className="text-4xl mb-3 filter drop-shadow-2xl">📦</div>
							<div className="text-4xl font-black mb-2">{items.length}</div>
							<p className="text-purple-100 font-semibold">Total Medicines</p>
							<div className="mt-3 w-full bg-white/20 rounded-full h-1.5">
								<div className="bg-white rounded-full h-1.5" style={{ width: '100%' }}></div>
							</div>
						</div>
					</div>

					<div className="group relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl p-6 text-white overflow-hidden transform hover:scale-105 transition-all duration-300">
						<div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
						<div className="relative">
							<div className="text-4xl mb-3 filter drop-shadow-2xl">📊</div>
							<div className="text-4xl font-black mb-2">{totalStock.toLocaleString()}</div>
							<p className="text-blue-100 font-semibold">Total Stock</p>
							<div className="mt-3 w-full bg-white/20 rounded-full h-1.5">
								<div className="bg-white rounded-full h-1.5" style={{ width: '100%' }}></div>
							</div>
						</div>
					</div>

					<div className="group relative bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-2xl p-6 text-white overflow-hidden transform hover:scale-105 transition-all duration-300">
						<div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
						<div className="relative">
							<div className="text-4xl mb-3 filter drop-shadow-2xl">⚠️</div>
							<div className="text-4xl font-black mb-2">{lowStockItems.length}</div>
							<p className="text-orange-100 font-semibold">Low Stock Alerts</p>
							<div className="mt-3 w-full bg-white/20 rounded-full h-1.5">
								<div className="bg-white rounded-full h-1.5" style={{ width: items.length > 0 ? `${(lowStockItems.length / items.length) * 100}%` : '0%' }}></div>
							</div>
						</div>
					</div>
				</div>

				{/* Tabs */}
				<div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl mb-8 border border-white/20">
					<div className="border-b border-gray-200">
						<nav className="flex space-x-8 px-6 overflow-x-auto">
							{['inventory'].map(tab => (
								<button
									key={tab}
									onClick={() => setActiveTab(tab)}
									className={`py-4 px-1 border-b-2 font-medium text-sm capitalize whitespace-nowrap transition-colors ${
										activeTab === tab
											? 'border-purple-600 text-purple-600 font-bold'
											: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
									}`}
								>
									{tab}
								</button>
							))}
						</nav>
					</div>

					{/* Tab Content */}
					<div className="p-6">
						{activeTab === 'inventory' && (
							<div>
								{/* Search and Filter */}
								<div className="mb-6 flex flex-col md:flex-row gap-4">
									<div className="flex-1">
										<div className="relative">
											<span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">🔍</span>
											<input
												type="text"
												value={searchQuery}
												onChange={e => setSearchQuery(e.target.value)}
												className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
												placeholder="Search medicines by name or description..."
											/>
										</div>
									</div>
									<div className="flex gap-3">
										{categories.map(cat => (
											<button
												key={cat}
												onClick={() => setFilterCategory(cat)}
												className={`px-4 py-3 rounded-xl font-semibold transition-all ${
													filterCategory === cat
														? 'bg-purple-600 text-white shadow-lg scale-105'
														: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
												}`}
											>
												{cat}
											</button>
										))}
										<button
											onClick={() => setShowAddItem(true)}
											className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
										>
											+ Add Medicine
										</button>
									</div>
								</div>

								{loading ? (
									<div className="text-center py-12">
										<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
										<p className="mt-4 text-gray-600">Loading inventory...</p>
									</div>
								) : filteredItems.length === 0 ? (
									<div className="text-center py-12">
										<div className="text-6xl mb-4">💊</div>
										<h3 className="text-xl font-bold text-gray-900 mb-2">No medicines found</h3>
										<p className="text-gray-600">Try adjusting your search or filters</p>
									</div>
								) : (
									<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
										{filteredItems.map(item => (
											<div
												key={item.medicine_id}
												className="group relative bg-gradient-to-br rounded-2xl p-6 shadow-lg transition-all duration-300 overflow-hidden border-2 hover:shadow-2xl transform hover:scale-105 from-purple-50 to-pink-50 border-purple-200"
											>
												<div className="absolute top-0 right-0 w-24 h-24 bg-white/30 rounded-full blur-2xl"></div>
												<div className="relative">
													<div className="flex items-start justify-between mb-4">
														{item.image_url ? (
															<img 
																src={(() => {
																	const url = item.image_url;
																	const urlHash = url.split('/').pop() || '';
																	const cacheBuster = `v=${Date.now()}&h=${urlHash.substring(0, 8)}`;
																	return url.includes('?') ? `${url.split('?')[0]}?${cacheBuster}` : `${url}?${cacheBuster}`;
																})()} 
																alt={item.name} 
																className="w-16 h-16 rounded-xl object-cover shadow-lg"
																key={`pharm-img-${item.medicine_id}-${item.image_url}-${Date.now()}`}
																loading="eager"
																onError={(e) => {
																	console.error('Failed to load medicine image:', item.image_url);
																	e.target.style.display = 'none';
																	e.target.nextElementSibling?.remove();
																	const fallback = document.createElement('div');
																	fallback.className = 'w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center text-3xl shadow-lg';
																	fallback.textContent = getMedicineIcon(item.category);
																	e.target.parentElement.appendChild(fallback);
																}}
															/>
														) : (
															<div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center text-3xl shadow-lg">
																{getMedicineIcon(item.category)}
															</div>
														)}
														{item.stock_quantity < 50 && (
															<span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold shadow-lg animate-pulse">
																LOW STOCK
															</span>
														)}
													</div>

													<h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
													<p className="text-sm text-purple-600 font-semibold mb-3">{item.category}</p>

													<div className="space-y-2 mb-4">
														<div className="flex justify-between items-center">
															<span className="text-xs text-gray-600">Regular Price</span>
															<span className="text-sm font-semibold text-gray-700">PKR {Number(item.price).toFixed(2)}</span>
														</div>
														<div className="flex justify-between items-center">
															<span className="text-xs text-gray-600">Discount</span>
															<span className="text-sm font-bold text-green-600">{item.discount_percentage}% OFF</span>
														</div>
														<div className="flex justify-between items-center bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-2">
															<span className="text-xs font-semibold text-gray-900">Final Price</span>
															<span className="text-lg font-black text-brand">
																PKR {(Number(item.price) * (1 - item.discount_percentage / 100)).toFixed(2)}
															</span>
														</div>
														<div className="flex justify-between items-center">
															<span className="text-xs text-gray-600">Stock</span>
															<span className={`text-sm font-bold ${item.stock_quantity < 50 ? 'text-orange-600' : 'text-green-600'}`}>
																{item.stock_quantity} units
															</span>
														</div>
													</div>

													<div className="flex gap-2">
														<button
															onClick={() => {
																setShowEditItem(item);
																// Make sure to include image_url in the form
																setItemForm({ 
																	...item, 
																	image_url: item.image_url || '' 
																});
																setImagePreview(item.image_url || '');
																setItemImage(null); // Clear any previous file selection
															}}
															className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold hover:shadow-lg transition-all"
														>
															✏️ Edit
														</button>
														<button
															onClick={() => deleteItem(item.medicine_id)}
															className="flex-1 bg-red-600 text-white py-2 rounded-xl font-semibold hover:shadow-lg transition-all"
														>
															🗑️ Delete
														</button>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						)}

					</div>
				</div>
			</div>

			{/* Add Item Modal */}
			{showAddItem && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<h3 className="text-2xl font-bold text-gray-900 mb-6">Add New Medicine</h3>
						<div className="grid md:grid-cols-2 gap-4">
							{/* Image Upload */}
							<div className="md:col-span-2">
								<label className="block text-sm font-medium mb-1">Medicine Image</label>
								<div className="flex items-center gap-4">
									<div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
										{imagePreview ? (
											<img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
										) : (
											<div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
												📷
											</div>
										)}
									</div>
									<div className="flex-1">
										<label className="cursor-pointer inline-block">
											<span className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors cursor-pointer disabled:opacity-50">
												Choose File
											</span>
											<input
												type="file"
												accept="image/*"
												onChange={handleImageChange}
												className="hidden"
												disabled={uploadingImage}
											/>
										</label>
										{imagePreview && (
											<p className="text-xs text-gray-600 mt-2">✓ Image selected</p>
										)}
										{uploadingImage && (
											<p className="text-xs text-gray-500 mt-1">Uploading image...</p>
										)}
									</div>
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Name</label>
								<input
									className="w-full border p-2 rounded"
									value={itemForm.name}
									onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Category</label>
								<select
									className="w-full border p-2 rounded"
									value={itemForm.category}
									onChange={e => setItemForm({ ...itemForm, category: e.target.value })}
								>
									<option value="">Select</option>
									{categories.filter(c => c !== 'All').map(cat => (
										<option key={cat} value={cat}>{cat}</option>
									))}
								</select>
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm font-medium mb-1">Description</label>
								<textarea
									className="w-full border p-2 rounded"
									value={itemForm.description}
									onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
									rows="2"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Price (PKR)</label>
								<input
									type="number"
									className="w-full border p-2 rounded"
									value={itemForm.price}
									onChange={e => setItemForm({ ...itemForm, price: Number(e.target.value) })}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Discount (%)</label>
								<input
									type="number"
									className="w-full border p-2 rounded"
									value={itemForm.discount_percentage}
									onChange={e => setItemForm({ ...itemForm, discount_percentage: Number(e.target.value) })}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Stock Quantity</label>
								<input
									type="number"
									className="w-full border p-2 rounded"
									value={itemForm.stock_quantity}
									onChange={e => setItemForm({ ...itemForm, stock_quantity: Number(e.target.value) })}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Supplier Info</label>
								<input
									className="w-full border p-2 rounded"
									value={itemForm.supplier_info}
									onChange={e => setItemForm({ ...itemForm, supplier_info: e.target.value })}
								/>
							</div>
						</div>
						<div className="flex gap-2 mt-4">
							<button onClick={addItem} className="flex-1 bg-purple-600 text-white px-4 py-2 rounded">Add Medicine</button>
							<button onClick={() => {
								setShowAddItem(false);
								setImagePreview('');
								setItemImage(null);
							}} className="flex-1 bg-gray-200 px-4 py-2 rounded">Cancel</button>
						</div>
					</div>
				</div>
			)}

			{/* Edit Item Modal */}
			{showEditItem && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Medicine</h3>
						<div className="grid md:grid-cols-2 gap-4">
							{/* Image Upload */}
							<div className="md:col-span-2">
								<label className="block text-sm font-medium mb-1">Medicine Image</label>
								<div className="flex items-center gap-4">
									<div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
										{imagePreview ? (
											<img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
										) : showEditItem.image_url ? (
											<img 
												src={(() => {
													const url = showEditItem.image_url;
													const urlHash = url.split('/').pop() || '';
													const cacheBuster = `v=${Date.now()}&h=${urlHash.substring(0, 8)}`;
													return url.includes('?') ? `${url.split('?')[0]}?${cacheBuster}` : `${url}?${cacheBuster}`;
												})()} 
												alt="Current" 
												className="w-full h-full object-cover"
												key={`pharm-edit-${showEditItem.medicine_id}-${showEditItem.image_url}-${Date.now()}`}
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
												📷
											</div>
										)}
									</div>
									<div className="flex-1">
										<label className="cursor-pointer inline-block">
											<span className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors cursor-pointer disabled:opacity-50">
												Choose File
											</span>
											<input
												type="file"
												accept="image/*"
												onChange={handleImageChange}
												className="hidden"
												disabled={uploadingImage}
											/>
										</label>
										{imagePreview && (
											<p className="text-xs text-gray-600 mt-2">✓ Image selected</p>
										)}
										{uploadingImage && (
											<p className="text-xs text-gray-500 mt-1">Uploading image...</p>
										)}
									</div>
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Name</label>
								<input
									className="w-full border p-2 rounded"
									defaultValue={showEditItem.name}
									onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Category</label>
								<select
									className="w-full border p-2 rounded"
									defaultValue={showEditItem.category}
									onChange={e => setItemForm({ ...itemForm, category: e.target.value })}
								>
									<option value="">Select</option>
									{categories.filter(c => c !== 'All').map(cat => (
										<option key={cat} value={cat}>{cat}</option>
									))}
								</select>
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm font-medium mb-1">Description</label>
								<textarea
									className="w-full border p-2 rounded"
									defaultValue={showEditItem.description}
									onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
									rows="2"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Price (PKR)</label>
								<input
									type="number"
									className="w-full border p-2 rounded"
									defaultValue={showEditItem.price}
									onChange={e => setItemForm({ ...itemForm, price: Number(e.target.value) })}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Discount (%)</label>
								<input
									type="number"
									className="w-full border p-2 rounded"
									defaultValue={showEditItem.discount_percentage}
									onChange={e => setItemForm({ ...itemForm, discount_percentage: Number(e.target.value) })}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Stock Quantity</label>
								<input
									type="number"
									className="w-full border p-2 rounded"
									defaultValue={showEditItem.stock_quantity}
									onChange={e => setItemForm({ ...itemForm, stock_quantity: Number(e.target.value) })}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Supplier Info</label>
								<input
									className="w-full border p-2 rounded"
									defaultValue={showEditItem.supplier_info}
									onChange={e => setItemForm({ ...itemForm, supplier_info: e.target.value })}
								/>
							</div>
						</div>
						<div className="flex gap-2 mt-4">
							<button onClick={() => updateItem(showEditItem.medicine_id)} className="flex-1 bg-purple-600 text-white px-4 py-2 rounded">Update Medicine</button>
							<button onClick={() => {
								setShowEditItem(null);
								setImagePreview('');
								setItemImage(null);
							}} className="flex-1 bg-gray-200 px-4 py-2 rounded">Cancel</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
