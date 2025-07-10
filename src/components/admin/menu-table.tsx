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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MenuForm } from "./menu-form";
import { useState } from "react";
import Image from "next/image";

const initialMeals = [
  { id: "1", name: "Lean Chicken & Quinoa", calories: 450, image: "https://placehold.co/40x40.png" },
  { id: "2", name: "Salmon with Asparagus", calories: 520, image: "https://placehold.co/40x40.png" },
  { id: "3", name: "Tofu Stir-fry", calories: 380, image: "https://placehold.co/40x40.png" },
];

export function MenuTable() {
  const [meals, setMeals] = useState(initialMeals);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);

  const handleEdit = (meal: any) => {
    setEditingMeal(meal);
    setDialogOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingMeal(null);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={handleAddNew}>Add New Meal</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Calories</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meals.map((meal) => (
            <TableRow key={meal.id}>
              <TableCell>
                <Image src={meal.image} alt={meal.name} width={40} height={40} className="rounded-md" data-ai-hint="meal food" />
              </TableCell>
              <TableCell>{meal.name}</TableCell>
              <TableCell>{meal.calories}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(meal)}>Edit</Button>
                <Button variant="destructive" size="sm">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMeal ? "Edit Meal" : "Add New Meal"}</DialogTitle>
            <DialogDescription>
              {editingMeal ? "Update the details for this meal." : "Fill in the details for the new meal."}
            </DialogDescription>
          </DialogHeader>
          <MenuForm setOpen={setDialogOpen} initialData={editingMeal} />
        </DialogContent>
      </Dialog>
    </>
  );
}
