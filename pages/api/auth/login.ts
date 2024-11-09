import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/prisma';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { wallet, signature } = req.body;

  if (!wallet || !signature) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  // 验证签名
  const message = `Sign this message to authenticate with your wallet: ${wallet}`;
  const signerAddress = ethers.utils.verifyMessage(message, signature);

  if (signerAddress.toLowerCase() !== wallet.toLowerCase()) {
    return res.status(401).json({ error: 'Signature verification failed' });
  }

  // 查找用户
  let user = await db.user.findUnique({
    where: { wallet },
  });

  // 如果用户不存在，创建新用户
  if (!user) {
    user = await db.user.create({
      data: { wallet },
    });
  }

  // 生成JWT
  const token = jwt.sign({ wallet: user.wallet }, SECRET_KEY, { expiresIn: '1h' });

  return res.status(200).json({ token,wallet });
}
