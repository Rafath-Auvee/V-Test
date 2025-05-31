"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AccountInput } from "@/interfaces/interfaces";

export async function createAccount(data: AccountInput) {

  try {
    await prisma.account.create({
      data: {
        name: data.name,
        type: data.type,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    revalidatePath("/accounts");
  } catch (error) {
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
    await prisma.account.delete({
      where: { id },
    });
    revalidatePath("/accounts");
  } catch (error) {
    throw new Error("Failed to delete account");
  }
}
