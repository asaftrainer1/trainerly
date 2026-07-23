// ==================== STATE ====================
const [adding, setAdding] = React.useState(false);
const [name, setName] = React.useState("");
const [sets, setSets] = React.useState("3");
const [reps, setReps] = React.useState("8-12");
const [targetWeight, setTargetWeight] = React.useState(""); // שם טוב יותר
const [tempo, setTempo] = React.useState(""); // חדש
const [restSeconds, setRestSeconds] = React.useState(""); // חדש
const [rir, setRir] = React.useState(""); // חדש
const [category, setCategory] = React.useState<"warmup" | "main" | "cardio" | "stretching">("main"); // חדש

// ==================== RESET ====================
const resetForm = () => {
  setName("");
  setSets("3");
  setReps("8-12");
  setTargetWeight("");
  setTempo("");
  setRestSeconds("");
  setRir("");
  setCategory("main");
};

// ==================== HANDLE ADD ====================
const handleAdd = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!name.trim()) return;
  try {
    await createExercise.mutateAsync({
      workout_id: workout.id,
      program_id: programId,
      exercise_name: name.trim(),
      sets: Number(sets) || 3,
      reps: reps.trim() || "8-12",
      target_weight: targetWeight ? Number(targetWeight) : undefined, // המשקל!
      tempo: tempo.trim() || undefined,
      rest_seconds: restSeconds ? Number(restSeconds) : undefined,
      rir: rir ? Number(rir) : undefined,
      category: category,
      day_number: workout.day_number || 1,
      exercise_order: workout.exercises.length + 1,
      order_index: workout.exercises.length,
    });
    resetForm();
  } catch (err) {
    toast({
      variant: "destructive",
      title: "Couldn't add exercise",
      description: err instanceof Error ? err.message : "Please try again.",
    });
  }
};

// ==================== FORM JSX ====================
return (
  <>
    {adding ? (
      <form onSubmit={handleAdd} className="flex-wrap items-center gap-2 rounded-lg border border-bg-secondary/48 p-2">
        {/* Exercise Name */}
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Exercise name"
          className="h-8 w-14 text-center"
          autoFocus
        />

        {/* Category Dropdown - חדש! */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
          className="h-8 rounded border border-bg-secondary bg-bg-primary px-2 text-xs"
        >
          <option value="warmup">Warmup</option>
          <option value="main">Main</option>
          <option value="cardio">Cardio</option>
          <option value="stretching">Stretching</option>
        </select>

        {/* Sets */}
        <Input
          value={sets}
          onChange={(e) => setSets(e.target.value)}
          placeholder="Sets"
          className="h-8 w-12 text-center"
        />

        {/* Reps */}
        <Input
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          placeholder="Reps"
          className="h-8 w-16 text-center"
        />

        {/* Target Weight - זה החדש והחשוב! */}
        <Input
          value={targetWeight}
          onChange={(e) => setTargetWeight(e.target.value)}
          placeholder="kg"
          type="number"
          className="h-8 w-16 text-center"
        />

        {/* Tempo - חדש */}
        <Input
          value={tempo}
          onChange={(e) => setTempo(e.target.value)}
          placeholder="Tempo"
          className="h-8 w-16 text-center"
          title="Example: 3-1-2"
        />

        {/* Rest Seconds - חדש */}
        <Input
          value={restSeconds}
          onChange={(e) => setRestSeconds(e.target.value)}
          placeholder="Rest"
          type="number"
          className="h-8 w-14 text-center"
          title="Seconds"
        />

        {/* RIR - חדש */}
        <Input
          value={rir}
          onChange={(e) => setRir(e.target.value)}
          placeholder="RIR"
          type="number"
          className="h-8 w-12 text-center"
          title="Reps in Reserve"
        />

        {/* Submit Button */}
        <Button type="submit" size="sm" disabled={createExercise.isPending || !name.trim()}>
          Add
        </Button>

        {/* Cancel Button */}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setAdding(false);
            resetForm();
          }}
        >
          Done
        </Button>
      </form>
    ) : (
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => setAdding(true)}
      >
        <Plus className="h-4 w-4" />
        Add exercise
      </Button>
    )}
  </>
);