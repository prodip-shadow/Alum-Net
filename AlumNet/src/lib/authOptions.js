import { dbConnect } from './dbConnect';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';

const providers = [
  CredentialsProvider({
    name: 'Email and Password',
    credentials: {
      email: { label: 'Email', type: 'email', placeholder: 'user@gmail.com' },
      password: {
        label: 'Password',
        type: 'password',
        placeholder: '••••••••',
      },
    },
    async authorize(credentials, req) {
      console.log(credentials);
      const { email, password } = credentials;

      if (!process.env.MONGODB_URI) {
        console.warn("Authentication skipped: MONGODB_URI is not defined.");
        return null;
      }

      try {
        const user = await dbConnect('users').findOne({ email });
        if (!user) {
          return null;
        }
        const isPasswordOk = await bcrypt.compare(password, user.password);
        if (isPasswordOk) {
          return user;
        }
      } catch (error) {
        console.error("Authentication error:", error);
      }
      return null;
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
} else {
  console.warn("WARNING: Google credentials (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET) are not defined. Google login is disabled.");
}

export const authOptions = {
  providers,
  secret: process.env.NEXTAUTH_SECRET || 'next-auth-fallback-secret-key-12345',
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
        if (!process.env.MONGODB_URI) {
          console.warn("signIn callback: MONGODB_URI is not defined. Skipping database sync.");
          return true; // Return true to allow sign in, or false to reject if database is required
        }
        const payload = {
          ...user,
          provider: account.provider,
          providerId: account.providerAccountId,
          role: 'user',
          createdAt: new Date().toISOString(),
        };
        if (!user?.email) {
          return false;
        }
        const isExist = await dbConnect('users').findOne({ email: user.email, providerId: account.providerAccountId });
        if (!isExist) {
          await dbConnect('users').insertOne(payload);
        }
        return true;
      } catch (error) {
        console.error("signIn callback error:", error);
        return false;
      }
    },
    async session({ session, token }) {
      if (token) {
        session.userId = token.userId;
        session.role = token.role;
        
        if (session.user) {
          session.user.name = token.name;
          session.user.email = token.email;
          session.user.image = token.picture;
          session.user.provider = token.provider;
        }
      }
      return session;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        if (account) {
          token.provider = account.provider;
        }
      }

      // Always fetch the latest role and details from DB if MONGODB_URI is available
      if (token.email && process.env.MONGODB_URI) {
        try {
          const dbUser = await dbConnect('users').findOne({ email: token.email });
          if (dbUser) {
            token.userId = dbUser._id.toString();
            token.role = dbUser.role || 'user';
            token.name = dbUser.name || token.name;
            token.picture = dbUser.image || token.picture;
            if (dbUser.provider) {
              token.provider = dbUser.provider;
            }
          } else {
            token.role = token.role || 'user';
          }
        } catch (error) {
          console.error("jwt callback database error:", error);
          token.role = token.role || 'user';
        }
      } else {
        token.role = token.role || 'user';
      }

      if (trigger === 'update' && session) {
        if (session.name !== undefined) token.name = session.name;
        if (session.email !== undefined) token.email = session.email;
        if (session.image !== undefined) token.picture = session.image;
        if (session.role !== undefined) token.role = session.role;
      }

      return token;
    },
  },
};
