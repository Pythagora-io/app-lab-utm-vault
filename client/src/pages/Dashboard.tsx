import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link as LinkIcon, Rocket, Users, Clock } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { getDashboardStats } from "@/api/utm"
import { useToast } from "@/hooks/useToast"
import { getOrganization } from "@/api/organization"

export function Dashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [organization, setOrganization] = useState<{ name: string } | null>(null)
  const [stats, setStats] = useState({
    totalLinks: 0,
    activeCampaigns: 0,
    teamMembers: 0,
    linksLast28Days: 0,
    linksThisWeek: 0,
    campaignsThisMonth: 0,
    linksThisMonth: 0,
    periodChange: 0
  })

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const [statsResponse, orgResponse] = await Promise.all([
          getDashboardStats(),
          getOrganization()
        ])
        if (mounted) {
          setStats(statsResponse)
          setOrganization(orgResponse)
        }
      } catch (error) {
        if (mounted) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          })
        }
      }
    }

    setOrganization(null);

    if (user) {
      fetchData()
    }

    return () => {
      mounted = false;
    }
  }, [toast, user])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            Organization: {organization?.name || 'N/A'}
          </Badge>
          <Badge variant="outline" className="text-sm">
            Role: {user?.role || 'N/A'}
          </Badge>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Links</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLinks}</div>
            <p className="text-xs text-muted-foreground">+{stats.linksThisWeek} links this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">+{stats.campaignsThisMonth} campaigns this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
            <p className="text-xs text-muted-foreground">Active contributors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Links Created (Last 28 Days)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.linksLast28Days}</div>
            <p className="text-xs text-muted-foreground">+{stats.linksThisMonth} this month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}