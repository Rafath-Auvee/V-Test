"use server";

import { JournalEntryInput } from "@/interfaces/interfaces";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createJournalEntry(data: JournalEntryInput) {
  if (!data.date || !Array.isArray(data.lines) || data.lines.length < 1) {
    throw new Error("Invalid journal entry data");
  }

  const totalDebit = data.lines.reduce(
    (sum, line) => sum + Number(line.debit),
    0
  );
  const totalCredit = data.lines.reduce(
    (sum, line) => sum + Number(line.credit),
    0
  );

  if (totalDebit !== totalCredit) {
    throw new Error("Total debit must equal total credit");
  }

  for (const line of data.lines) {
    if (!line.accountId || Number(line.debit) < 0 || Number(line.credit) < 0) {
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
            debit: Number(line.debit),
            credit: Number(line.credit),
          })),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    revalidatePath("/journal");
  } catch (error) {
    console.error("Journal Entry Creation Error:", error);
    throw new Error("Failed to create journal entry");
  }
}


export async function getAllJournalEntries() {
  return await prisma.journalEntry.findMany({
    include: {
      lines: {
        include: {
          account: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });
}