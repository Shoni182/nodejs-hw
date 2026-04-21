import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import bcrypt from 'bcrypt';
import { createSession, setSessionCookies } from '../services/auth.js';
import { Session } from '../models/session.js';

import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';
import { sendEmail } from '../utils/sendMail.js';

//^ Registe User
export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  // шукаємо користувачів із таким email
  const existingUser = await User.findOne({ email });

  // перевірка email
  if (existingUser) {
    throw createHttpError(400, 'Email in use');
  }

  // хешуємо пароль
  const hashedPassword = await bcrypt.hash(password, 10);

  // створюємо користувача
  const newUser = await User.create({
    email,
    password: hashedPassword,
  });

  // створюємо нову сессію
  const newSession = await createSession(newUser._id);

  // викликаємо і передаємо обєкт відповіді та сесію
  setSessionCookies(res, newSession);

  res.status(201).json(newUser);
};

//^ Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  // якщо юзера нема
  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }

  //Порівнюємо хеші паролів
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw createHttpError(401, 'Ivalid credentials');
  }

  // видаляємо стару версію користувача
  await Session.deleteOne({ userId: user._id });

  // створюємо нову сесію
  const newSession = await createSession(user._id);

  // Викликаємо, передаємо об'єкт відповіді та сесію
  setSessionCookies(res, newSession);

  res.status(200).json(user);
};

//^ LogOut User
export const logoutUser = async (req, res) => {
  const { sessionId } = req.cookies;
  if (sessionId) {
    await Session.deleteOne({ _id: sessionId });
  }

  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

//^ Refresh User Session
export const refreshUserSession = async (req, res) => {
  // Знаходимо айді та рефреш токен в кокісах сесії
  const session = await Session.findOne({
    _id: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  // якщо сесії немає повертаємо помилку
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }
  //Якщо сесія існує перевіряємо валідність рефреш токена
  const isSessionTokenExpored =
    new Date() > new Date(session.refreshTokenValidUntil);

  //Якщо термін дії рефреш токена вийшов, повертаємо помилку
  if (isSessionTokenExpored) {
    throw createHttpError(401, 'Session token expired');
  }

  // Якщо всі перевірки пройшли добре, видаляємо поточну сесію
  await Session.deleteOne({
    _id: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  // Створюємо нову сесію та додаємо кукі
  const newSession = await createSession(session.userId);
  setSessionCookies(res, newSession);

  res.status(200).json({
    message: 'Session refreshed',
  });
};

// ^ requestResetEmail
export const requestResetEmail = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  // Якщо користувача нема — навмисно повертаємо ту саму "успішну"
  if (!user) {
    return res.status(200).json({
      message: 'Password reset email sent successfully',
    });
  }

  // Користувач є — генеруємо короткоживучий JWT і відправляємо лист
  const jwtToken = jwt.sign({ sub: user._id, email }, process.env.JWT_SECRET, {
    expiresIn: '15',
  });

  // Формулюємо шлях до шаблона
  const templatePath = path.resolve('src/templates/reset-password-email.html');
  // Читаємо Шаблон
  const templateSource = await fs.readFile(templatePath, 'utf-8');
  //
  const template = handlebars.compile(templateSource);

  const html = template({
    name: user.username,
    link: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${jwtToken}`,
  });

  try {
    await sendEmail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }

  res.status(200).json({
    message: 'Password reset email sent successfully',
  });
};

//^ resetPassword
export const resetPassword = async (req, res) => {
  const { password, token } = req.body;

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw createHttpError(401, 'Invalid or expired token');
  }

  const user = await User.findById({ _id: payload.sub, email: payload.email });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.updateOne({ _id: user._id }, { password: hashedPassword });
  await Session.deleteMany({ userId: user._id });

  res.status(200).json({
    message: 'Password reset successfully',
  });
};
