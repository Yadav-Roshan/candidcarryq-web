"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Common country codes with flags
export const countryCodes = [
  { value: "+977", label: "🇳🇵 Nepal (+977)" },
  { value: "+91", label: "🇮🇳 India (+91)" },
  { value: "+1", label: "🇺🇸 USA (+1)" },
  { value: "+44", label: "🇬🇧 UK (+44)" },
  { value: "+61", label: "🇦🇺 Australia (+61)" },
  { value: "+86", label: "🇨🇳 China (+86)" },
  { value: "+971", label: "🇦🇪 UAE (+971)" },
  { value: "+966", label: "🇸🇦 Saudi Arabia (+966)" },
  { value: "+974", label: "🇶🇦 Qatar (+974)" },
  { value: "+965", label: "🇰🇼 Kuwait (+965)" },
  { value: "+60", label: "🇲🇾 Malaysia (+60)" },
  { value: "+65", label: "🇸🇬 Singapore (+65)" },
  { value: "+66", label: "🇹🇭 Thailand (+66)" },
  { value: "+81", label: "🇯🇵 Japan (+81)" },
  { value: "+82", label: "🇰🇷 South Korea (+82)" },
]

interface CountryCodeSelectProps {
  value: string
  onChange: (value: string) => void
}

export function CountryCodeSelect({ value, onChange }: CountryCodeSelectProps) {
  const [open, setOpen] = React.useState(false)
  
  // Find the selected country
  const selectedCountry = countryCodes.find(country => country.value === value) || 
    (value ? { value, label: value } : countryCodes[0])

  // Extract the flag emoji from the label
  const flag = selectedCountry.label.split(' ')[0]
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="min-w-[120px] justify-between"
        >
          <span className="flex items-center">
            {flag} <span className="ml-2">{value}</span>
          </span>
          <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandInput placeholder="Search country code..." />
          <CommandEmpty>No country found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {countryCodes.map((country) => (
              <CommandItem
                key={country.value}
                value={country.label}
                onSelect={() => {
                  onChange(country.value)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === country.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {country.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
