import type { Lesson } from '@/models'

export const jsiLesson: Lesson = {
  id: 'lesson-jsi',
  moduleId: 'module-new-architecture-core',
  subjectId: 'jsi',
  order: 1,
  title: 'JSI in React Native',
  summary:
    'What the JavaScript Interface actually is, how it replaces the Bridge with direct synchronous ' +
    'calls, and how Fabric and TurboModules are both built on top of it.',
  difficulty: 'advanced',
  estimatedMinutes: 45,
  tags: ['react-native', 'jsi', 'architecture', 'hermes', 'performance'],
  quizId: 'quiz-jsi',
  relatedLessonIds: ['lesson-rn-bridge', 'lesson-hermes', 'lesson-fabric', 'lesson-turbomodules'],
  blocks: [
    { id: 'b1', type: 'heading', level: 2, text: 'What JSI is' },
    {
      id: 'b2',
      type: 'text',
      markdown:
        '**JSI (JavaScript Interface)** is a lightweight, general-purpose C++ API that lets native code ' +
        'hold direct references to JavaScript values and functions, and lets JavaScript hold direct ' +
        'references to native objects — **without going through any engine-specific API, and without ' +
        'serialization.** It is not tied to Hermes; it is an abstraction that any JS engine can implement ' +
        '(Hermes, JavaScriptCore, V8 all can sit behind it). React Native uses JSI as the foundation for ' +
        'Fabric and TurboModules.\n\n' +
        "The key word is **interface**. JSI itself doesn't do bridging, doesn't do rendering, and doesn't " +
        'define what a native module looks like — it just defines how JS and C++ can reach into each ' +
        "other's world directly. Everything built on top of it (TurboModules, Fabric) is a consumer of " +
        'this capability, not part of JSI itself.',
    },
    { id: 'b3', type: 'heading', level: 2, text: 'Recap: why the Bridge needed replacing' },
    {
      id: 'b4',
      type: 'text',
      markdown:
        "The classic Bridge (see the previous lesson) exists because JS and native code don't share " +
        'memory — so every call has to be serialized to JSON, queued, batched, and executed asynchronously, ' +
        'even for things that are conceptually instant. That async-only, serialize-everything design is ' +
        'the exact constraint JSI removes.',
    },
    {
      id: 'b5',
      type: 'quote',
      quote:
        "JSI doesn't eliminate the boundary between JS and native — it eliminates the need to serialize " +
        'across it.',
    },
    { id: 'b6', type: 'heading', level: 2, text: 'How JSI actually works' },
    {
      id: 'b7',
      type: 'text',
      markdown:
        "JS engines like Hermes already expose a C++ embedding API — that's how any JS engine gets " +
        'embedded into a host app at all. JSI standardizes a thin, engine-agnostic layer on top of that: ' +
        'a `jsi::Runtime` object represents the running JS VM, and through it, C++ code can:\n\n' +
        '- Create JS values (`jsi::Value`, `jsi::Object`, `jsi::Array`, `jsi::Function`) directly in the ' +
        'JS heap.\n' +
        '- Call JS functions from C++, synchronously, and get a real return value back — not a Promise.\n' +
        '- Expose C++ objects and functions *into* JS as if they were native JS objects, via HostObject ' +
        'and HostFunction (next section).\n\n' +
        "Because both sides are operating on the **same JS runtime and heap**, there's no copy, no JSON, " +
        'and no queue — a JSI call is a real function call on the call stack, same as calling any other ' +
        'JS function.',
    },
    {
      id: 'b8',
      type: 'heading',
      level: 2,
      text: 'HostObject: native data that looks like a JS object',
    },
    {
      id: 'b9',
      type: 'text',
      markdown:
        'A `HostObject` is a C++ class that JS code can interact with exactly like a plain JS object — ' +
        'reading properties, calling methods — except every property access is actually a call into C++. ' +
        'Nothing is copied into the JS heap up front; each access goes live to native.',
    },
    {
      id: 'b10',
      type: 'code',
      language: 'cpp',
      caption: 'A minimal HostObject exposing a native property to JS',
      code: `class DeviceInfoHostObject : public jsi::HostObject {
 public:
  jsi::Value get(jsi::Runtime& runtime, const jsi::PropNameID& name) override {
    auto propName = name.utf8(runtime);
    if (propName == "batteryLevel") {
      return jsi::Value(getNativeBatteryLevel());
    }
    return jsi::Value::undefined();
  }
};

// In JS, after installing this HostObject as a global:
// const level = NativeDeviceInfo.batteryLevel; // synchronous, direct native read`,
    },
    {
      id: 'b11',
      type: 'heading',
      level: 2,
      text: 'HostFunction: native logic callable as a JS function',
    },
    {
      id: 'b12',
      type: 'text',
      markdown:
        'A `HostFunction` is the function equivalent — a C++ function wrapped so JS can call it exactly ' +
        'like calling `someFn(args)`. This is the mechanism TurboModule methods are ultimately built on: ' +
        'a JS-callable function backed by native C++ (which itself may call into Objective-C/Swift or ' +
        'Java/Kotlin).',
    },
    {
      id: 'b13',
      type: 'code',
      language: 'cpp',
      caption: 'A HostFunction, installed as a synchronous native call',
      code: `auto multiply = jsi::Function::createFromHostFunction(
    runtime,
    jsi::PropNameID::forAscii(runtime, "multiply"),
    2, // arg count
    [](jsi::Runtime& rt, const jsi::Value&, const jsi::Value* args, size_t count) -> jsi::Value {
      double a = args[0].asNumber();
      double b = args[1].asNumber();
      return jsi::Value(a * b);
    });
runtime.global().setProperty(runtime, "nativeMultiply", multiply);

// In JS:
// const result = nativeMultiply(3, 4); // synchronous — returns 12 immediately, no Promise`,
    },
    {
      id: 'b14',
      type: 'warning',
      text:
        'Synchronous does not mean free. A HostFunction still runs on whichever thread called it — if ' +
        "it's invoked from the JS thread and does expensive work, it blocks the JS thread exactly like " +
        'any other synchronous JS call would. JSI removes serialization cost, not the cost of the work itself.',
    },
    { id: 'b15', type: 'heading', level: 2, text: 'How Hermes fits in' },
    {
      id: 'b16',
      type: 'text',
      markdown:
        'Hermes implements the JSI `Runtime` interface (it is one possible JS engine behind JSI, not part ' +
        'of JSI itself — JavaScriptCore can also sit behind the same interface). What Hermes contributes ' +
        'independently of JSI is discussed in its own lesson: ahead-of-time bytecode compilation, a ' +
        'startup-optimized garbage collector, and a smaller memory footprint. JSI is *how* native and JS ' +
        'talk directly; Hermes is a specific, RN-optimized engine that happens to sit on one side of that ' +
        'conversation. You could run JSI-based TurboModules and Fabric with JavaScriptCore instead of ' +
        'Hermes — the New Architecture does not require Hermes specifically, though Hermes is the default ' +
        'and the one most tuned for it.',
    },
    { id: 'b17', type: 'heading', level: 2, text: 'How TurboModules and Fabric build on JSI' },
    {
      id: 'b18',
      type: 'text',
      markdown:
        '- **TurboModules** are native modules whose methods are installed as HostFunctions, resolved ' +
        '**lazily** (only when first accessed from JS, unlike the old architecture which eagerly initialized ' +
        'every registered native module at startup) and callable **synchronously** when needed. Their method ' +
        'signatures are generated from a typed spec via Codegen, so the C++ glue code that installs the ' +
        'HostFunctions is generated, not hand-written.\n' +
        '- **Fabric** uses JSI to give the C++ rendering core direct access to the JS shadow tree ' +
        'representation, so layout and commit can happen synchronously between JS and the renderer instead ' +
        'of going through the async Bridge — this is what makes things like synchronous `measure()` and ' +
        'consistent event-to-render ordering possible.\n\n' +
        'Neither of these is "part of JSI" — they are systems that were *redesigned to be built on top of* ' +
        'the direct-access capability JSI provides.',
    },
    { id: 'b19', type: 'heading', level: 2, text: 'Advantages' },
    {
      id: 'b20',
      type: 'text',
      markdown:
        '- No serialization/deserialization cost for cross-language calls.\n' +
        '- Truly synchronous native calls where they make sense (measuring a view, reading a constant).\n' +
        '- Lazy native module initialization — faster app startup, since unused modules never load.\n' +
        '- A real, typed foundation (via Codegen) instead of "whatever shape the JSON happened to be."',
    },
    { id: 'b21', type: 'heading', level: 2, text: 'Tradeoffs' },
    {
      id: 'b22',
      type: 'text',
      markdown:
        '- Synchronous calls can block the calling thread — the discipline of "don\'t do slow work on a ' +
        'synchronous JSI call" now falls on library authors instead of being structurally enforced by an ' +
        'async-only Bridge.\n' +
        '- Native modules built for the old architecture need a migration path (interop layers exist, but ' +
        "it's not zero-cost in engineering time).\n" +
        '- Debugging crosses a real C++ boundary now — a crash inside a HostFunction shows up in native ' +
        'crash tooling, not just JS stack traces, so effective debugging requires comfort on both sides.',
    },
    { id: 'b23', type: 'heading', level: 2, text: 'Real libraries built on this' },
    {
      id: 'b24',
      type: 'real-world-example',
      title: 'react-native-reanimated',
      description:
        'Uses JSI directly to run animation worklets that read and write shared values without any ' +
        'round trip to the JS thread at all — the whole point of "UI thread animations" in Reanimated 2+ ' +
        'is bypassing the JS thread by using JSI to talk to a separate worklet runtime.',
    },
    {
      id: 'b25',
      type: 'real-world-example',
      title: 'react-native-mmkv',
      description:
        'Exposes a synchronous key-value store via a HostObject — `storage.getString(key)` returns a ' +
        'real value immediately, which is only possible because it skips the async Bridge entirely.',
    },
    { id: 'b26', type: 'heading', level: 2, text: 'Common misconceptions' },
    {
      id: 'b27',
      type: 'text',
      markdown:
        '- **"JSI is the New Architecture."** No — JSI is the low-level capability. Fabric and TurboModules ' +
        'are the systems built with it; together with Codegen they make up what "New Architecture" refers to.\n' +
        '- **"JSI is a Hermes feature."** No — Hermes implements the JSI interface; JSI itself is engine-agnostic.\n' +
        '- **"Synchronous JSI calls are always faster."** They remove serialization overhead, but a slow ' +
        'synchronous native call still blocks the caller — sync is not a synonym for fast.',
    },
    { id: 'b28', type: 'heading', level: 2, text: 'Interview questions' },
    {
      id: 'b29',
      type: 'text',
      markdown:
        '1. What problem does JSI solve that the Bridge could not?\n' +
        '2. What is the difference between a HostObject and a HostFunction?\n' +
        '3. Is JSI specific to Hermes? Why or why not?\n' +
        '4. Why can a JSI-based native call be synchronous when a Bridge call could not be?\n' +
        '5. Name a real tradeoff introduced by allowing synchronous native calls.',
    },
    { id: 'b30', type: 'heading', level: 2, text: 'Practical exercise' },
    {
      id: 'b31',
      type: 'text',
      markdown:
        'Without writing any code, sketch out: you need a native module that reads a device setting ' +
        '(e.g. "is dark mode enabled at the OS level") and the value must be available the instant a ' +
        'component renders, with no loading state. Would you reach for a TurboModule method backed by a ' +
        'synchronous HostFunction, or an async Bridge-era native module? Write down your reasoning — what ' +
        'would break if you chose async here, and what would you need to be careful about if you chose sync?',
    },
    {
      id: 'b32',
      type: 'doc-reference',
      source: 'React Native',
      href: 'https://reactnative.dev/architecture/glossary#javascript-interface-jsi',
      label: 'React Native Architecture Glossary: JSI',
    },
  ],
}
