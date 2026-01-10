import { useState } from 'react';

export default function FileUpload({ onUpload, accept = '*', label = 'Upload File' }) {
	const [file, setFile] = useState(null);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState('');

	async function handleUpload() {
		if (!file) return setError('Please select a file');
		setUploading(true);
		setError('');
		try {
			await onUpload(file);
			setFile(null);
		} catch (err) {
			setError(err.message || 'Upload failed');
		} finally {
			setUploading(false);
		}
	}

	return (
		<div className="space-y-2">
			<label className="block text-sm font-medium text-gray-700">{label}</label>
			<input
				type="file"
				accept={accept}
				onChange={e => setFile(e.target.files?.[0] || null)}
				className="block w-full text-sm text-gray-500
					file:mr-4 file:py-2 file:px-4
					file:rounded file:border-0
					file:text-sm file:font-semibold
					file:bg-brand file:text-white
					hover:file:bg-brand-dark"
			/>
			{file && (
				<button
					onClick={handleUpload}
					disabled={uploading}
					className="bg-brand text-white px-4 py-2 rounded disabled:opacity-50"
				>
					{uploading ? 'Uploading...' : 'Upload'}
				</button>
			)}
			{error && <p className="text-sm text-red-600">{error}</p>}
		</div>
	);
}

