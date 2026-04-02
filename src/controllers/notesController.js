import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

//^ GET Notes
export const getAllNotes = async (req, res) => {
  const { page = 1, perPage = 10, search, tag } = req.query;

  const skip = (page - 1) * perPage;
  const notesQuery = Note.find();

  // Filer
  if (tag) {
    notesQuery.where('tag').equals(tag);
  }

  if (search) {
    notesQuery.where({ $text: { $search: search } });
  }

  // Виконуємо одразу два запити паралельно
  const [totalNotes, notes] = await Promise.all([
    notesQuery.clone().countDocuments(),
    notesQuery.skip(skip).limit(perPage),
  ]);

  // Обчислюжмо загальну кількість "сторінок"
  const totalPages = Math.ceil(totalNotes / perPage);
  res.status(200).json({ page, perPage, totalNotes, totalPages, notes });
};

//^ GET Note:id
export const getNoteById = async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findById(noteId);

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }
  res.status(200).json(note);
};

//^ POST note
export const createNote = async (req, res) => {
  const note = await Note.create(req.body);
  res.status(201).json(note);
};

//^ DELETE
export const deleteNote = async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findOneAndDelete({
    _id: noteId,
  });

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json(note);
};

//^ PATCH
export const updateNote = async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findByIdAndUpdate(noteId, req.body, {
    returnDocument: 'after',
  });

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json(note);
};
