import jwt from 'jsonwebtoken';

export function generateToken(id: string, email: string, role: 'user' | 'business' | 'admin'): string {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.sign({ id, email, role }, secret, { expiresIn: '24h' });
}
