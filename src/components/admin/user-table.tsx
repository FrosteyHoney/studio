
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
import { useState } from "react";
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

const initialUsers = [
  { 
    id: "1", 
    name: "John Doe", 
    email: "john@example.com", 
    status: "Active", 
    joined: "2023-10-01",
    height: 180,
    weight: 75,
    bmi: 23.1,
    bodyFat: 15,
    muscleMass: 63
  },
  { 
    id: "2", 
    name: "Jane Smith", 
    email: "jane@example.com", 
    status: "Active", 
    joined: "2023-10-05",
    height: 165,
    weight: 58,
    bmi: 21.3,
    bodyFat: 22,
    muscleMass: 45
  },
  { 
    id: "3", 
    name: "Peter Jones", 
    email: "peter@example.com", 
    status: "Inactive", 
    joined: "2023-09-15",
    height: 175,
    weight: 85,
    bmi: 27.8,
    bodyFat: 20,
    muscleMass: 70
  },
];

type User = typeof initialUsers[0];

export function UserTable() {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  };
  
  const handleDeleteUser = (userId: string) => {
    // Here you would typically call an API to delete the user from your database
    setUsers(users.filter(user => user.id !== userId));
    toast({
      title: "User Deleted",
      description: "The user has been successfully removed.",
    });
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>{user.status}</Badge>
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
                        <Button variant="destructive" size="sm" className="rounded-l-none px-3">Delete</Button>
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
          ))}
        </TableBody>
      </Table>
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User: {editingUser?.name}</DialogTitle>
            <DialogDescription>Update the user's health and profile information.</DialogDescription>
          </DialogHeader>
          <UserEditForm 
            setOpen={setDialogOpen} 
            initialData={editingUser} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
