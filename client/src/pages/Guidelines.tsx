import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function Guidelines() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">UTM Guidelines</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Rules</CardTitle>
            <CardDescription>Follow these rules for consistent UTM tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc pl-6 space-y-2">
              <li>Always use lowercase letters to maintain consistency</li>
              <li>Avoid using spaces - use hyphens instead</li>
              <li>Keep naming conventions consistent across campaigns</li>
              <li>Use clear and descriptive names that are easy to analyze</li>
              <li>Document your UTM naming conventions for team reference</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parameter Guidelines</CardTitle>
            <CardDescription>Best practices for each UTM parameter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Source (utm_source)</h3>
                <p className="text-sm text-muted-foreground">Identifies the traffic source (e.g., google, newsletter, linkedin)</p>
              </div>
              <div>
                <h3 className="font-semibold">Medium (utm_medium)</h3>
                <p className="text-sm text-muted-foreground">Identifies the marketing medium (e.g., cpc, email, social)</p>
              </div>
              <div>
                <h3 className="font-semibold">Campaign (utm_campaign)</h3>
                <p className="text-sm text-muted-foreground">Identifies the specific campaign name, promotion, or strategic initiative</p>
              </div>
              <div>
                <h3 className="font-semibold">Term (utm_term)</h3>
                <p className="text-sm text-muted-foreground">Optional: Identifies paid search keywords</p>
              </div>
              <div>
                <h3 className="font-semibold">Content (utm_content)</h3>
                <p className="text-sm text-muted-foreground">Optional: Differentiates similar content or links within the same ad</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}