/**
 * @file ResetLayoutDialog.tsx
 * @description Confirmation modal for resetting the grid layout of the active workspace.
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUrlStore } from "@/store/useUrlStore";
import { toast } from "sonner";

/**
 * Prop interface for `ResetLayoutDialog`.
 */
export interface ResetLayoutDialogProps {
  /** Controlled open state of the confirmation dialog. */
  open: boolean;
  /** State updater callback for the confirmation dialog. */
  onOpenChange: (open: boolean) => void;
}

/**
 * Component prompting the user before resetting workspace tile positions.
 */
export function ResetLayoutDialog({
  open,
  onOpenChange,
}: ResetLayoutDialogProps) {
  const resetLayout = useUrlStore((state) => state.resetLayout);

  const handleConfirm = () => {
    resetLayout();
    toast.success("Workspace layout reset to default");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset Workspace Layout?</AlertDialogTitle>
          <AlertDialogDescription>
            This will reorganize all tiles in the current workspace into default
            grid positions. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Reset</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
