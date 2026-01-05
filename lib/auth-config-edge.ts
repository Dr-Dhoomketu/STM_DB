// Edge-compatible auth config for middleware
// This doesn't import database functions to avoid pg dependency
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Lazy load the database-dependent function only when needed (not during middleware)
async function verifyCredentialsLazy(email: string, password: string) {
  // Dynamic import to avoid pulling in pg during middleware execution
  const { verifyCredentials } = await import('./auth');
  return verifyCredentials(email, password);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await verifyCredentialsLazy(
          credentials.email as string,
          credentials.password as string
        );

        if (!user) {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'ADMIN' | 'VIEWER';
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

