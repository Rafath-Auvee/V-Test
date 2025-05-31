"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    getAllAccounts,
    updateAccount,
    deleteAccount,
} from "@/actions/account_actions"

const ACCOUNT_TYPES = ["Assets", "Liabilities", "Equity", "Revenue", "Expenses"]

interface Account {
    id: string
    name: string
    type: string
}

interface AccountFormProps {
    onAccountSubmit?: (data: { name: string; type: string }) => void
}

export default function AccountForm({ onAccountSubmit }: AccountFormProps) {
    const [accountName, setAccountName] = useState("")
    const [accountType, setAccountType] = useState("")
    const [accountOptions, setAccountOptions] = useState<Account[]>([])
    const [editMode, setEditMode] = useState<string | null>(null)

    useEffect(() => {
        async function fetchAccounts() {
            const data = await getAllAccounts()
            setAccountOptions(data)
        }
        fetchAccounts()
    }, [])

    function generateId(): string {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, "")
        const random = Math.floor(1000 + Math.random() * 9000)
        return `${date}-${random}`
    }

    const handleAccountSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const accountData = { name: accountName, type: accountType }

        try {
            if (editMode) {
                await updateAccount(editMode, accountData)
                setAccountOptions((prev) =>
                    prev.map((acc) =>
                        acc.id === editMode ? { ...acc, ...accountData } : acc
                    )
                )
            } else {
                const newAccount = { id: generateId(), ...accountData }

                await fetch("/api/accounts", {
                    method: "POST",
                    body: JSON.stringify(newAccount),
                    headers: {
                        "Content-Type": "application/json",
                    },
                })

                setAccountOptions((prev) => [...prev, newAccount])
            }
        } catch {
            alert("Failed to save account")
        }
    }

    const handleEdit = (account: Account) => {
        setEditMode(account.id)
        setAccountName(account.name)
        setAccountType(account.type)
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteAccount(id)
            setAccountOptions((prev) => prev.filter((acc) => acc.id !== id))
        } catch {
            alert("Failed to delete")
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Account Form */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Add New Account</h3>
                    <form onSubmit={handleAccountSubmit} className="space-y-4">
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
                </div>

                {/* Accounts List */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Existing Accounts</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {accountOptions.map((account) => (
                            <div key={account.id} className="flex justify-between items-center p-3 border rounded-lg">
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
                </div>
            </div>
        </div>
    )
}