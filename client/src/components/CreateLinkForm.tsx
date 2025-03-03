import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/useToast"
import { createUtmLink, getDropdownValues } from "@/api/utm"
import { useState, useEffect } from "react"
import { UtmDropdownValue } from "@/types/utm"
import { DialogDescription } from "@/components/ui/dialog"

const schema = z.object({
  destination: z.string().url("Please enter a valid URL"),
  medium: z.string().min(1, "Please select a medium"),
  source: z.string().min(1, "Please select a source"),
  campaign: z.string().min(1, "Please select a campaign"),
  term: z.string().optional(),
  content: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function CreateLinkForm({ onSuccess }: { onSuccess: () => void }) {
  const [dropdownValues, setDropdownValues] = useState<UtmDropdownValue[]>([])
  const { toast } = useToast()
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    const fetchDropdownValues = async () => {
      try {
        const response = await getDropdownValues()
        setDropdownValues(response.values)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch dropdown values",
        })
      }
    }
    fetchDropdownValues()
  }, [toast])

  const onSubmit = async (data: FormData) => {
    try {
      await createUtmLink(data)
      toast({
        title: "Success",
        description: "UTM link created successfully",
      })
      onSuccess()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create UTM link",
      })
    }
  }

  return (
    <>
      <DialogDescription>
        Create a new UTM-tracked link for your campaign
      </DialogDescription>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="destination">Destination URL</Label>
          <Input
            id="destination"
            placeholder="https://example.com"
            {...register("destination")}
          />
          {errors.destination && (
            <p className="text-sm text-destructive">{errors.destination.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="medium">Medium</Label>
          <Select onValueChange={(value) => setValue("medium", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select medium" />
            </SelectTrigger>
            <SelectContent>
              {dropdownValues
                .filter((v) => v.type === "medium")
                .map((medium) => (
                  <SelectItem key={medium.id} value={medium.value}>
                    {medium.value}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errors.medium && (
            <p className="text-sm text-destructive">{errors.medium.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Select onValueChange={(value) => setValue("source", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {dropdownValues
                .filter((v) => v.type === "source")
                .map((source) => (
                  <SelectItem key={source.id} value={source.value}>
                    {source.value}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errors.source && (
            <p className="text-sm text-destructive">{errors.source.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="campaign">Campaign</Label>
          <Select onValueChange={(value) => setValue("campaign", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select campaign" />
            </SelectTrigger>
            <SelectContent>
              {dropdownValues
                .filter((v) => v.type === "campaign")
                .map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.value}>
                    {campaign.value}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errors.campaign && (
            <p className="text-sm text-destructive">{errors.campaign.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="term">Term (Optional)</Label>
          <Input
            id="term"
            placeholder="running-shoes"
            {...register("term")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content (Optional)</Label>
          <Input
            id="content"
            placeholder="banner-1"
            {...register("content")}
          />
        </div>

        <Button type="submit" className="w-full">Create Link</Button>
      </form>
    </>
  )
}