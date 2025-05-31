"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AccountInput } from "@/interfaces/interfaces"; // or define directly

export async function createAccount(data: AccountInput) {
  try {
    console.log("Creating Account");
    await prisma.account.create({
      data: {
        name: data.name,
        type: data.type,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log("Creating Account Done");
    revalidatePath("/accounts");
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create account");
  }
}

export async function getAllAccounts() {
  try {
    return await prisma.account.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    return [];
  }
}

export async function getAccountById(id: string) {
  try {
    return await prisma.account.findUnique({
      where: { id },
    });
  } catch (error) {
    return null;
  }
}

export async function updateAccount(id: string, data: AccountInput) {
  try {
    await prisma.account.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        updatedAt: new Date(),
      },
    });
    revalidatePath("/accounts");
  } catch (error) {
    throw new Error("Failed to update account");
  }
}

export async function deleteAccount(id: string) {
  try {
    // Check if account exists
    const existing = await prisma.account.findUnique({ where: { id } });

    if (!existing) {
      throw new Error(`Account with ID ${id} does not exist`);
    }

    // Delete related journal entry lines first
    await prisma.journalEntryLine.deleteMany({
      where: { accountId: id },
    });

    // Now delete the account
    await prisma.account.delete({
      where: { id },
    });

    revalidatePath("/accounts");
  } catch (error) {
    console.error("Delete Account Error:", error);
    throw new Error("Failed to delete account");
  }
}
