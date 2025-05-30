// src/components/dashboard/ResetDataButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { useUserData } from "@/hooks/useUserData";
import { toast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

export function ResetDataButton() {
  const router = useRouter();
  const { resetAllUserData } = useUserData();

  const handleResetData = () => {
    resetAllUserData();
    toast({
      title: "Data Reset",
      description: "All your data has been cleared. You will be redirected to onboarding.",
    });
    router.push("/onboarding");
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full sm:w-auto">
          <Trash2 className="mr-2 h-4 w-4" /> Reset All Data
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete all your profile information,
            metrics, and daily logs from this browser.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleResetData} className="bg-destructive hover:bg-destructive/90">
            Yes, delete my data
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
