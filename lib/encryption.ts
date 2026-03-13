import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// Ensure the secret key exists and is 32 bytes
const getSecretKey = () => {
  const secret = process.env.ENCRYPTION_SECRET_KEY;
  if (!secret || secret.length !== 32) {
    throw new Error('ENCRYPTION_SECRET_KEY must be exactly 32 characters long.');
  }
  return Buffer.from(secret);
};

export function encrypt(text: string) {
  // Generate a random 16-byte Initialization Vector
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // GCM mode generates an auth tag to ensure data integrity
  const authTag = cipher.getAuthTag();

  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

export function decrypt(encryptedData: string, ivHex: string, authTagHex: string): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM, 
    getSecretKey(), 
    Buffer.from(ivHex, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}