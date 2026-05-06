// Discriminated union used by Terms / Privacy / Return Policy / About to
// represent rich legal copy without bringing in a markdown renderer. `h` is
// rendered as a bold section heading, `p` as a body paragraph, and `li` as a
// bulleted list item. Keeping the shape narrow makes it trivial to author
// new content files by hand.
export type LegalBlock =
  | { kind: 'h'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'li'; text: string };
