import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface FilterButtonProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  className?: string;
}

export const FilterButton = ({
  label,
  value,
  options,
  onChange,
  className,
}: FilterButtonProps) => {
  const isActive = value !== "all" && value !== "todos";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "gap-2 h-11 px-6 rounded-full border-2 transition-all",
            isActive 
              ? "border-primary bg-primary/5 text-primary hover:bg-primary/10" 
              : "border-border hover:border-primary/50",
            className
          )}
        >
          <Filter className="h-4 w-4" />
          <span className="font-medium">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-sm",
              (value === "all" || value === "todos") && "bg-accent"
            )}
            onClick={() => onChange("all")}
          >
            Todos
          </Button>
          {options.map((option) => (
            <Button
              key={option}
              variant="ghost"
              className={cn(
                "w-full justify-start text-sm",
                value === option && "bg-accent"
              )}
              onClick={() => onChange(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
