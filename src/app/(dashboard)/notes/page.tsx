import { requirePageUser } from '@/core/server/page';
import { listNotes } from '@/modules/notes/notes.service';
import { NotesView } from '@/modules/notes/components/NotesView';

export default async function NotesPage() {
  const currentUser = await requirePageUser();
  const notes = await listNotes(currentUser);

  return <NotesView initialNotes={notes} userId={currentUser.sub} />;
}
