"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { getAllAccounts } from "@/actions/account_actions"
import { getAllJournalEntries, createJournalEntry } from "@/actions/journal_actions"

interface Account {
  id: string
  name: string
  type: string
}

interface JournalLine {
  id: string
  accountId: string
  debit: string
  credit: string
}

interface JournalEntry {
  id: string
  date: Date
  memo: string
  lines: {
    id: string
    debit: number
    credit: number
    account: Account
  }[]
}


interface JournalEntryFormProps {
  onJournalSubmit?: (data: { date: Date | undefined; memo: string; lines: JournalLine[] }) => void
}

export default function JournalEntryForm({ onJournalSubmit }: JournalEntryFormProps) {
  const [accountOptions, setAccountOptions] = useState<Account[]>([])
  const [entryDate, setEntryDate] = useState<Date | undefined>(new Date())
  const [memo, setMemo] = useState("")
  const [journalLines, setJournalLines] = useState<JournalLine[]>([
    { id: "1", accountId: "", debit: "", credit: "" },
  ])

  const [entries, setEntries] = useState<JournalEntry[]>([])

  function generateId(): string {
    const date = new Date()
    const yyyyMMdd = date.toISOString().slice(0, 10).replace(/-/g, "")
    const randomDigits = Math.floor(1000 + Math.random() * 9000)
    return `${yyyyMMdd}-${randomDigits}`
  }



  useEffect(() => {
    async function fetchEntries() {
      const data = await getAllJournalEntries()
      setEntries(data)
    }
    fetchEntries()
  }, [])


  useEffect(() => {
    async function fetchAccounts() {
      const data = await getAllAccounts()
      setAccountOptions(data)
    }
    fetchAccounts()
  }, [])

  // Calculate totals for journal entry
  const totalDebits = journalLines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0)
  const totalCredits = journalLines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0)

  const validLines = journalLines
    .filter((line) => line.accountId && (parseFloat(line.debit) > 0 || parseFloat(line.credit) > 0))
    .map((line) => ({
      accountId: line.accountId,
      debit: parseFloat(line.debit) || 0,
      credit: parseFloat(line.credit) || 0,
    }))

  const isBalanced = totalDebits === totalCredits && totalDebits > 0

  const addJournalLine = () => {
    const newLine: JournalLine = {
      id: Date.now().toString() + generateId(),
      accountId: "",
      debit: "",
      credit: ""
    }
    setJournalLines([...journalLines, newLine])
  }

  const removeJournalLine = (id: string) => {
    if (journalLines.length > 1) {
      setJournalLines(journalLines.filter((line) => line.id !== id))
    }
  }

  const updateJournalLine = (id: string, field: keyof JournalLine, value: string | number) => {
    setJournalLines((prev) =>
      prev.map((line) =>
        line.id === id ? { ...line, [field]: value } : line
      )
    )
  }

  const handleJournalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isBalanced) {
      alert("Debits must equal credits!")
      return
    }

    const journalData = {
      date: entryDate,
      memo,
      lines: validLines,
    }

    try {
      await createJournalEntry(journalData)
      await fetchEntries()

      // Reset form
      setEntryDate(new Date())
      setMemo("")
      setJournalLines([
        { id: "1", accountId: "", debit: "", credit: "" },
      ])

      // Call the optional callback
      if (onJournalSubmit) {
        onJournalSubmit(journalData)
      }
    } catch (error) {
      console.error("Failed to create journal entry:", error)
      alert("Failed to save journal entry")
    }
  }

  return (
    <div className="space-y-6">
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
                    {accountOptions.map((account) => (
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
                  value={line.debit}
                  onChange={(e) => updateJournalLine(line.id, "debit", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={line.credit}
                  onChange={(e) => updateJournalLine(line.id, "credit", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeJournalLine(line.id)}
                  disabled={journalLines.length <= 1}
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

      {entries.length > 0 && (
        <div className="mt-10 space-y-4">
          <h3 className="text-xl font-semibold">Journal Entries</h3>
          <div className="border rounded-md overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Memo</th>
                  <th className="px-4 py-2 text-left">Lines</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-t">
                    <td className="px-4 py-2">{format(new Date(entry.date), "PPP")}</td>
                    <td className="px-4 py-2">{entry.memo || "-"}</td>
                    <td className="px-4 py-2">
                      <ul className="space-y-1">
                        {entry.lines.map((line) => (
                          <li key={line.id}>
                            {line.account.name} ({line.account.type}): Debit: ${line.debit.toFixed(2)}, Credit: ${line.credit.toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}