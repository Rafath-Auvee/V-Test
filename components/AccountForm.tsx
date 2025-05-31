"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    createAccount,
    getAllAccounts,
    updateAccount,
    deleteAccount,
} from "@/actions/account_actions"

const ACCOUNT_TYPES = ["Assets", "Liabilities", "Equity", "Revenue", "Expenses"]

interface AccountFormProps {
    onSubmit?: (data: { name: string; type: string }) => void
}

export default function AccountForm() {
    const [accountName, setAccountName] = useState("")
    const [accountType, setAccountType] = useState("")

    const [accounts, setAccounts] = useState<AccountFormProps[]>([])
    const [editMode, setEditMode] = useState<string | null>(null)

    useEffect(() => {
        async function fetchAccounts() {
            const data = await getAllAccounts()
            setAccounts(data)
        }
        fetchAccounts()
    }, [])


    const handleEdit = (account: any) => {
        setEditMode(account.id)
        setAccountName(account.name)
        setAccountType(account.type)
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editMode) return

        try {
            await updateAccount(editMode, { name: accountName, type: accountType })
            setEditMode(null)
            setAccountName("")
            setAccountType("")
            const updated = await getAllAccounts()
            setAccounts(updated)
        } catch {
            alert("Failed to update account")
        }
    }



    const handleDelete = async (id: string) => {
        try {
            await deleteAccount(id)
            setAccounts((prev) => prev.filter((acc) => acc.id !== id))
        } catch {
            alert("Failed to delete")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const accountData = { name: accountName, type: accountType }

        try {
            const res = await fetch("/api/accounts", {
                method: "POST",
                body: JSON.stringify(accountData),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const result = await res.json();
            console.log("API response:", result);

            if (!res.ok) throw new Error(result.error || "Failed");

            setAccountName("")
            setAccountType("")
        } catch (error) {
            console.error("Submit error:", error);
            alert("Failed to create account")
        }
    }




    return (
        <Card>
            <CardHeader>
                <CardTitle>Chart of Accounts</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="accountName">Account Name</Label>
                        <Input
                            id="accountName"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            placeholder="Enter account name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="accountType">Account Type</Label>
                        <Select value={accountType} onValueChange={setAccountType} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                            <SelectContent>
                                {ACCOUNT_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button type="submit" className="w-full">
                        {editMode ? "Update Account" : "Create Account"}
                    </Button>
                </form>


                <div className="space-y-2 mt-6">
                    {accounts.map((account) => (
                        <div key={account.id} className="flex justify-between items-center border p-2 rounded">
                            <div>
                                <div className="font-medium">{account.name}</div>
                                <div className="text-sm text-muted-foreground">{account.type}</div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleEdit(account)}>Edit</Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDelete(account.id)}>Delete</Button>
                            </div>
                        </div>
                    ))}
                </div>

            </CardContent>
        </Card>
    )
}
