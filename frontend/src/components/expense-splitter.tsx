"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Itinerary, Activity, Expense } from "@/lib/types"
import { getActivity, editActivity } from "@/lib/activityHandler"
import { getUser } from "@/lib/settingsHandler"
import { currencies } from "@/lib/constants/currencies.json"

export function ExpenseSplitter({
    itinerary,
}: {
    readonly itinerary: Readonly<Itinerary>
}) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [paidBy, setPaidBy] = useState("");
    const [splitWith, setSplitWith] = useState<string[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [balances, setBalances] = useState<Record<string, number>>({});
    const [selectedActivityId, setSelectedActivityId] = useState<string>("");
    const [collaborators, setCollaborators] = useState<{ email: string; username: string }[]>([]);

    const getCurrencyCode = (countryCode: string) => {
        const country = currencies.find((c) => c.countryCode === countryCode);
        return country ? country.currencyCode : "SGD"; // Default to SGD, our country code
    };

    const currencyCode = getCurrencyCode(itinerary.location);

    const updateBalances = useCallback(() => {
        const updatedBalances: Record<string, number> = {};

        expenses.forEach((expense) => {
            const splitAmount = calculateSplitAmount(expense);

            updatePaidByBalance(updatedBalances, expense, splitAmount);
            updateSplitWithBalances(updatedBalances, expense, splitAmount);
        });

        setBalances(updatedBalances);
    }, [expenses]);

    const calculateSplitAmount = (expense: Expense) => {
        return expense.amount / (expense.splitWith.length + 1);
    };

    const updatePaidByBalance = (updatedBalances: Record<string, number>, expense: Expense, splitAmount: number) => {
        updatedBalances[expense.paidBy] = (updatedBalances[expense.paidBy] || 0) + expense.amount;
        updatedBalances[expense.paidBy] -= splitAmount;
    };

    const updateSplitWithBalances = (updatedBalances: Record<string, number>, expense: Expense, splitAmount: number) => {
        expense.splitWith.forEach((person) => {
            updatedBalances[person] = (updatedBalances[person] || 0) - splitAmount;
        });
    };

    useEffect(() => {
        if (expenses.length > 0) {
            updateBalances();
        }
    }, [expenses, updateBalances]);

    const updateActivityExpense = async (activityId: string, expenseAmount: number) => {
        try {
            const activityToUpdate = activities.find((activity) => activity.id === Number(activityId));

            if (activityToUpdate) {
                const updatedActivity = {
                    ...activityToUpdate,
                    expense: (activityToUpdate.expense || 0) + expenseAmount,
                };

                await editActivity(updatedActivity);

                setActivities((prevActivities) =>
                    prevActivities.map((activity) =>
                        activity.id === Number(activityId) ? updatedActivity : activity
                    )
                );
            }
        } catch (error) {
            console.error("Error updating activity expense:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!description || !amount || !paidBy || !selectedActivityId) {
            return;
        }

        const newExpense: Expense = {
            id: Date.now().toString(),
            description,
            amount: Number.parseFloat(amount),
            paidBy,
            splitWith,
            activityId: selectedActivityId,
        };

        setExpenses((prevExpenses) => [...prevExpenses, newExpense]);

        await updateActivityExpense(selectedActivityId, Number.parseFloat(amount));

        setDescription("");
        setAmount("");
        setPaidBy("");
        setSplitWith([]);
        setSelectedActivityId("");
    };

    const getActivityTitleById = (id: string) => {
        const activity = activities.find((a) => a.id === Number(id));
        return activity ? activity.title : "";
    };

    useEffect(() => {
        const fetchActivitiesAndCollaborators = async () => {
            try {
                const activityData: Activity[] = (await getActivity(`${itinerary.id}`)) || [];
                const activeData = activityData?.filter((activity) => activity.active) || [];
                activeData.sort((a, b) => a.sequence - b.sequence);
                setActivities(activeData);

                const collaboratorsWithUsernames = await Promise.all(
                    itinerary.collaborators.map(async (collab) => {
                        const userResponse = await getUser(collab.email);

                        if (userResponse.success && userResponse.data) {
                            const { email, username } = userResponse.data;
                            return {
                                email: email || "",
                                username: username || "",
                            };
                        } else {
                            console.error('Error fetching user:');
                            return { email: collab.email, username: 'Unknown' };
                        }
                    })
                );
                setCollaborators(collaboratorsWithUsernames);
            } catch (error) {
                console.error("Error fetching activities or collaborators:", error);
            }
        };

        fetchActivitiesAndCollaborators();
    }, [itinerary.id, itinerary.collaborators]);

    const calculateTotalExpense = () => {
        return expenses.reduce((total, expense) => total + expense.amount, 0);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Expense Splitting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="activity">Expense of an Activity</Label>
                        <div className="relative w-full">
                            <Select value={selectedActivityId} onValueChange={setSelectedActivityId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Which Activity?" />
                                </SelectTrigger>
                                <SelectContent>
                                    {activities.map((activity) => (
                                        <SelectItem key={activity.id} value={activity.title}>
                                            {activity.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            placeholder="Expense description"
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
                                {collaborators.map((collaborator) => (
                                    <SelectItem key={collaborator.email} value={collaborator.username}>
                                        {collaborator.username}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Split With</Label>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={splitWith.length > 0 ? "default" : "outline"}
                                onClick={() => {
                                    const allCollaborators = collaborators.filter(
                                        (collaborator) => collaborator.username !== paidBy
                                    ).map((collaborator) => collaborator.username);

                                    setSplitWith(allCollaborators);
                                }}
                            >
                                Split Cost
                            </Button>
                            <Button
                                type="button"
                                variant={splitWith.length === 0 ? "default" : "outline"}
                                onClick={() => {
                                    setSplitWith([]);
                                }}
                            >
                                Don&apos;t Split
                            </Button>
                        </div>

                        {splitWith.length > 0 && (
                            <div className="mt-2">
                                <span>Splitting with:</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {splitWith.map((username) => (
                                        <div key={username} className="p-2 border rounded-md">
                                            {username}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <Button type="submit">Add Expense</Button>
                </form>

                {expenses.length > 0 && (
                    <div className="mt-6 border-t pt-4">
                        <h3 className="font-semibold mb-2">Recent Expenses</h3>
                        <div className="space-y-3">
                            {expenses.map((expense) => (
                                <div key={expense.id} className="p-3 border rounded-md">
                                    <div className="flex justify-between">
                                        <span className="font-medium">
                                            {expense.activityId ? getActivityTitleById(expense.activityId) : expense.description}
                                        </span>
                                        <span className="font-medium">{currencyCode}${expense.amount.toFixed(2)}</span>
                                    </div>
                                    <div className="text-sm mt-1">
                                        <p className="font-bold">Activity: {expense.description}</p>
                                        {expense.splitWith.length > 0 ? (
                                            <div className="">
                                                <p className="text-muted-foreground italic">
                                                    {expense.paidBy} paid for{" "}
                                                    {[...expense.splitWith, expense.paidBy].map((username) =>
                                                        collaborators.find((collaborator) => collaborator.username === username)?.username
                                                    ).join(", ")}
                                                </p>
                                                <div className="text-red-500 italic">
                                                    {expense.splitWith.map((username) => (
                                                        <div key={username}>
                                                            {username} owes {expense.paidBy}: {currencyCode}${(expense.amount / (expense.splitWith.length + 1)).toFixed(2)}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-green-700 italic">
                                                {expense.paidBy} paid for everyone
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-6 border-t pt-4">
                    <h3 className="font-semibold mb-2">Net Balances (Who Owes Who)</h3>
                    <div className="space-y-2">
                        {Object.entries(balances).map(([person, amount]) => (
                            <div key={person} className="flex justify-between">
                                <span>{person}</span>
                                <span className={amount >= 0 ? "text-green-600" : "text-red-600"}>
                                    {amount >= 0 ? "gets back" : "owes"} {currencyCode}${Math.abs(amount).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4">
                        <h3 className="font-semibold">Total Expense: {currencyCode}${calculateTotalExpense().toFixed(2)}</h3>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
