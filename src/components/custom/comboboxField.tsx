import { useMemo, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FormControl } from "../ui/form";

type Item = { value: string; label?: string };

type Props = {
  value: string;
  onChange: (next: string) => void;

  placeholder: string;
  searchPlaceholder: string;

  items: Item[];
  disabled?: boolean;

  filter?: (item: Item, qUpper: string) => boolean;
};

export default function ComboboxField({
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  items,
  disabled,
  filter,
}: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const qu = q.trim().toUpperCase();
    if (!qu) return items;

    const fn = filter ?? ((it: Item, qq: string) => it.value.toUpperCase().includes(qq));

    return items.filter((it) => fn(it, qu));
  }, [q, items, filter]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            type="button"
            className="w-full justify-between cursor-pointer"
            disabled={disabled}
          >
            <span>{value ? value : placeholder}</span>

            {value ? (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange("");
                  }
                }}
                className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
                aria-label="Clear"
                title="Clear"
              >
                <X className="h-4 w-4" />
              </span>
            ) : (
              <span className="ml-2 opacity-50">▾</span>
            )}
          </Button>
        </FormControl>
      </PopoverTrigger>

      <PopoverContent>
        <Command shouldFilter={false}>
          <CommandInput placeholder={searchPlaceholder} value={q} onValueChange={setQ} />

          <CommandList>
            <CommandEmpty>No supplier found.</CommandEmpty>

            <CommandGroup>
              {filtered.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={() => {
                    onChange(item.value);
                    setQ("");
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  {item.label ?? item.value}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
