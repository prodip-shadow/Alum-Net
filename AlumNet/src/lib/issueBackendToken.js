import { getServerSession } from 'next-auth';
import jwt from 'jsonwebtoken';
import { authOptions } from './authOptions';


export async function issueBackendToken() {
  const session = await getServerSession(authOptions);

  if (!session || !session.userId) {
    return null;
  }

  const secret = process.env.BACKEND_JWT_SECRET;

  if (!secret) {
    throw new Error('BACKEND_JWT_SECRET is not defined');
  }

  const token = jwt.sign(
    {
      userId: session.userId,
      email: session.user.email,
      role: session.role,
    },
    secret,
    {
      expiresIn: '1h',
    }
  );

  return token;
}