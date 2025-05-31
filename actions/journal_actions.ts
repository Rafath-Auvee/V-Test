"use server";

import { JournalEntryInput } from "@/interfaces/interfaces";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";


export async function createJournalEntry(data: JournalEntryInput) {
  if (!data.date || !Array.isArray(data.lines) || data.lines.length < 2) {
    throw new Error("Invalid journal entry data");
  }

  const totalDebit = data.lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = data.lines.reduce((sum, line) => sum + line.credit, 0);

  if (totalDebit !== totalCredit) {
    throw new Error("Total debit must equal total credit");
  }

  for (const line of data.lines) {
    if (!line.accountId || line.debit < 0 || line.credit < 0) {
      throw new Error("Invalid journal entry line data");
    }
  }

  try {
    await prisma.journalEntry.create({
      data: {
        date: new Date(data.date),
        memo: data.memo,
        lines: {
          create: data.lines.map((line) => ({
            account: { connect: { id: line.accountId } },
            debit: line.debit,
            credit: line.credit,
          })),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    revalidatePath("/journal");
  } catch {
    throw new Error("Failed to create journal entry");
  }
}
