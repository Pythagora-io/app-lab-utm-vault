import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Download } from "lucide-react"
import { DataTable } from "@/components/DataTable"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CreateLinkForm } from "@/components/CreateLinkForm"
import { useToast } from "@/hooks/useToast"
import { getUtmLinks, exportUtmLinks } from "@/api/utm"
import { UtmLink } from "@/types/utm"
import { useAuth } from "@/contexts/AuthContext"

export function Links() {
  console.log('Links page rendered');

  const [links, setLinks] = useState<UtmLink[]>([])
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv')
  const { toast } = useToast()
  const { user } = useAuth()

  const canCreateOrDelete = user?.role === 'Admin' || user?.role === 'Editor'

  const fetchLinks = async () => {
    try {
      const response = await getUtmLinks()
      setLinks(response.links)
      console.log('Links state updated:', response.links);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch UTM links",
      })
    }
  }

  const handleExport = async () => {
    try {
      await exportUtmLinks(exportFormat);
      toast({
        title: "Success",
        description: "UTM links exported successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to export UTM links",
      });
    }
  };

  useEffect(() => {
    fetchLinks()
  }, [])

  console.log('Links page JSX:', {
    linksLength: links?.length,
    componentsRendered: {
      createLinkDialog: true,
      exportButton: true,
      dataTable: true
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">UTM Links</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Select value={exportFormat} onValueChange={(value: 'csv' | 'excel') => setExportFormat(value)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          {canCreateOrDelete && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Link
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create UTM Link</DialogTitle>
                </DialogHeader>
                <CreateLinkForm onSuccess={fetchLinks} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      <DataTable data={links} onDelete={fetchLinks} canDelete={canCreateOrDelete} />
    </div>
  )
}