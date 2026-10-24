import Link from 'next/link';
import { BookCover } from './BookCover';

type BookCardProps = {
  id: string;
  title: string;
  author: string;
  price: number;
  imageUrl?: string | null;
};

export function BookCard({ id, title, author, price, imageUrl }: BookCardProps) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <BookCover title={title} imageUrl={imageUrl} className="mb-4 h-40 rounded-lg" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-slate-600">{author}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-bold text-primary">{price.toLocaleString()}₫</span>
        <Link href={`/books/${id}`} className="rounded bg-slate-900 px-3 py-2 text-sm text-white">
          Details
        </Link>
      </div>
    </div>
  );
}
