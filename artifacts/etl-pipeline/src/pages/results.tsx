import React from "react";
import { useGetEtlResults } from "@workspace/api-client-react";
import { Database, Search } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export default function Results() {
  const { data: results, isLoading } = useGetEtlResults();
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredResults = results?.filter(
    (result) =>
      result.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">ETL Results</h1>
          <p className="text-muted-foreground mt-1">Review the AI-generated insights for your users.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            className="pl-9 bg-card border-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-6">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : !filteredResults || filteredResults.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground flex flex-col items-center">
              <Database className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-foreground">No results found</p>
              <p className="mt-1">
                {searchTerm ? "No messages match your search." : "Run the pipeline from the dashboard to generate data."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filteredResults.map((result) => (
                <div key={result.id} className="p-6 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                      {result.userName.substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-foreground truncate">{result.userName}</h3>
                          <Badge variant="outline" className="font-mono text-[10px] bg-background">
                            {result.stage}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                          {format(new Date(result.createdAt), "yyyy-MM-dd HH:mm:ss")}
                        </span>
                      </div>
                      
                      <div className="bg-muted/50 rounded-lg p-4 text-sm text-foreground/90 leading-relaxed border border-border/50 font-serif">
                        {result.message}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
