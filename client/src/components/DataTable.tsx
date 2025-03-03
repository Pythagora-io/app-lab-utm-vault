import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { UtmLink } from "@/types/utm"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal, Trash2, Copy, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useMemo } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteUtmLink } from "@/api/utm"
import { useToast } from "@/hooks/useToast"

interface DataTableProps {
  data: UtmLink[];
  onDelete: () => void;
  canDelete: boolean;
}

export function DataTable({ data, onDelete, canDelete }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterMedium, setFilterMedium] = useState("all")
  const [filterSource, setFilterSource] = useState("all")
  const [filterCampaign, setFilterCampaign] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const { toast } = useToast()

  console.log('DataTable props:', { data, onDelete, canDelete });

  // Get unique values for filter dropdowns
  const mediums = useMemo(() => [...new Set(data.map(link => link.medium))], [data])
  const sources = useMemo(() => [...new Set(data.map(link => link.source))], [data])
  const campaigns = useMemo(() => [...new Set(data.map(link => link.campaign))], [data])

  // Filter and search data
  const filteredData = useMemo(() => {
    return data.filter(link => {
      const matchesSearch = searchTerm === "" ||
        Object.values(link).some(value =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      const matchesMedium = filterMedium === "all" || link.medium === filterMedium
      const matchesSource = filterSource === "all" || link.source === filterSource
      const matchesCampaign = filterCampaign === "all" || link.campaign === filterCampaign
      return matchesSearch && matchesMedium && matchesSource && matchesCampaign
    })
  }, [data, searchTerm, filterMedium, filterSource, filterCampaign])

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handleDelete = async () => {
    if (!linkToDelete) return;

    try {
      await deleteUtmLink(linkToDelete);
      toast({
        title: "Success",
        description: "UTM link deleted successfully",
      });
      onDelete();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete UTM link",
      });
    } finally {
      setLinkToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const copyToClipboard = (link: UtmLink) => {
    const utmParams = new URLSearchParams({
      utm_medium: link.medium,
      utm_source: link.source,
      utm_campaign: link.campaign,
      ...(link.term && { utm_term: link.term }),
      ...(link.content && { utm_content: link.content })
    });

    const fullUrl = `${link.destination}?${utmParams.toString()}`;

    navigator.clipboard.writeText(fullUrl).then(() => {
      toast({
        title: "Link Copied",
        description: "The UTM link has been copied to your clipboard.",
      });
    }).catch(() => {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Failed to copy the link. Please try again.",
      });
    });
  };

  console.log('DataTable rendering with data:', {
    dataLength: data?.length,
    columns: ['destination', 'medium', 'source', 'campaign', 'term', 'content', 'createdAt', 'createdBy', 'actions']
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search links..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <Select value={filterMedium} onValueChange={setFilterMedium}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter medium" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All mediums</SelectItem>
              {mediums.map((medium) => (
                <SelectItem key={medium} value={medium}>
                  {medium}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {sources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCampaign} onValueChange={setFilterCampaign}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter campaign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All campaigns</SelectItem>
              {campaigns.map((campaign) => (
                <SelectItem key={campaign} value={campaign}>
                  {campaign}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Destination</TableHead>
              <TableHead>Medium</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Term</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((link) => (
                <TableRow key={link.id}>
                  <TableCell className="font-medium">{link.destination}</TableCell>
                  <TableCell>{link.medium}</TableCell>
                  <TableCell>{link.source}</TableCell>
                  <TableCell>{link.campaign}</TableCell>
                  <TableCell>{link.term || '-'}</TableCell>
                  <TableCell>{link.content || '-'}</TableCell>
                  <TableCell>{new Date(link.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{link.createdBy}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(link)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setLinkToDelete(link.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            Showing {filteredData.length ? startIndex + 1 : 0}-{Math.min(endIndex, filteredData.length)} of {filteredData.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {filteredData.length ? currentPage : 0} of {totalPages || 0}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the UTM link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLinkToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}