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
      className="fixed bottom-6 left-6 h-14 w-14 rounded-full bg-gradient-primary hover:shadow-golden transition-smooth shadow-islamic z-50"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}