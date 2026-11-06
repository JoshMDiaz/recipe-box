import { ImagePlusIcon, Loader2Icon, XIcon } from "lucide-react";
import { useEffect, useId, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Group, rowInput } from "@/components/grouped";
import { NavButton, SheetNav } from "@/components/sheet";
import { cn } from "@/lib/utils";
import { formatDuration, parseDuration } from "../time";
import type { RecipeInput } from "../types";

type Props = {
  initial: RecipeInput;
  /** Current photo URL when editing. */
  initialImageUrl?: string;
  /** Sheet title, e.g. "Edit Recipe". */
  title: string;
  /** The nav bar's left button: Cancel or Back. */
  left: ReactNode;
  submitLabel: string;
  pending: boolean;
  /** photo: File = new photo, null = remove, undefined = unchanged. */
  onSubmit: (input: RecipeInput, photo: File | null | undefined) => void;
};

const toLines = (v: string) => v.split("\n");

const textarea = cn(rowInput, "block resize-none leading-snug [field-sizing:content]");

export function RecipeForm({
  initial,
  initialImageUrl,
  title: sheetTitle,
  left,
  submitLabel,
  pending,
  onSubmit,
}: Props) {
  const id = useId();
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description ?? "");
  const [servings, setServings] = useState(initial.servings ?? "");
  const [initialTime] = useState(() => parseDuration(initial.totalTime));
  const [hours, setHours] = useState(initialTime?.hours ? String(initialTime.hours) : "");
  const [minutes, setMinutes] = useState(initialTime?.minutes ? String(initialTime.minutes) : "");
  // A pasted time the fields can't show, like "overnight". It's kept unless
  // the user enters hours or minutes, or clears it.
  const [freeTextTime, setFreeTextTime] = useState(initialTime ? undefined : initial.totalTime);
  const [tags, setTags] = useState(initial.tags.join(", "));
  const [ingredients, setIngredients] = useState(initial.ingredients.join("\n"));
  const [steps, setSteps] = useState(initial.steps.join("\n"));
  const [photo, setPhoto] = useState<File | null | undefined>(undefined);
  const [showErrors, setShowErrors] = useState(false);
  const [shaking, setShaking] = useState(false);

  const previewUrl = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
  useEffect(() => () => void (previewUrl && URL.revokeObjectURL(previewUrl)), [previewUrl]);
  const shownImage = photo === null ? undefined : (previewUrl ?? initialImageUrl);

  const titleMissing = !title.trim();
  const titleError = showErrors && titleMissing;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (titleMissing) {
      setShowErrors(true);
      setShaking(true);
      document.getElementById(`${id}-title`)?.focus();
      return;
    }
    onSubmit(
      {
        ...initial,
        title,
        description,
        servings,
        totalTime:
          formatDuration({ hours: Number(hours) || 0, minutes: Number(minutes) || 0 }) ||
          freeTextTime,
        tags: tags.split(","),
        ingredients: toLines(ingredients),
        steps: toLines(steps),
      },
      photo,
    );
  };

  return (
    <form onSubmit={submit} noValidate>
      <SheetNav
        left={left}
        title={sheetTitle}
        right={
          <NavButton type="submit" bold disabled={pending}>
            {pending && <Loader2Icon className="size-4 animate-spin" aria-hidden />}
            {pending ? "Saving…" : submitLabel}
          </NavButton>
        }
      />

      <Group
        className={cn("mt-3", shaking && "animate-shake")}
        onAnimationEnd={() => setShaking(false)}
        footer={titleError && <span className="text-red">Give your recipe a name.</span>}
      >
        <label htmlFor={`${id}-title`} className="sr-only">
          Title
        </label>
        <input
          id={`${id}-title`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={titleError}
          maxLength={200}
          autoComplete="off"
          placeholder="Title"
          className={cn(rowInput, "text-[20px] font-semibold placeholder:font-normal")}
        />
        <label htmlFor={`${id}-desc`} className="sr-only">
          Description
        </label>
        <textarea
          id={`${id}-desc`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Description (optional)"
          className={cn(textarea, "min-h-[4.5rem]")}
        />
      </Group>

      <Group
        header="Details"
        footer={
          freeTextTime &&
          !hours &&
          !minutes && (
            <>
              Time saved as “{freeTextTime}”.{" "}
              <button
                type="button"
                className="font-medium text-blue"
                onClick={() => setFreeTextTime(undefined)}
              >
                Clear
              </button>
            </>
          )
        }
      >
        <label className="flex min-h-12 items-center gap-3 pl-4">
          <span className="shrink-0 text-[17px]">Serves</span>
          <input
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            placeholder="4"
            className={cn(rowInput, "text-right tabular-nums")}
          />
        </label>
        <div
          role="group"
          aria-labelledby={`${id}-time`}
          className="flex min-h-12 items-center gap-3 px-4"
        >
          <span id={`${id}-time`} className="flex-1 text-[17px]">
            Total time
          </span>
          <DurationInput
            label="Hours"
            unit="hr"
            value={hours}
            onChange={setHours}
            placeholder="0"
          />
          <DurationInput
            label="Minutes"
            unit="min"
            value={minutes}
            onChange={setMinutes}
            placeholder="45"
          />
        </div>
      </Group>

      <Group header={<label htmlFor={`${id}-tags`}>Tags</label>} footer="Separate with commas.">
        <input
          id={`${id}-tags`}
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="dinner, quick"
          className={rowInput}
        />
      </Group>

      <Group header={<label htmlFor={`${id}-ing`}>Ingredients</label>} footer="One per line.">
        <textarea
          id={`${id}-ing`}
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          rows={6}
          placeholder={"2 cups flour\n1 tsp salt"}
          className={cn(textarea, "min-h-36")}
        />
      </Group>

      <Group header={<label htmlFor={`${id}-steps`}>Steps</label>} footer="One per line.">
        <textarea
          id={`${id}-steps`}
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          rows={6}
          placeholder={"Preheat the oven.\nMix everything together."}
          className={cn(textarea, "min-h-36")}
        />
      </Group>

      <Group header="Photo" className="mb-4">
        {shownImage ? (
          <div className="relative">
            <img src={shownImage} alt="" className="h-44 w-full object-cover" />
            <button
              type="button"
              className="absolute top-2.5 right-2.5 flex size-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm active:scale-90"
              onClick={() => setPhoto(initialImageUrl ? null : undefined)}
            >
              <XIcon className="size-4" strokeWidth={2.5} />
              <span className="sr-only">Remove photo</span>
            </button>
          </div>
        ) : (
          <label
            htmlFor={`${id}-photo`}
            className="flex min-h-12 cursor-pointer items-center gap-3 px-4 text-[17px] text-blue active:bg-fill has-focus-visible:bg-fill"
          >
            <ImagePlusIcon className="size-5" aria-hidden />
            Add Photo
          </label>
        )}
        <input
          id={`${id}-photo`}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setPhoto(file);
            e.target.value = "";
          }}
        />
      </Group>
    </form>
  );
}

function DurationInput({
  label,
  unit,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="flex h-9 items-center gap-1 rounded-lg bg-fill pr-2.5 focus-within:ring-2 focus-within:ring-blue/40">
      <input
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        aria-label={label}
        value={value}
        // Whole, non-negative numbers only.
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder={placeholder}
        className="w-12 bg-transparent pl-2.5 text-right text-[17px] tabular-nums outline-none placeholder:text-label-3"
      />
      <span className="text-[15px] text-label-2">{unit}</span>
    </label>
  );
}
