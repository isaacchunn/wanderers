"use client";

import { useState, useActionState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { saveExpense } from "../../app/itinerary/actions";

interface Expense {
    id: string;
    description: string;
    amount: number;
    paidBy: string;
    splitWith: string[];
}

const MEMBERS = ["Alice", "Bob", "Charlie", "David"];
const initialState = { success: false, message: "" };

export function ExpenseSplitter() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [paidBy, setPaidBy] = useState("");
    const [splitWith, setSplitWith] = useState<string[]>([]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [state, formAction, isPending] = useActionState(
        saveExpense,
        initialState
    );

    const calculateBalances = () => {
        const balances: Record<string, number> = {};

        expenses.forEach((expense) => {
            const splitAmount = expense.amount / (expense.splitWith.length + 1);

            // Add the full amount to the payer
            balances[expense.paidBy] =
                (balances[expense.paidBy] || 0) + expense.amount;

            // Subtract the split amount from each person
            expense.splitWith.forEach((person) => {
                balances[person] = (balances[person] || 0) - splitAmount;
            });
            balances[expense.paidBy] -= splitAmount; // Don't forget to subtract from the payer too
        });

        return balances;
    };

    const balances = calculateBalances();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Expense Splitting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <form
                    action={(formData) => {
                        const newExpense = {
                            id: Date.now().toString(),
                            description,
                            amount: Number.parseFloat(amount),
                            paidBy,
                            splitWith,
                        };

                        formData.append("expense", JSON.stringify(newExpense));

                        if (state.success) {
                            setExpenses([...expenses, newExpense]);
                            setDescription("");
                            setAmount("");
                            setPaidBy("");
                            setSplitWith([]);
                        }
                    }}
                    className="space-y-4"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            placeholder="Dinner, tickets, etc."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="paidBy">Paid By</Label>
                        <Select value={paidBy} onValueChange={setPaidBy}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select person" />
                            </SelectTrigger>
                            <SelectContent>
                                {MEMBERS.map((member) => (
                                    <SelectItem key={member} value={member}>
                                        {member}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Split With</Label>
                        <div className="flex flex-wrap gap-2">
                            {MEMBERS.filter((member) => member !== paidBy).map(
                                (member) => (
                                    <Button
                                        key={member}
                                        type="button"
                                        variant={
                                            splitWith.includes(member)
                                                ? "default"
                                                : "outline"
                                        }
                                        onClick={() => {
                                            setSplitWith((prev) =>
                                                prev.includes(member)
                                                    ? prev.filter(
                                                          (m) => m !== member
                                                      )
                                                    : [...prev, member]
                                            );
                                        }}
                                    >
                                        {member}
                                    </Button>
                                )
                            )}
                        </div>
                    </div>
                    <Button type="submit">Add Expense</Button>
                </form>

                <div className="mt-6">
                    <h3 className="font-semibold mb-2">Balances</h3>
                    <div className="space-y-2">
                        {Object.entries(balances).map(([person, amount]) => (
                            <div key={person} className="flex justify-between">
                                <span>{person}</span>
                                <span
                                    className={
                                        amount >= 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }
                                >
                                    {amount >= 0 ? "gets back" : "owes"} $
                                    {Math.abs(amount).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
