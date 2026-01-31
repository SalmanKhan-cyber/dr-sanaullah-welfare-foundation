import { getSupabaseForToken } from '../lib/supabase.js';

export async function authMiddleware(req, res, next) {
	try {
		const authHeader = req.headers.authorization || '';
		const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
		if (!token) return res.status(401).json({ error: 'Missing token' });

		const supabase = getSupabaseForToken(token);
		const { data: { user }, error } = await supabase.auth.getUser();
		if (error || !user) return res.status(401).json({ error: 'Invalid token' });

		// Prefer role from our application users table if available,
		// fall back to auth metadata, then finally 'patient'.
		let roleFromMetadata = user.user_metadata?.role;
		let roleFromDb = null;
		try {
			// Use service client via getSupabaseForToken? We only have a client bound to the token,
			// but selecting the current user's row is allowed by RLS policies.
			const { data: userRow } = await supabase
				.from('users')
				.select('role')
				.eq('id', user.id)
				.single();
			roleFromDb = userRow?.role || null;
		} catch (_e) {
			// Ignore, we'll fall back to metadata
		}

		const resolvedRole = roleFromDb || roleFromMetadata || 'patient';

		req.user = {
			id: user.id,
			email: user.email,
			role: resolvedRole,
			phone: user.phone
		};
		next();
	} catch (err) {
		next(err);
	}
}
