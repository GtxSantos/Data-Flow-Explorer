import React, { useState } from "react";
import { 
  useListUsers, 
  useCreateUser, 
  useDeleteUser,
  useGetUser,
  getListUsersQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Users as UsersIcon, CreditCard, Building, Banknote, Search } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  accountNumber: z.string().min(5, "Invalid account number"),
  accountAgency: z.string().min(2, "Invalid agency number"),
  accountBalance: z.coerce.number().min(0),
  accountLimit: z.coerce.number().min(0),
  cardNumber: z.string().min(12, "Invalid card number"),
  cardLimit: z.coerce.number().min(0),
});

type UserFormValues = z.infer<typeof userFormSchema>;

function UserDetailDialog({ userId, open, onOpenChange }: { userId: number, open: boolean, onOpenChange: (open: boolean) => void }) {
  const { data: user, isLoading } = useGetUser(userId, { query: { enabled: !!userId && open } });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            Detailed view of the user's data pipeline profile.
          </DialogDescription>
        </DialogHeader>
        {isLoading || !user ? (
          <div className="py-6 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <p className="text-sm text-muted-foreground">ID: {user.id}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-muted p-3 rounded-md">
                <span className="block text-xs text-muted-foreground mb-1">Account</span>
                <span className="font-mono">{user.account.number}-{user.account.agency}</span>
              </div>
              <div className="bg-muted p-3 rounded-md">
                <span className="block text-xs text-muted-foreground mb-1">Balance</span>
                <span className="font-mono">${user.account.balance}</span>
              </div>
              <div className="bg-muted p-3 rounded-md">
                <span className="block text-xs text-muted-foreground mb-1">Card</span>
                <span className="font-mono">{user.card.number}</span>
              </div>
              <div className="bg-muted p-3 rounded-md">
                <span className="block text-xs text-muted-foreground mb-1">Card Limit</span>
                <span className="font-mono">${user.card.limit}</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Users() {
  const { data: users, isLoading } = useListUsers();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const createUserMutation = useCreateUser({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        setIsDialogOpen(false);
        form.reset();
        toast({ title: "User created", description: "The user has been added to the pipeline." });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to create user.", variant: "destructive" });
      }
    }
  });

  const deleteUserMutation = useDeleteUser({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        toast({ title: "User deleted", description: "The user has been removed." });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to delete user.", variant: "destructive" });
      }
    }
  });

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      accountNumber: "",
      accountAgency: "",
      accountBalance: 0,
      accountLimit: 1000,
      cardNumber: "",
      cardLimit: 5000,
    },
  });

  function onSubmit(data: UserFormValues) {
    createUserMutation.mutate({ data });
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage pipeline subjects and their financial profiles.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Pipeline User</DialogTitle>
              <DialogDescription>
                Create a new user profile to be processed by the ETL pipeline.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input placeholder="12345-6" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountAgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agency</FormLabel>
                        <FormControl>
                          <Input placeholder="0001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="accountBalance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Balance ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Limit ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Number</FormLabel>
                        <FormControl>
                          <Input placeholder="**** **** **** 1234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cardLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Limit ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : !users || users.length === 0 ? (
          <div className="col-span-full py-16 text-center text-muted-foreground flex flex-col items-center bg-card rounded-lg border border-dashed">
            <UsersIcon className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium text-foreground">No users found</p>
            <p className="mt-1">Add users to begin processing data through the pipeline.</p>
          </div>
        ) : (
          users.map((user) => (
            <Card key={user.id} className="border-none shadow-sm overflow-hidden group">
              <div className="h-2 bg-gradient-to-r from-primary/80 to-primary/20" />
              <CardContent className="p-6 relative">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-4 right-4 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete User</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove {user.name} from the pipeline? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deleteUserMutation.mutate({ id: user.id })}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl uppercase shrink-0">
                    {user.name.substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-foreground truncate max-w-[200px]" title={user.name}>
                      {user.name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      Added {format(new Date(user.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => { setSelectedUserId(user.id); setIsDetailOpen(true); }} className="shrink-0">
                    <Search className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="bg-muted rounded-md p-3 flex flex-col gap-2 border border-border/50">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <Building className="w-3.5 h-3.5" /> Account Details
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground block text-xs">Acc / Agency</span>
                        <span className="font-mono font-medium text-foreground">{user.account.number} / {user.account.agency}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">Balance</span>
                        <span className="font-mono font-medium text-green-600">{formatCurrency(user.account.balance)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted rounded-md p-3 flex flex-col gap-2 border border-border/50">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <CreditCard className="w-3.5 h-3.5" /> Card Details
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground block text-xs">Number</span>
                        <span className="font-mono font-medium text-foreground">{user.card.number}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">Limit</span>
                        <span className="font-mono font-medium text-foreground">{formatCurrency(user.card.limit)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {user.aiMessage && (
                    <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-md">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-1">
                        <Banknote className="w-3 h-3" /> AI Insight Generated
                      </div>
                      <p className="text-xs text-foreground/80 italic line-clamp-2">
                        "{user.aiMessage}"
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      {selectedUserId && (
        <UserDetailDialog 
          userId={selectedUserId} 
          open={isDetailOpen} 
          onOpenChange={setIsDetailOpen} 
        />
      )}
    </div>
  );
}
