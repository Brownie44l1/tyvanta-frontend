// Shared helpers used by Dashboard, Catalog, and MyLearning.
// Centralised here so the arrays stay in sync across pages.

export const IMAGES = [
  "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80",
  "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&q=80",
];

export const INSTRUCTORS = [
  "Dr. Amaka Nwosu",
  "Sara Okonkwo",
  "Dr. Olumide Adeyemi",
];

/** Returns a deterministic thumbnail URL for a given course id. */
export const getImage = (id) => IMAGES[(id - 1) % IMAGES.length];

/** Returns a deterministic instructor name for a given course id. */
export const getInstructor = (id) => INSTRUCTORS[(id - 1) % INSTRUCTORS.length];
