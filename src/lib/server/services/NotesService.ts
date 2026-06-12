import { NotesRepository } from '../repositories/NotesRepository';
import type { Note } from '../models/Note';

export class NotesService {
  private repository: NotesRepository;

  constructor() {
    this.repository = new NotesRepository();
  }

  async getUserNotes(userId: string | null) {
    if (!userId) return [];
    return await this.repository.findByUserId(userId);
  }

  async saveNote(data: Partial<Note>) {
    if (!data.user_id) throw new Error("user_id is required");
    if (!data.id || typeof data.title !== 'string' || typeof data.content !== 'string' || !data.date) {
      throw new Error("Invalid note data");
    }

    const note: Note = {
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      content: data.content,
      date: data.date
    };

    await this.repository.upsert(note);
  }

  async deleteNote(id: string | undefined, userId: string | undefined) {
    if (!userId) throw new Error("user_id is required");
    if (!id) throw new Error("id is required");
    await this.repository.delete(id, userId);
  }
}
