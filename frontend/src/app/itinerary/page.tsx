import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Plus } from "lucide-react"

export default function ItineraryPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="container px-4 py-12 md:py-24 lg:py-32">
        <div className="mx-auto max-w-[980px] text-center">
          <div className="mb-4 inline-block rounded-lg bg-muted px-3 py-1 text-sm">✨ Smart Trip Planning</div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Plan your perfect{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">itinerary</span>
          </h1>
          <p className="mb-8 text-xl text-muted-foreground sm:text-2xl">
            Organize your travel schedule with intelligent suggestions and real-time collaboration.
          </p>
          <Button size="lg" className="text-base">
            Create New Itinerary
            <Plus className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Features Demo Section */}
      <section className="container px-4 py-12 md:py-24 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Timeline Preview */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Interactive Timeline</h2>
              <p className="text-lg text-muted-foreground">
                Visualize your entire trip with our intuitive timeline view. Easily manage activities, events, and
                travel arrangements.
              </p>
            </div>
            <div className="space-y-4 rounded-lg border p-6">
              {[1, 2, 3].map((day) => (
                <div key={day} className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Day {day}</h3>
                  </div>
                  <div className="ml-7 space-y-4">
                    <div className="rounded-lg border bg-background p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">Morning City Tour</h4>
                          <div className="mt-1 flex items-center space-x-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>09:00 AM - 12:00 PM</span>
                          </div>
                          <div className="mt-1 flex items-center space-x-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>City Center</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Features */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Smart Scheduling</h2>
              <p className="text-lg text-muted-foreground">
                Let our AI help you optimize your schedule based on location, opening hours, and travel time.
              </p>
            </div>
            <div className="grid gap-6">
              {[
                {
                  title: "AI-Powered Suggestions",
                  description: "Get intelligent recommendations based on your preferences and travel style.",
                },
                {
                  title: "Real-time Updates",
                  description: "Stay synchronized with your travel companions as plans evolve.",
                },
                {
                  title: "Location-aware Planning",
                  description: "Optimize your route with smart location-based scheduling.",
                },
              ].map((feature) => (
                <div key={feature.title} className="rounded-lg border p-6">
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
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
              Ready to streamline your travel planning?
            </h2>
            <p className="mb-8 text-xl text-muted-foreground">
              Join thousands of travelers who are already using our smart itinerary planner.
            </p>
            <Button size="lg" className="text-base">
              Start Planning Now
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-2 h-4 w-4"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

