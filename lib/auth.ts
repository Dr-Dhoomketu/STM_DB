import { getPool } from './db';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  email: string;
  role: 'ADMIN' | 'VIEWER';
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<User | null> {
  const pool = getPool();
  const result = await pool.query(
    'SELECT id, email, password_hash, role FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

export async function getUserById(id: number): Promise<User | null> {
  const pool = getPool();
  const result = await pool.query(
    'SELECT id, email, role FROM users WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return {
    id: result.rows[0].id,
    email: result.rows[0].email,
    role: result.rows[0].role,
  };
}

export async function changePassword(
  userId: number,
  oldPassword: string,
  newPassword: string
): Promise<boolean> {
  const pool = getPool();
  
  // Verify old password
  const userResult = await pool.query(
    'SELECT password_hash FROM users WHERE id = $1',
    [userId]
  );

  if (userResult.rows.length === 0) {
    return false;
  }

  const isValid = await bcrypt.compare(
    oldPassword,
    userResult.rows[0].password_hash
  );

  if (!isValid) {
    return false;
  }

  // Update password
  const newHash = await bcrypt.hash(newPassword, 10);
  await pool.query(
    'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [newHash, userId]
  );

  return true;
}

