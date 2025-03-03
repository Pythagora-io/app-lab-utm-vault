import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportUtmLinks } from "@/api/utm";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";

export function ExportDialog() {
  const { toast } = useToast();
  const [fileFormat, setFileFormat] = useState<'csv' | 'excel'>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      console.log('Starting export with format:', fileFormat);
      setIsExporting(true);

      await exportUtmLinks(fileFormat);

      toast({
        title: "Success",
        description: "Your file has been exported successfully",
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: error.message || "An error occurred while exporting the file",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Links
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export UTM Links</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="fileFormat" className="text-sm font-medium">
              File Format
            </label>
            <Select
              value={fileFormat}
              onValueChange={(value: 'csv' | 'excel') => setFileFormat(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a file format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}