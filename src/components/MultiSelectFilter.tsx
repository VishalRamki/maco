import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface MultiSelectFilterProps {
  title: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function MultiSelectFilter({
  title,
  options,
  selected,
  onChange,
}: MultiSelectFilterProps) {
  const [open, setOpen] = React.useState(false);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="inline-flex items-center justify-between gap-1 h-8 px-2.5 text-xs font-medium border border-input border-dashed rounded-md bg-background hover:bg-muted transition-colors focus:outline-none focus:ring-1 focus:ring-ring">
        <span className="capitalize">{title}</span>
        {selected.length > 0 && (
          <span className="ml-1 rounded-sm bg-secondary px-1 py-0.5 text-[10px] font-normal text-secondary-foreground">
            {selected.length}
          </span>
        )}
        <ChevronsUpDown className="size-3 text-muted-foreground ml-1" />
      </PopoverTrigger>
      <PopoverContent className="w-50 p-0" align="start">
        <Command>
          <CommandInput
            placeholder={`Search ${title.toLowerCase()}...`}
            className="h-8 text-xs"
          />
          <CommandList>
            <CommandEmpty className="py-2 text-center text-xs text-muted-foreground">
              No results found.
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option);
                return (
                  <CommandItem
                    key={option}
                    onSelect={() => toggleOption(option)}
                    className="text-xs flex items-center justify-between cursor-pointer"
                  >
                    <div
                      className={`size-4 rounded-sm border border-primary flex items-center justify-center ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50"
                      }`}
                    >
                      {isSelected && <Check className="size-3" />}
                    </div>
                    <span className="capitalize truncate">{option}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
