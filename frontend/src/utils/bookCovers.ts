const PLACEHOLDER_COVERS = [
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1614544048536-0d28caf77f41?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=600",
];

export function getBookCoverUrl(book: {
  title: string;
  image?: string | null;
}) {
  if (book.image) {
    return book.image;
  }

  return PLACEHOLDER_COVERS[
    book.title.charCodeAt(0) % PLACEHOLDER_COVERS.length
  ];
}
