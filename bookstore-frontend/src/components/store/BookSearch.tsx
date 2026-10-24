'use client';

import { FormEvent, KeyboardEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import api from '@/lib/axios';
import { BookType } from '@/types';

export default function BookSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [books, setBooks] = useState<BookType[]>([]);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const suggestions = books.slice(0, 5);

  useEffect(() => {
    if (!normalizedQuery) {
      setBooks([]);
      return;
    }

    let active = true;
    const timeout = window.setTimeout(() => {
      api.get('/books', { params: { search: normalizedQuery } })
        .then((response) => {
          if (active) setBooks(response.data.data);
        })
        .catch(() => {
          if (active) setBooks([]);
        });
    }, 200);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [normalizedQuery]);

  const navigateToBook = (bookId: string) => {
    setIsOpen(false);
    router.push(`/books/${bookId}`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!normalizedQuery) return;
    setIsOpen(false);
    router.push(`/books?search=${encodeURIComponent(query.trim())}`);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && suggestions.length > 0) {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp' && suggestions.length > 0) {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === 'Enter' && activeIndex >= 0 && suggestions[activeIndex]) {
      event.preventDefault();
      navigateToBook(suggestions[activeIndex].id);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex h-10 w-full items-center border border-slate-200 bg-white focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100">
        <input
          type="search"
          role="combobox"
          aria-label="Search books by title or author"
          aria-autocomplete="list"
          aria-expanded={isOpen && Boolean(normalizedQuery)}
          aria-controls="book-search-suggestions"
          aria-activedescendant={activeIndex >= 0 ? `book-suggestion-${suggestions[activeIndex]?.id}` : undefined}
          autoComplete="off"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(-1);
            setIsOpen(Boolean(event.target.value.trim()));
          }}
          onFocus={() => setIsOpen(Boolean(normalizedQuery))}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
          onKeyDown={handleKeyDown}
          placeholder="Search books..."
          className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
        <button type="submit" aria-label="Search books" className="flex h-full w-11 shrink-0 items-center justify-center bg-rose-500 text-white transition hover:bg-rose-600">
          <Search size={18} />
        </button>
      </form>

      {isOpen && normalizedQuery && (
        <div id="book-search-suggestions" role="listbox" aria-label="Book suggestions" className="absolute left-0 right-0 top-full z-[70] mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          {suggestions.length > 0 ? suggestions.map((book, index) => (
            <Link
              id={`book-suggestion-${book.id}`}
              key={book.id}
              href={`/books/${book.id}`}
              role="option"
              aria-selected={activeIndex === index}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => setIsOpen(false)}
              className={`flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-0 hover:bg-rose-50 ${activeIndex === index ? 'bg-rose-50' : ''}`}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-900">{book.title}</span>
                <span className="mt-0.5 block truncate text-xs text-slate-500">{book.author}</span>
              </span>
              <span className="shrink-0 text-xs font-semibold text-slate-600">{book.price.toLocaleString()}₫</span>
            </Link>
          )) : (
            <p className="px-4 py-3 text-sm text-slate-500">Không tìm thấy sách phù hợp.</p>
          )}
        </div>
      )}
    </div>
  );
}