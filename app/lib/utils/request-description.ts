import { UAParser } from "ua-parser-js";

export const getRequestDescription = (headers: Headers) => {
  const userAgent = headers.get("user-agent") || "";
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();

  const cityEncoded = headers.get("x-vercel-ip-city");
  const city = cityEncoded ? decodeURIComponent(cityEncoded) : null;
  const country = headers.get("x-vercel-ip-country");

  const parts = [];

  if (browser.name) {
    parts.push(browser.name);
  }

  if (os.name) {
    parts.push(`on ${os.name}`);
  }

  const locationParts = [];

  if (city) {
    locationParts.push(city);
  }

  if (country) {
    locationParts.push(country);
  }

  if (locationParts.length > 0) {
    parts.push(locationParts.join(", "));
  }

  return parts.join(", ");
};
