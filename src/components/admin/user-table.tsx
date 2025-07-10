
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
import { UserEditForm } from "./user-edit-form";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "../ui/skeleton";

interface User { 
  id: string; 
  name: string; 
  email: string; 
  status: 'Active' | 'Inactive' | 'Online'; 
  joined: string;
  height: number;
  weight: number;
  bmi: number;
  bodyFat: number;
  muscleMass: number;
}

export function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
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
  
  const getStatusVariant = (status: User['status']) => {
    switch (status) {
        case 'Online':
            return 'default'; // Uses primary color
        case 'Active':
            return 'secondary';
        default:
            return 'outline';
    }
  }

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
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(user.status)}>{user.status}</Badge>
                </TableCell>
                <TableCell>{user.joined}</TableCell>
                <TableCell>{user.height}</TableCell>
                <TableCell>{user.weight}</TableCell>
                <TableCell>{user.bmi}</TableCell>
                <TableCell>{user.bodyFat}</TableCell>
                <TableCell>{user.muscleMass}</TableCell>
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
            onUserUpdated={fetchUsers}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
