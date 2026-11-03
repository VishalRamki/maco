/**
 * @file CreatableMultiSelect.tsx
 * @description Searchable multi-select dropdown that allows selecting existing options or creating new ones on the fly.
 */

import * as React from "react";
import { ChevronsUpDown, Plus, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

/**
 * Prop interface for `CreatableMultiSelect`.
 */
export interface CreatableMultiSelectProps {
  /** Label title displayed on the dropdown button (e.g. "Category", "Tags"). */
  title: string;
  /** Complete list of existing selectable options from the library. */
  options: string[];
  /** Array of currently selected values. */
  selected: string[];
  /** Callback fired when selection state changes. */
  onChange: (selected: string[]) => void;
}

/**
 * Multi-select dropdown supporting search, selection of existing options, and creating new options.
 * When the user types a value not in `options`, an "Add \"value\"" item appears at the top.
 */
export function CreatableMultiSelect({
  title,
  options,
  selected,
  onChange,
}: CreatableMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const toggleOption = (option: string) => {
    const normalized = option.trim();
    if (!normalized) return;

    if (selected.includes(normalized)) {
      onChange(selected.filter((item) => item !== normalized));
    } else {
      onChange([...selected, normalized]);
    }
  };

  const availableOptions = options.filter((o) => !selected.includes(o));

  const filteredOptions = inputValue.trim()
    ? availableOptions.filter((o) =>
        o.toLowerCase().includes(inputValue.toLowerCase()),
      )
    : availableOptions;

  const showCreateOption =
    inputValue.trim() !== "" &&
    !availableOptions.some(
      (o) => o.toLowerCase() === inputValue.trim().toLowerCase(),
    );

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className="w-full inline-flex items-center justify-between gap-1 h-9 px-3 text-sm border border-input rounded-md bg-background hover:bg-muted transition-colors focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
          aria-label={`Select ${title.toLowerCase()}`}
        >
          <span className="text-muted-foreground">
            {selected.length > 0
              ? `${selected.length} selected`
              : `Select ${title.toLowerCase()}...`}
          </span>
          <ChevronsUpDown className="size-4 text-muted-foreground shrink-0" />
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={`Search or add ${title.toLowerCase()}...`}
              className="h-9"
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {showCreateOption && (
                  <CommandItem
                    onSelect={() => {
                      toggleOption(inputValue.trim());
                      setInputValue("");
                    }}
                    className="cursor-pointer"
                  >
                    <Plus className="size-4 mr-2 text-muted-foreground" />
                    <span>Add "{inputValue.trim()}"</span>
                  </CommandItem>
                )}
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option}
                    onSelect={() => {
                      toggleOption(option);
                      setInputValue("");
                    }}
                    className="cursor-pointer"
                  >
                    <Plus className="size-4 mr-2 text-muted-foreground" />
                    <span className="capitalize">{option}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="gap-1 capitalize cursor-pointer"
              onClick={() => {
                onChange(selected.filter((s) => s !== item));
              }}
            >
              {item}
              <X className="size-3 hover:text-foreground" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
