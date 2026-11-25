"use client";

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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Kalles etter at dialogen er lukket — dispatcher nyOkt og navigerer til Start. */
  onBekreft: () => void;
};

/**
 * Bekreftelsesdialog for «Ny økt» (story 1.14). Forelderen holder `open`-
 * tilstanden og kobler `onBekreft` til dispatch + navigering.
 */
export function NyOktDialog({ open, onOpenChange, onBekreft }: Props) {
  function bekreft() {
    onOpenChange(false);
    onBekreft();
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ny økt</AlertDialogTitle>
          <AlertDialogDescription>
            Alt i denne økten forsvinner.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Avbryt</AlertDialogCancel>
          <AlertDialogAction onClick={bekreft}>Start ny økt</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
