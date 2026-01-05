import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: 'ADMIN' | 'VIEWER';
    };
  }

  interface User {
    id: string;
    email: string;
    role: 'ADMIN' | 'VIEWER';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'ADMIN' | 'VIEWER';
  }
}

