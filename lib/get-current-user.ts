import { cookies } from 'next/headers';
import { JWTServiceEdge } from './jwt-edge';

export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token');

  if (!token) {
    return null;
  }

  try {
    const user = await JWTServiceEdge.verify(token.value);
    return user;
  } catch (error) {
    return null;
  }
}
