"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

export default function Page() {
  const [entries, setEntries] = useState<
    { type: "url" | "pdf"; value: string }[]
  >([]);
  const [url, setUrl] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);
  const [isValidUrl, setIsValidUrl] = useState<boolean | null>(null);

  // ✅ URL Validation
  const validateUrl = (value: string) => {
    try {
      const urlObj = new URL(value);
      return urlObj.protocol === "https:" || urlObj.protocol === "http:";
    } catch {
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    if (value.trim() === "") {
      setIsValidUrl(null);
    } else {
      setIsValidUrl(validateUrl(value));
    }
  };

  const handleSubmit = () => {
    if (url && isValidUrl) {
      setEntries((prev) => [...prev, { type: "url", value: url }]);
      setUrl("");
      setIsValidUrl(null);
    }

    if (pdf) {
      setEntries((prev) => [...prev, { type: "pdf", value: pdf.name }]);
      setPdf(null);
    }
  };

  const isDisabled = (!url || !isValidUrl) && !pdf;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6 gap-6">
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Add Your Resources</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* URL Input */}
              <div className="flex flex-col gap-2">
                <Input
                  placeholder="Enter your site URL (e.g. https://example.com)"
                  value={url}
                  onChange={handleUrlChange}
                />
                {isValidUrl === false && (
                  <p className="text-sm text-red-500">
                    Please enter a valid URL starting with https:// or http://
                  </p>
                )}
              </div>

              {/* PDF Upload */}
              <div className="flex flex-col gap-2">
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdf(e.target.files?.[0] || null)}
                />
                {pdf && (
                  <p className="text-sm text-gray-500">
                    Selected file: {pdf.name}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  onClick={handleSubmit}
                  disabled={isDisabled}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" /> Submit
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Display Added Resources */}
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Previously Added</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {entries.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No entries added yet.
                </p>
              ) : (
                entries.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center border rounded-lg px-3 py-2"
                  >
                    <span>
                      {entry.type === "url" ? (
                        <a
                          href={entry.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {entry.value}
                        </a>
                      ) : (
                        <span className="text-gray-800">{entry.value}</span>
                      )}
                    </span>
                    <span className="text-xs uppercase text-gray-500">
                      {entry.type}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
