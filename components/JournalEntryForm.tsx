"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

// Sample accounts for the dropdown
const ACCOUNTS = [
  { id: "1", name: "Cash", type: "Asset" },
  { id: "2", name: "Accounts Receivable", type: "Asset" },
  { id: "3", name: "Inventory", type: "Asset" },
  { id: "4", name: "Accounts Payable", type: "Liability" },
  { id: "5", name: "Sales Revenue", type: "Revenue" },
  { id: "6", name: "Rent Expense", type: "Expense" },
  { id: "7", name: "Utilities Expense", type: "Expense" },
  { id: "8", name: "Salaries Expense", type: "Expense" },
]

interface JournalLine {
  id: string
  accountId: string
  debit: number
  credit: number
}

export default function JournalEntryForm() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [description, setDescription] = useState("")
  const [lines, setLines] = useState<JournalLine[]>([
    { id: "1", accountId: "", debit: 0, credit: 0 },
    { id: "2", accountId: "", debit: 0, credit: 0 },
  ])

  // Calculate totals
  const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0)
  const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0)
  const isBalanced = totalDebit === totalCredit && totalDebit > 0

  const addLine = () => {
    setLines([...lines, { id: Date.now().toString(), accountId: "", debit: 0, credit: 0 }])
  }

  const removeLine = (id: string) => {
    if (lines.length > 2) {
      setLines(lines.filter((line) => line.id !== id))
    }
  }

  const updateLine = (id: string, field: keyof JournalLine, value: any) => {
    setLines(
      lines.map((line) =>
        line.id === id ? { ...line, [field]: field === "accountId" ? value : Number(value) || 0 } : line,
      ),
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isBalanced) {
      alert("Journal entry must be balanced (debits must equal credits)")
      return
    }

    const journalEntry = {
      date,
      description,
      lines: lines.filter((line) => line.accountId && (line.debit > 0 || line.credit > 0)),
    }

    console.log("Journal Entry Submitted:", journalEntry)
    // Here you would typically send this data to your API
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">New Journal Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Picker */}
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal" id="date">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Select a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                />
              </div>
            </div>

            {/* Journal Lines */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Journal Lines</h3>
                <Button type="button" onClick={addLine} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Line
                </Button>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 py-2 border-b text-sm font-medium text-muted-foreground">
                <div className="col-span-6">Account</div>
                <div className="col-span-2 text-right">Debit</div>
                <div className="col-span-2 text-right">Credit</div>
                <div className="col-span-2"></div>
              </div>

              {/* Journal Lines */}
              <div className="space-y-3">
                {lines.map((line) => (
                  <div key={line.id} className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-6">
                      <Select value={line.accountId} onValueChange={(value) => updateLine(line.id, "accountId", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {ACCOUNTS.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name} ({account.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.debit || ""}
                        onChange={(e) => {
                          updateLine(line.id, "debit", e.target.value)
                          if (Number.parseFloat(e.target.value) > 0) {
                            updateLine(line.id, "credit", 0)
                          }
                        }}
                        placeholder="0.00"
                        className="text-right"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.credit || ""}
                        onChange={(e) => {
                          updateLine(line.id, "credit", e.target.value)
                          if (Number.parseFloat(e.target.value) > 0) {
                            updateLine(line.id, "debit", 0)
                          }
                        }}
                        placeholder="0.00"
                        className="text-right"
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLine(line.id)}
                        disabled={lines.length <= 2}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="grid grid-cols-12 gap-4 pt-4 border-t">
                <div className="col-span-6 text-right font-medium">Totals:</div>
                <div className="col-span-2 text-right font-medium">${totalDebit.toFixed(2)}</div>
                <div className="col-span-2 text-right font-medium">${totalCredit.toFixed(2)}</div>
                <div className="col-span-2"></div>
              </div>

              {/* Balance Status */}
              <div className="text-center">
                {totalDebit !== totalCredit ? (
                  <p className="text-red-500 text-sm">
                    Out of balance: ${Math.abs(totalDebit - totalCredit).toFixed(2)}
                  </p>
                ) : totalDebit > 0 ? (
                  <p className="text-green-600 text-sm">Entry balanced</p>
                ) : null}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={!isBalanced}>
                Save Journal Entry
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
