export interface CountryCode {
  code: string;
  name: string;
  dial_code: string;
  emoji: string;
}

export const countryCodes: CountryCode[] = [
  {
    "code": "NP",
    "name": "Nepal",
    "dial_code": "+977",
    "emoji": "🇳🇵"
  },
  {
    "code": "IN",
    "name": "India",
    "dial_code": "+91",
    "emoji": "🇮🇳"
  },
  {
    "code": "US",
    "name": "United States",
    "dial_code": "+1",
    "emoji": "🇺🇸"
  },
  {
    "code": "GB",
    "name": "United Kingdom",
    "dial_code": "+44",
    "emoji": "🇬🇧"
  },
  {
    "code": "AU",
    "name": "Australia",
    "dial_code": "+61",
    "emoji": "🇦🇺"
  },
  {
    "code": "CA",
    "name": "Canada",
    "dial_code": "+1",
    "emoji": "🇨🇦"
  },
  {
    "code": "CN",
    "name": "China",
    "dial_code": "+86",
    "emoji": "🇨🇳"
  },
  {
    "code": "JP",
    "name": "Japan",
    "dial_code": "+81",
    "emoji": "🇯🇵"
  },
  {
    "code": "KR",
    "name": "South Korea",
    "dial_code": "+82",
    "emoji": "🇰🇷"
  },
  {
    "code": "SG",
    "name": "Singapore",
    "dial_code": "+65",
    "emoji": "🇸🇬"
  },
  {
    "code": "BD",
    "name": "Bangladesh",
    "dial_code": "+880",
    "emoji": "🇧🇩"
  },
  {
    "code": "PK",
    "name": "Pakistan",
    "dial_code": "+92",
    "emoji": "🇵🇰"
  },
  {
    "code": "MY",
    "name": "Malaysia",
    "dial_code": "+60",
    "emoji": "🇲🇾"
  },
  {
    "code": "AE",
    "name": "United Arab Emirates",
    "dial_code": "+971",
    "emoji": "🇦🇪"
  },
  {
    "code": "SA",
    "name": "Saudi Arabia",
    "dial_code": "+966",
    "emoji": "🇸🇦"
  },
  {
    "code": "QA",
    "name": "Qatar",
    "dial_code": "+974",
    "emoji": "🇶🇦"
  }
];

// Find Nepal as the default country
export const findDefaultCountry = (): CountryCode => {
  return countryCodes.find(country => country.code === "NP") || countryCodes[0];
};
