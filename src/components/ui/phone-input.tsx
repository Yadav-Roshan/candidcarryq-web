"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  countryCodes,
  findDefaultCountry,
  CountryCode,
} from "@/lib/country-codes";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  placeholder = "Phone number",
  disabled = false,
  required = false,
  className = "",
}: PhoneInputProps) {
  // Split the phone number into country code and number
  const defaultCountry = findDefaultCountry();
  const [selectedCountry, setSelectedCountry] =
    useState<CountryCode>(defaultCountry);
  const [localPhoneNumber, setLocalPhoneNumber] = useState("");

  // Initialize component when value changes externally
  useEffect(() => {
    // Only run this effect if the value is different from our internal state
    if (!value) {
      setLocalPhoneNumber("");
      return;
    }

    if (value !== `${selectedCountry.dial_code}${localPhoneNumber}`) {
      // If value starts with a plus sign, extract country code and phone number
      if (value.startsWith("+")) {
        const matchingCountry = countryCodes.find((country) =>
          value.startsWith(country.dial_code)
        );

        if (matchingCountry) {
          setSelectedCountry(matchingCountry);
          setLocalPhoneNumber(
            value.substring(matchingCountry.dial_code.length)
          );
          return;
        }
      }

      // If no matching country code, use the whole value as phone number
      setLocalPhoneNumber(value.replace(selectedCountry.dial_code, ""));
    }
  }, [value, selectedCountry.dial_code]);

  // Handle phone number change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhoneNumber = e.target.value;
    setLocalPhoneNumber(newPhoneNumber);
    onChange(`${selectedCountry.dial_code}${newPhoneNumber}`);
  };

  // Handle country code change
  const handleCountryChange = (countryCode: string) => {
    const country =
      countryCodes.find((c) => c.code === countryCode) || defaultCountry;
    setSelectedCountry(country);
    onChange(`${country.dial_code}${localPhoneNumber}`);
  };

  return (
    <div className="flex">
      <Select
        disabled={disabled}
        value={selectedCountry.code}
        onValueChange={handleCountryChange}
      >
        <SelectTrigger className="w-[110px] rounded-r-none border-r-0">
          <SelectValue placeholder={defaultCountry.emoji}>
            <span>
              {selectedCountry.emoji} {selectedCountry.dial_code}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {countryCodes.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <div className="flex items-center gap-2">
                <span>{country.emoji}</span>
                <span>{country.name}</span>
                <span className="text-muted-foreground text-xs">
                  {country.dial_code}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        className={`rounded-l-none flex-1 ${className}`}
        placeholder={placeholder}
        value={localPhoneNumber}
        onChange={handlePhoneChange}
        disabled={disabled}
        required={required}
      />
    </div>
  );
}
