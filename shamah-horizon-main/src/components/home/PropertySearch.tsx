import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, DollarSign, Ruler, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const locations = [
  "All Locations",
  "Lusaka",
  "Copperbelt",
  "Southern Province",
  "Eastern Province",
  "Northern Province",
  "Central Province",
];

export function PropertySearch() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minSize, setMinSize] = useState("");
  const [titleStatus, setTitleStatus] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location && location !== "All Locations") params.set("location", location);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minSize) params.set("minSize", minSize);
    if (titleStatus) params.set("titled", titleStatus);
    
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <section className="py-8 bg-secondary">
      <div className="container">
        <div className="bg-card rounded-xl shadow-lg p-6 -mt-20 relative z-20">
          <h2 className="font-heading text-xl font-semibold mb-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Find Your Perfect Plot
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Location
              </label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Min Price (USD)
              </label>
              <Input
                type="number"
                placeholder="e.g. 5,000"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Max Price (USD)</label>
              <Input
                type="number"
                placeholder="e.g. 50,000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

            {/* Size */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                Min Size (sqm)
              </label>
              <Input
                type="number"
                placeholder="e.g. 1000"
                value={minSize}
                onChange={(e) => setMinSize(e.target.value)}
              />
            </div>

            {/* Title Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-muted-foreground" />
                Title Status
              </label>
              <Select value={titleStatus} onValueChange={setTitleStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="true">Titled Only</SelectItem>
                  <SelectItem value="false">Untitled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={handleSearch} className="bg-accent hover:bg-accent/90 gap-2">
              <Search className="h-4 w-4" />
              Search Properties
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
