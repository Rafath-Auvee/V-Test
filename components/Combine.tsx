"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import {
    createAccount,
    getAllAccounts,
    updateAccount,
    deleteAccount,
} from "@/actions/account_actions"
import { createJournalEntry } from "@/actions/journal_actions"


const ACCOUNT_TYPES = ["Assets", "Liabilities", "Equity", "Revenue", "Expenses"]

interface Account {
    id: string
    name: string
    type: string
}

interface JournalLine {
    id: string
    accountId: string
    debit: number
    credit: number
}

interface AccountingFormProps {
    onAccountSubmit?: (data: { name: string; type: string }) => void
    onJournalSubmit?: (data: { date: Date | undefined; memo: string; lines: JournalLine[] }) => void
}

export default function AccountingForm({ onAccountSubmit, onJournalSubmit }: AccountingFormProps) {
    // Account Form State
    const [accountName, setAccountName] = useState("")
    const [accountType, setAccountType] = useState("")
    const [accountOptions, setAccountOptions] = useState<Account[]>([])

    // Accounts list (starts with some default accounts)
    const [accounts, setAccounts] = useState<Account[]>([
        { id: "1", name: "Cash", type: "Assets" },
        { id: "2", name: "Accounts Receivable", type: "Assets" },
        { id: "3", name: "Accounts Payable", type: "Liabilities" },
        { id: "4", name: "Sales Revenue", type: "Revenue" },
        { id: "5", name: "Office Expenses", type: "Expenses" },
    ])

    useEffect(() => {
        async function fetchAccounts() {
            const data = await getAllAccounts()
            setAccountOptions(data)
        }
        fetchAccounts()
    }, [])

    // Journal Entry Form State
    const [entryDate, setEntryDate] = useState<Date | undefined>(new Date())
    const [memo, setMemo] = useState("")
    const [journalLines, setJournalLines] = useState<JournalLine[]>([
        { id: "1", accountId: "", debit: 0, credit: 0 },
        { id: "2", accountId: "", debit: 0, credit: 0 },
    ])

    // Calculate totals for journal entry
    const totalDebits = journalLines.reduce((sum, line) => sum + (line.debit || 0), 0)
    const totalCredits = journalLines.reduce((sum, line) => sum + (line.credit || 0), 0)
    const isBalanced = totalDebits === totalCredits && totalDebits > 0

    // Account Form Functions
    const handleAccountSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const accountData = { name: accountName, type: accountType }

        try {
            if (editMode) {
                await updateAccount(editMode, accountData)
            } else {
                await fetch("/api/accounts", {
                    method: "POST",
                    body: JSON.stringify(accountData),
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
            }

            const refreshed = await getAllAccounts()
            setAccountOptions(refreshed)
            setAccountName("")
            setAccountType("")
            setEditMode(null)
        } catch {
            alert("Failed to save account")
        }
    }


    // Journal Entry Functions
    const addJournalLine = () => {
        const newLine: JournalLine = {
            id: Date.now().toString(),
            accountId: "",
            debit: 0,
            credit: 0,
        }
        setJournalLines([...journalLines, newLine])
    }

    const removeJournalLine = (id: string) => {
        if (journalLines.length > 2) {
            setJournalLines(journalLines.filter((line) => line.id !== id))
        }
    }

    const updateJournalLine = (id: string, field: keyof JournalLine, value: string | number) => {
        setJournalLines(
            journalLines.map((line) =>
                line.id === id ? { ...line, [field]: field === "accountId" ? value : Number(value) || 0 } : line,
            ),
        )
    }

    const handleJournalSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isBalanced) {
            alert("Debits must equal credits!")
            return
        }

        const validLines = journalLines.filter(
            (line) => line.accountId && (line.debit > 0 || line.credit > 0)
        )

        const journalData = {
            date: entryDate,
            memo,
            lines: validLines,
        }

        try {
            await createJournalEntry(journalData)

            setEntryDate(new Date())
            setMemo("")
            setJournalLines([
                { id: "1", accountId: "", debit: 0, credit: 0 },
                { id: "2", accountId: "", debit: 0, credit: 0 },
            ])
        } catch (error) {
            console.error("Failed to create journal entry:", error)
            alert("Failed to save journal entry")
        }
    }




    const [editMode, setEditMode] = useState<string | null>(null)

    const handleEdit = (account: any) => {
        setEditMode(account.id)
        setAccountName(account.name)
        setAccountType(account.type)
    }




    const handleDelete = async (id: string) => {
        try {
            await deleteAccount(id)
            setAccounts((prev) => prev.filter((acc) => acc.id !== id))
        } catch {
            alert("Failed to delete")
        }
    }

    return (
        <div className="container mx-auto p-6">
            <Card className="w-full max-w-6xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Accounting Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="accounts" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
                            <TabsTrigger value="journal">Journal Entry</TabsTrigger>
                        </TabsList>

                        {/* Chart of Accounts Tab */}
                        <TabsContent value="accounts" className="space-y-6">
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
                        </TabsContent>

                        {/* Journal Entry Tab */}
                        <TabsContent value="journal" className="space-y-6">
                            <form onSubmit={handleJournalSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Date Picker */}
                                    <div className="space-y-2">
                                        <Label htmlFor="entryDate">Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left font-normal" id="entryDate">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {entryDate ? format(entryDate, "PPP") : <span>Select a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar mode="single" selected={entryDate} onSelect={setEntryDate} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* Memo */}
                                    <div className="space-y-2">
                                        <Label htmlFor="memo">Memo (Optional)</Label>
                                        <Textarea
                                            id="memo"
                                            value={memo}
                                            onChange={(e) => setMemo(e.target.value)}
                                            placeholder="Enter memo"
                                            rows={2}
                                        />
                                    </div>
                                </div>

                                {/* Journal Lines */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-lg font-semibold">Journal Lines</Label>
                                        <Button type="button" onClick={addJournalLine} size="sm">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Line
                                        </Button>
                                    </div>

                                    {/* Header */}
                                    <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
                                        <div className="col-span-5">Account</div>
                                        <div className="col-span-3">Debit</div>
                                        <div className="col-span-3">Credit</div>
                                        <div className="col-span-1">Action</div>
                                    </div>

                                    {/* Lines */}
                                    {journalLines.map((line) => (
                                        <div key={line.id} className="grid grid-cols-12 gap-2 items-center">
                                            <div className="col-span-5">
                                                <Select
                                                    value={line.accountId}
                                                    onValueChange={(value) => updateJournalLine(line.id, "accountId", value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select account" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {accounts.map((account) => (
                                                            <SelectItem key={account.id} value={account.id}>
                                                                {account.name} ({account.type})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="col-span-3">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={line.debit || ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value
                                                        const num = Number(value)

                                                        // Allow empty string for typing
                                                        if (value === "") {
                                                            updateJournalLine(line.id, "debit", 0)
                                                            return
                                                        }

                                                        if (!isNaN(num)) {
                                                            updateJournalLine(line.id, "debit", num)
                                                            if (num > 0) updateJournalLine(line.id, "credit", 0)
                                                        }
                                                    }}

                                                    placeholder="0.00"
                                                />
                                            </div>

                                            <div className="col-span-3">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={line.credit || ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value
                                                        const num = Number(value)

                                                        // Allow empty string for typing
                                                        if (value === "") {
                                                            updateJournalLine(line.id, "debit", 0)
                                                            return
                                                        }

                                                        if (!isNaN(num)) {
                                                            updateJournalLine(line.id, "debit", num)
                                                            if (num > 0) updateJournalLine(line.id, "credit", 0)
                                                        }
                                                    }}

                                                    placeholder="0.00"
                                                />
                                            </div>

                                            <div className="col-span-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeJournalLine(line.id)}
                                                    disabled={journalLines.length <= 2}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Totals */}
                                    <div className="border-t pt-4">
                                        <div className="grid grid-cols-12 gap-2 text-sm font-medium">
                                            <div className="col-span-5 text-right">Totals:</div>
                                            <div className="col-span-3 text-center">${totalDebits.toFixed(2)}</div>
                                            <div className="col-span-3 text-center">${totalCredits.toFixed(2)}</div>
                                            <div className="col-span-1"></div>
                                        </div>

                                        {!isBalanced && totalDebits !== totalCredits && (
                                            <div className="text-red-500 text-sm mt-2 text-center">
                                                Entry is not balanced. Difference: ${Math.abs(totalDebits - totalCredits).toFixed(2)}
                                            </div>
                                        )}

                                        {isBalanced && <div className="text-green-500 text-sm mt-2 text-center">Entry is balanced ✓</div>}
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" disabled={!isBalanced}>
                                    Create Journal Entry
                                </Button>

                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
