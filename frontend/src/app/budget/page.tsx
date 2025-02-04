import { Button } from "@/components/ui/button"
import { DollarSign, PieChart, Users, Receipt, CreditCard, ArrowRight } from "lucide-react"

export default function BudgetPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="container px-4 py-12 md:py-24 lg:py-32">
        <div className="mx-auto max-w-[980px] text-center">
          <div className="mb-4 inline-block rounded-lg bg-muted px-3 py-1 text-sm">✨ Expense Management</div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Split expenses{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              hassle-free
            </span>
          </h1>
          <p className="mb-8 text-xl text-muted-foreground sm:text-2xl">
            Track, split, and settle travel expenses with your group automatically.
          </p>
          <Button size="lg" className="text-base">
            Start Tracking Expenses
            <DollarSign className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Budget Management Preview */}
      <section className="container px-4 py-12 md:py-24 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Expense Dashboard Preview */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Smart Expense Tracking</h2>
              <p className="text-lg text-muted-foreground">
                Keep track of all expenses and split them automatically among group members.
              </p>
            </div>
            <div className="rounded-lg border bg-background p-6">
              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Budget</h3>
                  <p className="mt-2 text-2xl font-bold">$1,200.00</p>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div className="h-2 w-3/4 rounded-full bg-primary" />
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Per Person</h3>
                  <p className="mt-2 text-2xl font-bold">$300.00</p>
                  <p className="mt-2 text-sm text-muted-foreground">Split between 4 people</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { title: "Hotel Booking", amount: 600, paidBy: "Alice" },
                  { title: "Train Tickets", amount: 200, paidBy: "Bob" },
                  { title: "Restaurant", amount: 400, paidBy: "Charlie" },
                ].map((expense) => (
                  <div key={expense.title} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">{expense.title}</p>
                      <p className="text-sm text-muted-foreground">Paid by {expense.paidBy}</p>
                    </div>
                    <p className="font-bold">${expense.amount}.00</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Powerful Budget Tools</h2>
              <p className="text-lg text-muted-foreground">Everything you need to manage group expenses efficiently.</p>
            </div>
            <div className="grid gap-6">
              {[
                {
                  icon: Receipt,
                  title: "Expense Tracking",
                  description: "Log expenses instantly and categorize them automatically.",
                },
                {
                  icon: Users,
                  title: "Fair Split",
                  description: "Split bills equally or customize the split based on preferences.",
                },
                {
                  icon: CreditCard,
                  title: "Settlement",
                  description: "Settle debts easily with integrated payment options.",
                },
                {
                  icon: PieChart,
                  title: "Budget Analytics",
                  description: "Visual insights into your group's spending patterns.",
                },
              ].map((feature) => (
                <div key={feature.title} className="flex items-start space-x-4 rounded-lg border p-6">
                  <feature.icon className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="mb-2 font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/50 py-12 md:py-24 lg:py-32">
        <div className="container px-4">
          <div className="mx-auto max-w-[800px] text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              No more awkward money talks
            </h2>
            <p className="mb-8 text-xl text-muted-foreground">
              Keep track of expenses and split them fairly with your travel companions.
            </p>
            <Button size="lg" className="text-base">
              Start Managing Expenses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

