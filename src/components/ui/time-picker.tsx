"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function TimePicker({ value, onChange, disabled }: TimePickerProps) {
  const [hour, setHour] = React.useState<string | undefined>(
    value ? value.split(":")[0] : undefined
  )
  const [minute, setMinute] = React.useState<string | undefined>(
    value ? value.split(":")[1] : undefined
  )

  React.useEffect(() => {
    if (hour && minute) {
      onChange(`${hour}:${minute}`)
    }
  }, [hour, minute, onChange])

  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  )
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  )

  return (
    <div className="flex items-center gap-2">
      <div className="grid gap-1 text-center">
        <Label htmlFor="hours" className="text-xs">
          Hour
        </Label>
        <Select
          onValueChange={setHour}
          defaultValue={hour}
          disabled={disabled}
        >
          <SelectTrigger
            id="hours"
            className="w-[70px] focus:ring-0 focus:ring-offset-0"
          >
            <SelectValue placeholder="HH" />
          </SelectTrigger>
          <SelectContent>
            {hours.map(h => (
              <SelectItem key={h} value={h}>
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <span className="font-bold">:</span>
      <div className="grid gap-1 text-center">
        <Label htmlFor="minutes" className="text-xs">
          Minute
        </Label>
        <Select
          onValueChange={setMinute}
          defaultValue={minute}
          disabled={disabled}
        >
          <SelectTrigger
            id="minutes"
            className="w-[70px] focus:ring-0 focus:ring-offset-0"
          >
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent>
            {minutes.map(m => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
