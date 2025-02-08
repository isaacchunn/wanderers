"use server";

import { revalidatePath } from "next/cache";

export async function saveItinerary(formData: FormData) {
    const locations = JSON.parse(formData.get("locations") as string);

    // Here you would typically save to a database
    console.log("Saving itinerary:", locations);

    revalidatePath("/itinerary");
    return { success: true };
}

export async function saveMessage(formData: FormData) {
    const message = formData.get("message") as string;

    // Here you would typically save to a database
    console.log("Saving message:", message);

    return {
        id: Date.now().toString(),
        content: message,
        sender: "User",
        timestamp: new Date().toISOString(),
    };
}

export async function saveExpense(
    previousState: { success: boolean; message: string },
    formData: FormData
) {
    try {
        const expense = JSON.parse(formData.get("expense") as string);
        // Perform server action (e.g., saving to a database)
        return { success: true, message: "Expense saved successfully" };
    } catch (error) {
        return { success: false, message: "Error saving expense" };
    }
}
