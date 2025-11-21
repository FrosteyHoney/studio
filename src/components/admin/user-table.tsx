
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
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "../ui/skeleton";
import { ArrowDown, ArrowUp, ShieldCheck, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useAuth } from "@/contexts/auth-provider";

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
  isAdmin?: boolean;
  isTrainer?: boolean;
}

interface StatChanges {
  [userId: string]: StatChange;
}

export function UserTable() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [statChanges, setStatChanges] = useState<StatChanges>({});
  const { toast } = useToast();

  const isSuperAdmin = currentUser?.email === 'myburghjobro@gmail.com';

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const usersCollection = collection(db, "users");
    getDocs(usersCollection).then(querySnapshot => {
        const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setUsers(usersData);
    }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: usersCollection.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setUsers([]); // Set users to empty array on error
    }).finally(() => {
        setLoading(false);
    });
  }, []);

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
    const userDocRef = doc(db, "users", userId);
    deleteDoc(userDocRef).then(() => {
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      toast({
        title: "User Deleted",
        description: "The user has been successfully removed.",
      });
    }).catch(serverError => {
      const permissionError = new FirestorePermissionError({
        path: userDocRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleMakeAdmin = async (user: User) => {
    const userDocRef = doc(db, "users", user.id);
    const newAdminStatus = !user.isAdmin;
    updateDoc(userDocRef, { isAdmin: newAdminStatus }).then(() => {
        toast({
            title: `Admin Status Updated`,
            description: `${user.name} is now ${newAdminStatus ? 'an admin' : 'no longer an admin'}.`
        });
        fetchUsers();
    }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'update',
            requestResourceData: { isAdmin: newAdminStatus }
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };
  
  const handleMakeTrainer = async (user: User) => {
    const userDocRef = doc(db, "users", user.id);
    const newTrainerStatus = !user.isTrainer;
    updateDoc(userDocRef, { isTrainer: newTrainerStatus }).then(() => {
        toast({
            title: `Trainer Status Updated`,
            description: `${user.name} is now ${newTrainerStatus ? 'a trainer' : 'no longer a trainer'}.`
        });
        fetchUsers();
    }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'update',
            requestResourceData: { isTrainer: newTrainerStatus }
        });
        errorEmitter.emit('permission-error', permissionError);
    });
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
    (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    user.id !== currentUser?.uid // Exclude the current admin from the list
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
                <TableCell>
                  <div className="flex items-center gap-2">
                    {user.isAdmin && <ShieldCheck className="h-4 w-4 text-primary" title="Administrator"/>}
                    {user.isTrainer && <Dumbbell className="h-4 w-4 text-green-500" title="Trainer"/>}
                    {user.name}
                  </div>
                </TableCell>
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
                      <Button variant="outline" size="sm" className="rounded-none rounded-l-md" onClick={() => handleEdit(user)}>Edit</Button>
                       {isSuperAdmin && (
                        <>
                            <Button variant="outline" size="sm" className="rounded-none" onClick={() => handleMakeAdmin(user)}>
                                {user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                            </Button>
                             <Button variant="outline" size="sm" className="rounded-none" onClick={() => handleMakeTrainer(user)}>
                                {user.isTrainer ? 'Revoke Trainer' : 'Make Trainer'}
                            </Button>
                        </>
                      )}
                      <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className={cn("rounded-l-none", !isSuperAdmin && "rounded-r-md")}>Delete</Button>
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

    
