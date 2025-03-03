import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Plus, BarChart, Trash2, Pencil, Check, X } from "lucide-react"
import { useToast } from "@/hooks/useToast"
import {
  addDropdownValue,
  deleteDropdownValue,
  editDropdownValue,
  getDropdownValues,
} from "@/api/utm"
import { getGoogleAuthStatus, saveGAProperty, getGAProperty, disconnectGoogleAnalytics } from "@/api/analytics"
import { UtmDropdownValue } from "@/types/utm"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import api from "@/api/api"

export function Settings() {
  const [newMedium, setNewMedium] = useState("")
  const [newSource, setNewSource] = useState("")
  const [newCampaign, setNewCampaign] = useState("")
  const [gaTrackingId, setGaTrackingId] = useState("")
  const [dropdownValues, setDropdownValues] = useState<UtmDropdownValue[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [valueToDelete, setValueToDelete] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [isGAConnected, setIsGAConnected] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchDropdownValues()
  }, [])

  useEffect(() => {
    const checkGAStatus = async () => {
      try {
        const status = await getGoogleAuthStatus();
        setIsGAConnected(status.connected);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to check Google Analytics connection status"
        });
      }
    };

    checkGAStatus();

    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        window.location.reload();
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: decodeURIComponent(event.data.error)
        });
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, []);

  useEffect(() => {
    const fetchGAProperty = async () => {
      try {
        const { propertyId } = await getGAProperty();
        if (propertyId) {
          setGaTrackingId(propertyId);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to fetch Google Analytics property ID"
        });
      }
    };

    if (isGAConnected) {
      fetchGAProperty();
    }
  }, [isGAConnected]);

  const fetchDropdownValues = async () => {
    try {
      const response = await getDropdownValues()
      setDropdownValues(response.values)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch dropdown values",
      })
    }
  }

  const handleAddValue = async (type: 'medium' | 'source' | 'campaign', value: string) => {
    if (!value.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a value",
      })
      return
    }

    try {
      console.log('Attempting to add value:', { type, value });
      await addDropdownValue({ type, value })
      console.log('Successfully added value');
      toast({
        title: "Success",
        description: `New ${type} added successfully`,
      })
      if (type === 'medium') setNewMedium("")
      else if (type === 'source') setNewSource("")
      else setNewCampaign("")
      fetchDropdownValues()
    } catch (error) {
      console.log('Error adding value:', error);
      console.log('Error message:', error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to add new ${type}`
      })
    }
  }

  const handleEditValue = async (id: string) => {
    if (!editValue.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a value",
      })
      return
    }

    try {
      await editDropdownValue(id, editValue)
      toast({
        title: "Success",
        description: "Value updated successfully",
      })
      setEditingValue(null)
      setEditValue("")
      fetchDropdownValues()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update value",
      })
    }
  }

  const handleDeleteValue = async () => {
    if (!valueToDelete) return

    try {
      await deleteDropdownValue(valueToDelete)
      toast({
        title: "Success",
        description: "Value deleted successfully",
      })
      fetchDropdownValues()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete value",
      })
    } finally {
      setValueToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleStartEdit = (value: UtmDropdownValue) => {
    setEditingValue(value.id)
    setEditValue(value.value)
  }

  const handleCancelEdit = () => {
    setEditingValue(null)
    setEditValue("")
  }

  const handleSaveGA = async () => {
    try {
      await saveGAProperty(gaTrackingId);
      toast({
        title: "Success",
        description: "Google Analytics property ID saved successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save Google Analytics property ID",
      });
    }
  }

  const handleDisconnectGoogle = async () => {
    try {
      console.log('Disconnecting from Google Analytics');
      await disconnectGoogleAnalytics();
      setIsGAConnected(false);
      setGaTrackingId("");
      toast({
        title: 'Success',
        description: 'Disconnected from Google Analytics',
      });
    } catch (error) {
      console.error('Error disconnecting from Google Analytics:', error);
      toast({
        variant: "destructive",
        title: 'Error',
        description: error.message || 'Failed to disconnect from Google Analytics',
      });
    }
  }

  const renderValuesList = (type: 'medium' | 'source' | 'campaign') => {
    const values = dropdownValues.filter(v => v.type === type)
    return (
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Input
            value={
              type === 'medium'
                ? newMedium
                : type === 'source'
                ? newSource
                : newCampaign
            }
            onChange={(e) => {
              if (type === 'medium') setNewMedium(e.target.value)
              else if (type === 'source') setNewSource(e.target.value)
              else setNewCampaign(e.target.value)
            }}
            placeholder={`Enter new ${type}`}
          />
          <Button
            onClick={() =>
              handleAddValue(
                type,
                type === 'medium'
                  ? newMedium
                  : type === 'source'
                  ? newSource
                  : newCampaign
              )
            }
            disabled={
              type === 'medium'
                ? !newMedium
                : type === 'source'
                ? !newSource
                : !newCampaign
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Value</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {values.map((value) => (
              <TableRow key={value.id}>
                <TableCell>
                  {editingValue === value.id ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="max-w-[200px]"
                    />
                  ) : (
                    value.value
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {editingValue === value.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditValue(value.id)}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStartEdit(value)}
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setValueToDelete(value.id)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>UTM Parameters</CardTitle>
            <CardDescription>Manage your predefined UTM parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="mediums">
                <AccordionTrigger>Mediums</AccordionTrigger>
                <AccordionContent>
                  {renderValuesList('medium')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="sources">
                <AccordionTrigger>Sources</AccordionTrigger>
                <AccordionContent>
                  {renderValuesList('source')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="campaigns">
                <AccordionTrigger>Campaigns</AccordionTrigger>
                <AccordionContent>
                  {renderValuesList('campaign')}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Google Analytics Integration</CardTitle>
            <CardDescription>Connect your Google Analytics account to track UTM performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!isGAConnected ? (
                <div className="flex space-x-2">
                  <Button
                    onClick={async () => {
                      try {
                        const response = await api.get('/api/auth/google');
                        window.open(response.data.url, '_blank');
                      } catch (error) {
                        toast({
                          variant: "destructive",
                          title: "Error",
                          description: error.message || "Failed to initiate Google authentication"
                        });
                      }
                    }}
                    className="w-full"
                  >
                    <BarChart className="mr-2 h-4 w-4" />
                    Connect Google Analytics
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <p className="text-sm text-muted-foreground">Connected to Google Analytics</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="ga">Google Analytics 4 Property ID</Label>
                    <Input
                      id="ga"
                      value={gaTrackingId}
                      onChange={(e) => setGaTrackingId(e.target.value)}
                      placeholder="Enter your GA4 Property ID (e.g., 123456789)"
                      pattern="^\d+$"
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter your GA4 Property ID to enable automatic performance tracking for your UTM links.
                      You can find this in your Google Analytics Admin settings under Property &gt; Property Details.
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSaveGA}
                      disabled={!gaTrackingId || !/^\d+$/.test(gaTrackingId)}
                    >
                      Save Property ID
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDisconnectGoogle}
                    >
                      Disconnect from Google Analytics
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this value.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setValueToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteValue}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}