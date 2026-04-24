import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ShineBorder } from '@/components/ui/shine-border';
import { Trash2 } from 'lucide-react';

interface MagicDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isDeleting?: boolean;
}

export function MagicDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi Hapus",
  description = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.",
  isDeleting = false,
}: MagicDeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="overflow-hidden sm:rounded-2xl border-none shadow-2xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
        <ShineBorder 
          shineColor={["#ef4444", "#b91c1c", "#991b1b"]} 
          borderWidth={2} 
          duration={8}
        />
        <div className="relative z-10">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl font-bold text-red-600 dark:text-red-500">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-500" />
              </div>
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base mt-2">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8">
            <AlertDialogCancel disabled={isDeleting} onClick={onClose} className="rounded-xl border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:shadow-[0_0_25px_rgba(220,38,38,0.7)] transition-all duration-300"
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
