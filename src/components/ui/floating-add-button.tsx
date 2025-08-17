import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingAddButtonProps {
  onClick: () => void;
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-primary hover:shadow-golden transition-smooth shadow-islamic z-50"
    >
      <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
    </Button>
  );
}