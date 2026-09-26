import { ImagePlusIcon, Loader2Icon, XIcon } from "lucide-react";
import { useEffect, useId, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDuration, parseDuration } from "../time";
import type { RecipeInput } from "../types";

type Props = {
  initial: RecipeInput;
  /** Current photo URL when editing. */
  initialImageUrl?: string;
  submitLabel: string;
  pending: boolean;
  /** photo: File = new photo, null = remove, undefined = unchanged. */
  onSubmit: (input: RecipeInput, photo: File | null | undefined) => void;
  secondaryAction?: React.ReactNode;
};

const toLines = (v: string) => v.split("\n");

export function RecipeForm({
  initial,
  initialImageUrl,
  submitLabel,
  pending,
  onSubmit,
  secondaryAction,
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

  const previewUrl = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
  useEffect(() => () => void (previewUrl && URL.revokeObjectURL(previewUrl)), [previewUrl]);
  const shownImage = photo === null ? undefined : (previewUrl ?? initialImageUrl);

  const titleMissing = !title.trim();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (titleMissing) {
      setShowErrors(true);
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
      <FieldGroup className="gap-4">
        <Field data-invalid={showErrors && titleMissing}>
          <FieldLabel htmlFor={`${id}-title`}>Title</FieldLabel>
          <Input
            id={`${id}-title`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={showErrors && titleMissing}
            maxLength={200}
            autoComplete="off"
          />
          {showErrors && titleMissing && <FieldError>Give your recipe a name.</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor={`${id}-desc`}>Description</FieldLabel>
          <Textarea
            id={`${id}-desc`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor={`${id}-serves`}>Serves</FieldLabel>
            <Input
              id={`${id}-serves`}
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              placeholder="4"
            />
          </Field>
          <Field aria-labelledby={`${id}-time`}>
            <FieldLabel id={`${id}-time`} htmlFor={`${id}-hours`}>
              Total time
            </FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              <DurationInput
                id={`${id}-hours`}
                label="Hours"
                unit="hr"
                value={hours}
                onChange={setHours}
                placeholder="0"
              />
              <DurationInput
                id={`${id}-minutes`}
                label="Minutes"
                unit="min"
                value={minutes}
                onChange={setMinutes}
                placeholder="45"
              />
            </div>
            {freeTextTime && !hours && !minutes && (
              <FieldDescription>
                Saved as “{freeTextTime}”.{" "}
                <button
                  type="button"
                  className="underline underline-offset-2 hover:text-foreground"
                  onClick={() => setFreeTextTime(undefined)}
                >
                  Clear
                </button>
              </FieldDescription>
            )}
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor={`${id}-tags`}>Tags</FieldLabel>
          <Input
            id={`${id}-tags`}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="dinner, quick"
          />
          <FieldDescription>Separate with commas.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor={`${id}-ing`}>Ingredients</FieldLabel>
          <Textarea
            id={`${id}-ing`}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows={6}
          />
          <FieldDescription>One per line.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor={`${id}-steps`}>Steps</FieldLabel>
          <Textarea
            id={`${id}-steps`}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            rows={6}
          />
          <FieldDescription>One per line.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor={`${id}-photo`}>Photo</FieldLabel>
          {shownImage ? (
            <div className="relative">
              <img src={shownImage} alt="" className="h-40 w-full rounded-xl object-cover" />
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="absolute top-2 right-2 rounded-full"
                onClick={() => setPhoto(initialImageUrl ? null : undefined)}
              >
                <XIcon />
                <span className="sr-only">Remove photo</span>
              </Button>
            </div>
          ) : (
            <label
              htmlFor={`${id}-photo`}
              className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-sm text-muted-foreground hover:bg-muted/50 has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
            >
              <ImagePlusIcon className="size-5" />
              Add a photo (optional)
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
        </Field>

        <div className="flex items-center justify-between gap-3 pt-1">
          {secondaryAction ?? <span />}
          <Button type="submit" size="lg" disabled={pending} className="rounded-full px-5">
            {pending && <Loader2Icon className="animate-spin" data-icon="inline-start" />}
            {pending ? "Saving…" : submitLabel}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}

function DurationInput({
  id,
  label,
  unit,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        aria-label={label}
        value={value}
        // Whole, non-negative numbers only.
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder={placeholder}
        className="[appearance:textfield] pr-9 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-sm text-muted-foreground">
        {unit}
      </span>
    </div>
  );
}
