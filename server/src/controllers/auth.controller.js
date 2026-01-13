import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';

/**
 * Login de administrador
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: 'E-mail e senha são obrigatórios'
      });
    }

    // Buscar usuário
    const user = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Credenciais inválidas'
      });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: true,
        message: 'Credenciais inválidas'
      });
    }

    // Verificar se usuário está ativo
    if (!user.active) {
      return res.status(403).json({
        error: true,
        message: 'Usuário inativo'
      });
    }

    // Atualizar último login
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Verificar token e retornar dados do usuário
 */
export const me = async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
};

/**
 * Criar usuário admin (apenas para setup inicial ou por outro admin)
 */
export const createAdmin = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: 'E-mail e senha são obrigatórios'
      });
    }

    // Verificar se já existe
    const existing = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existing) {
      return res.status(409).json({
        error: true,
        message: 'E-mail já cadastrado'
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário
    const user = await prisma.adminUser.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || null,
        role: 'admin'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Administrador criado com sucesso',
      data: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    next(error);
  }
};
