/**
 * @file FactoryResetDialog.tsx
 * @description Confirmation modal for factory resetting all app data from localStorage.
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

/**
 * Prop interface for `FactoryResetDialog`.
 */
export interface FactoryResetDialogProps {
  /** Controlled open state of the confirmation dialog. */
  open: boolean;
  /** State updater callback for the confirmation dialog. */
  onOpenChange: (open: boolean) => void;
  /** Callback invoked when the user confirms the factory reset. */
  onConfirm: () => void;
}

/**
 * Component prompting the user before wiping all persisted app data.
 */
export function FactoryResetDialog({
  open,
  onOpenChange,
  onConfirm,
}: FactoryResetDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Factory Reset?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete all your data: tiles, workspaces,
            settings, and mode configuration. The app will return to its
            first-run state. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Reset</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
