# Meaning matching puzzle

The board offers **Puzzle** when the active lesson has two nonempty concept groups,
with no more movable items than interpretation slots. Note cards are excluded.
The modal uses the active synced/library/preview dataset, independently of board
positions and live connections. Closing and reopening keeps the attempt; reset
empties the slots and shuffles both banks. A new lesson starts a new attempt.

Pointer Events support mouse, pen and touch, including edge scrolling during a
drag. Selecting an object and then a slot is the keyboard/tap alternative.
A pool replacement returns the displaced item to the pool; slot-to-slot moves
swap the two items. Returning a card, cancelling a drag, or closing the modal
never deletes board cards or changes board connections.

## Dataset

Each clue retains its existing `id`, `title`, `description`, `type` and `group`.
The first group is the default item bank, and the other is the interpretation
bank. An optional top-level `matchingPuzzle` selects roles and supplies explicit
teacher-authored answers:

```json
{
  "matchingPuzzle": {
    "itemGroup": "Objects",
    "slotGroup": "Meanings",
    "answers": [
      { "itemId": "object-a", "slotId": "meaning-b" }
    ]
  },
  "connections": []
}
```

The key must cover all item IDs, use existing slot IDs, and have no duplicate
items or slots. Invalid/incomplete keys disable correctness grading. A lesson
without a key remains playable; its check reports placement completeness and
asks students to justify their matches. Answers are never inferred from array
order, clue numbers, positions or matching words. Initial slots are always empty
and feedback is shown only after **Check**. Editing a placement clears old feedback.

The answer key is client-side lesson data (like Map-Timeline's correct order),
not confidential storage. Keep it separate from visible board connections.
Sync must regenerate keys against actual exported clue IDs when requested;
never carry a stale key to another lesson. Two groups alone automatically
provide the ungraded mode for other matching slides.

## Images

A card's explicit `imageUrl` has precedence. `src/data/matching-media.json` also
maps exact normalized object titles to six existing illustrations selected from
ChatGPT Library. It records source filenames and Library IDs. These mappings
only choose images; they do not determine correct matches. Assets are checked
in under `public/images/typology/` and use Vite's base path, so images do not
require Library authentication or expiring links during the lesson. Additional
lessons can supply their own image URLs or extend this media manifest.

The six Old Testament pairs in `src/data/clues.json` follow the teacher's
supplied source table. Their shuffled display order does not encode the key.
