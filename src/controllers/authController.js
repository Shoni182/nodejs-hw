import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import bcrypt from 'bcrypt';
import { createSession, setSessionCookies } from '../services/auth.js';
import { Session } from '../models/session.js';

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
