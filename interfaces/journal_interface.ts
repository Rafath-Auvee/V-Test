export interface JournalLineInput {
  accountId: string;
  debit: number;
  credit: number;
}

export interface JournalEntryInput {
  date: string;
  memo?: string;
  lines: JournalLineInput[];
}
