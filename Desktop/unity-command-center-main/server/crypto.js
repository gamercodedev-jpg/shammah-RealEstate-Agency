const crypto = require('crypto');

const ALGO = 'aes-256-gcm';
const KEK = process.env.SERVER_KEK || null; // base64 key for demo

function genDEK() {
  return crypto.randomBytes(32); // 256-bit
}

function encryptField(plaintext, dekBuffer) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, dekBuffer, iv);
  const encrypted = Buffer.concat([cipher.update(Buffer.from(plaintext, 'utf8')), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { ciphertext: encrypted.toString('base64'), iv: iv.toString('base64'), tag: tag.toString('base64') };
}

function decryptField(ciphertextB64, ivB64, tagB64, dekBuffer) {
  const cipherText = Buffer.from(ciphertextB64, 'base64');
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const decipher = crypto.createDecipheriv(ALGO, dekBuffer, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(cipherText), decipher.final()]);
  return decrypted.toString('utf8');
}

function wrapDEK(dekBuffer) {
  // For demo: KEK is a symmetric base64 key in env; in prod use KMS
  if (!KEK) throw new Error('No KEK configured');
  const kek = Buffer.from(KEK, 'base64');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, kek, iv);
  const enc = Buffer.concat([cipher.update(dekBuffer), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { wrappedKey: enc.toString('base64'), iv: iv.toString('base64'), tag: tag.toString('base64'), kekId: 'local-kek' };
}

function unwrapDEK(wrapped, kekId) {
  if (!KEK) throw new Error('No KEK configured');
  const kek = Buffer.from(KEK, 'base64');
  const enc = Buffer.from(wrapped, 'base64');
  const iv = Buffer.from(wrapped.iv, 'base64');
  const tag = Buffer.from(wrapped.tag, 'base64');
  const decipher = crypto.createDecipheriv(ALGO, kek, iv);
  decipher.setAuthTag(tag);
  const dek = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dek;
}

module.exports = { genDEK, encryptField, decryptField, wrapDEK, unwrapDEK };
