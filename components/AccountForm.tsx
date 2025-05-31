"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"

const ACCOUNT_TYPES = ["Assets", "Liabilities", "Equity", "Revenue", "Expenses"]

interface AccountFormProps {
    onSubmit?: (data: { name: string; type: string }) => void
}

export default function AccountForm({ onSubmit }: AccountFormProps) {
    const [accountName, setAccountName] = useState("")
    const [accountType, setAccountType] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const accountData = { name: accountName, type: accountType }

        if (onSubmit) {
            onSubmit(accountData)
        } else {
            console.log("Account submitted:", accountData)
        }

        // Reset form
        setAccountName("")
        setAccountType("")
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
                        Create Account
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
