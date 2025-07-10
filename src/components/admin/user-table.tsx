
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { UserEditForm, type StatChange } from "./user-edit-form";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "../ui/skeleton";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface User { 
  id: string; 
  name: string; 
  email: string; 
  status: 'Active' | 'Inactive'; 
  joined: string;
  height: number;
  weight: number;
  bmi: number;
  bodyFat: number;
  muscleMass: number;
}

interface StatChanges {
  [userId: string]: StatChange;
}

export function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [statChanges, setStatChanges] = useState<StatChanges>({});
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users: ", error);
      toast({
        variant: "destructive",
        title: "Error fetching users",
        description: "Could not retrieve user data from the database.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserUpdated = (userId: string, changes: StatChange) => {
    fetchUsers();
    setStatChanges(prev => ({ ...prev, [userId]: changes }));
    // Remove the change indicator after a delay
    setTimeout(() => {
        setStatChanges(prev => {
            const newChanges = { ...prev };
            delete newChanges[userId];
            return newChanges;
        });
    }, 5000); // 5 seconds
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  };
  
  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      toast({
        title: "User Deleted",
        description: "The user has been successfully removed.",
      });
    } catch(error) {
       toast({
        variant: "destructive",
        title: "Error Deleting User",
        description: "There was a problem deleting the user.",
      });
    }
  };

  const StatChangeIndicator = ({ change, good }: { change: number; good: 'up' | 'down' }) => {
    if (change === 0 || isNaN(change)) return null;

    const isGood = (good === 'up' && change > 0) || (good === 'down' && change < 0);
    const isBad = (good === 'up' && change < 0) || (good === 'down' && change > 0);

    return (
        <span className={cn(
            "ml-2 inline-flex items-center gap-1 text-xs transition-opacity duration-500",
            isGood && "text-green-500",
            isBad && "text-red-500",
        )}>
            {change > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {Math.abs(change).toFixed(1)}
        </span>
    );
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <Skeleton className="h-10 w-64" />
            </div>
            <Skeleton className="h-[400px] w-full" />
        </div>
    )
  }

  return (
    <>
      <div className="w-full">
        <Input 
          placeholder="Search by name or email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Joined</TableHead>
              <TableHead>Height (cm)</TableHead>
              <TableHead>Weight (kg)</TableHead>
              <TableHead>BMI</TableHead>
              <TableHead>Body Fat (%)</TableHead>
              <TableHead>Muscle Mass (kg)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <TableRow key={user.id} className={cn(statChanges[user.id] && "bg-muted/50")}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>{user.status}</Badge>
                </TableCell>
                <TableCell>{user.joined}</TableCell>
                <TableCell>
                    {user.height}
                    {statChanges[user.id] && <StatChangeIndicator change={statChanges[user.id].height} good="up" />}
                </TableCell>
                <TableCell>
                    {user.weight}
                    {statChanges[user.id] && <StatChangeIndicator change={statChanges[user.id].weight} good="down" />}
                </TableCell>
                <TableCell>
                    {user.bmi}
                    {statChanges[user.id] && <StatChangeIndicator change={statChanges[user.id].bmi} good="down" />}
                </TableCell>
                <TableCell>
                    {user.bodyFat}
                    {statChanges[user.id] && <StatChangeIndicator change={statChanges[user.id].bodyFat} good="down" />}
                </TableCell>
                <TableCell>
                    {user.muscleMass}
                    {statChanges[user.id] && <StatChangeIndicator change={statChanges[user.id].muscleMass} good="up" />}
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex rounded-md shadow-sm">
                      <Button variant="outline" size="sm" className="rounded-r-none" onClick={() => handleEdit(user)}>Edit</Button>
                      <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="rounded-l-none">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the user account
                              and remove their data from our servers.
                          </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                              Continue
                          </AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                      </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User: {editingUser?.name}</DialogTitle>
            <DialogDescription>Update the user's health and profile information.</DialogDescription>
          </DialogHeader>
          <UserEditForm 
            setOpen={setDialogOpen} 
            initialData={editingUser} 
            onUserUpdated={handleUserUpdated}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
