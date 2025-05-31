
"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AccountForm from "@/components/AccountForm"
import JournalEntryForm from "@/components/JournalEntryForm"


interface JournalLine {
  id: string
  accountId: string
  debit: string
  credit: string
}

interface AccountingFormProps {
  onAccountSubmit?: (data: { name: string; type: string }) => void
  onJournalSubmit?: (data: { date: Date | undefined; memo: string; lines: JournalLine[] }) => void
}

export default function Home({ onAccountSubmit, onJournalSubmit }: AccountingFormProps) {
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
            <TabsContent value="accounts">
              <AccountForm onAccountSubmit={onAccountSubmit} />
            </TabsContent>

            {/* Journal Entry Tab */}
            <TabsContent value="journal">
              <JournalEntryForm onJournalSubmit={onJournalSubmit} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}