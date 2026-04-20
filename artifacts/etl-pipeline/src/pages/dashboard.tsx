import React, { useState } from "react";
import { Link } from "wouter";
import { 
  useGetEtlStats, 
  useGetEtlResults, 
  useRunEtlPipeline, 
  getGetEtlStatsQueryKey, 
  getGetEtlResultsQueryKey,
  getListUsersQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Play, Database, Users, MessageSquare, Clock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSimulatingRun, setIsSimulatingRun] = useState(false);
  const [runProgress, setRunProgress] = useState(0);

  const { data: stats, isLoading: statsLoading } = useGetEtlStats();
  const { data: results, isLoading: resultsLoading } = useGetEtlResults();
  
  const runEtlMutation = useRunEtlPipeline({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetEtlStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetEtlResultsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        toast({
          title: "ETL Pipeline completed",
          description: "Data successfully extracted, transformed, and loaded.",
        });
      },
      onError: (error) => {
        setIsSimulatingRun(false);
        setRunProgress(0);
        toast({
          title: "Pipeline failed",
          description: "There was an error running the ETL pipeline.",
          variant: "destructive"
        });
      }
    }
  });

  const handleRunPipeline = () => {
    setIsSimulatingRun(true);
    setRunProgress(0);
    
    // Simulate a multi-stage loading process for satisfying feedback
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 95) {
        clearInterval(interval);
        runEtlMutation.mutate({}, {
          onSuccess: () => {
            setRunProgress(100);
            setTimeout(() => {
              setIsSimulatingRun(false);
              setRunProgress(0);
            }, 1000);
          }
        });
      } else {
        setRunProgress(progress);
      }
    }, 400);
  };

  const statCards = [
    { title: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-500" },
    { title: "Pipeline Runs", value: stats?.totalRuns || 0, icon: Database, color: "text-purple-500" },
    { title: "Messages Generated", value: stats?.messagesGenerated || 0, icon: MessageSquare, color: "text-green-500" },
    { 
      title: "Last Run", 
      value: stats?.lastRunAt ? format(new Date(stats.lastRunAt), "HH:mm") : "Never", 
      icon: Clock, 
      color: "text-orange-500",
      description: stats?.lastRunAt ? format(new Date(stats.lastRunAt), "MMM d, yyyy") : ""
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-1">Monitor the state of your ETL data pipeline.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat, i) => (
            <Card key={i} className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{stat.value}</div>
                {stat.description && (
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-primary/5 relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Database className="w-64 h-64" />
        </div>
        <CardHeader>
          <CardTitle className="text-xl">Execute Pipeline</CardTitle>
          <CardDescription>
            Trigger the AI-powered message generation process for all active users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-start gap-4">
            <Button 
              size="lg" 
              onClick={handleRunPipeline}
              disabled={isSimulatingRun || runEtlMutation.isPending}
              className="relative overflow-hidden font-semibold group w-full sm:w-auto transition-all"
            >
              {isSimulatingRun || runEtlMutation.isPending ? (
                <>
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-primary/20 transition-all duration-300"
                    style={{ width: `${runProgress}%` }}
                  />
                  <span className="relative flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Data... {Math.round(runProgress)}%
                  </span>
                </>
              ) : runProgress === 100 ? (
                <span className="relative flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Completed
                </span>
              ) : (
                <span className="relative flex items-center gap-2">
                  <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                  Run ETL Pipeline
                </span>
              )}
            </Button>
            
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground font-mono mt-2">
              <span className="bg-background px-2 py-1 rounded-md border border-border/50">Extract</span>
              <ArrowRight className="w-4 h-4 mt-1.5 opacity-50" />
              <span className="bg-background px-2 py-1 rounded-md border border-border/50">Transform (AI)</span>
              <ArrowRight className="w-4 h-4 mt-1.5 opacity-50" />
              <span className="bg-background px-2 py-1 rounded-md border border-border/50">Load</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Recent Activity</h2>
          <Link href="/results">
            <Button variant="ghost" size="sm" className="text-primary gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        
        <Card className="border-none shadow-sm">
          <CardContent className="p-0">
            {resultsLoading ? (
              <div className="p-6 space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !results || results.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <Database className="w-12 h-12 mb-4 opacity-20" />
                <p>No ETL pipeline results found.</p>
                <p className="text-sm mt-1">Run the pipeline to generate insights.</p>
              </div>
            ) : (
              <div className="divide-y">
                {results.slice(0, 5).map((result) => (
                  <div key={result.id} className="p-4 sm:p-6 hover:bg-muted/50 transition-colors flex gap-4">
                    <div className="mt-1">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                        {result.userName.substring(0, 2)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {result.userName}
                        </p>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {result.stage}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {result.message}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-2 font-mono">
                        {format(new Date(result.createdAt), "MMM d, HH:mm:ss")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
