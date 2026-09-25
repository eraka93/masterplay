import type { Lesson } from '@/models'

export const reactNativeBridgeLesson: Lesson = {
  id: 'lesson-rn-bridge',
  moduleId: 'module-rn-architecture-classic',
  subjectId: 'react-native-architecture',
  order: 1,
  title: 'The Classic React Native Bridge',
  summary:
    'Why the original architecture worked the way it did, and exactly what made it a bottleneck — ' +
    'the context the New Architecture exists to fix.',
  difficulty: 'intermediate',
  estimatedMinutes: 25,
  tags: ['react-native', 'architecture', 'bridge'],
  relatedLessonIds: ['lesson-jsi'],
  blocks: [
    {
      id: 'b1',
      type: 'heading',
      level: 2,
      text: 'Three threads, three languages, no shared memory',
    },
    {
      id: 'b2',
      type: 'text',
      markdown:
        'Classic React Native runs three separate worlds:\n\n' +
        '- **JS thread** — your application code, running on JavaScriptCore or Hermes.\n' +
        '- **Native/UI thread(s)** — real `UIView`/`View` instances, the actual rendering.\n' +
        '- **Shadow thread** — runs Yoga (flexbox) layout calculations off the UI thread.\n\n' +
        "These don't share memory. A JS object cannot simply be handed to native code — there is no " +
        'shared address space between a JS engine and Objective-C/Java/Kotlin.',
    },
    {
      id: 'b2b',
      type: 'heading',
      level: 2,
      text: 'The Bridge: an async, serializing, batched message queue',
    },
    {
      id: 'b3',
      type: 'text',
      markdown:
        'The Bridge solved the no-shared-memory problem the only way available: every cross-language ' +
        'call gets **serialized to JSON**, placed on a **queue**, and flushed in **batches** at the end ' +
        'of a JS event loop tick. Native reads the JSON, deserializes it, and performs the real work — ' +
        "then serializes any return data back the same way. Nothing is synchronous, because you can't " +
        'block one thread waiting on a queue drain and a deserialize on another.',
    },
    {
      id: 'b4',
      type: 'diagram',
      title: 'One round trip through the Bridge',
      nodes: [
        'JS calls a native method',
        'Arguments serialized to JSON',
        'Message queued',
        'Batch flushed to native at end of tick',
        'Native deserializes + executes',
        'Result serialized back',
        'JS callback invoked on next tick',
      ],
    },
    { id: 'b5', type: 'heading', level: 2, text: 'Where this actually hurt' },
    {
      id: 'b6',
      type: 'text',
      markdown:
        '- **Serialization cost scales with payload size.** Passing a large list or a big base64 image ' +
        'string across the bridge was measurably expensive — real cost, not superstition.\n' +
        '- **Everything is async**, even things that are conceptually synchronous (reading a native ' +
        'constant, checking a permission). That forces awkward Promise-wrapping for simple calls.\n' +
        '- **No backpressure.** A flood of events (e.g. a fast-scrolling gesture reporting position on ' +
        'every frame) could queue up faster than native could drain it, and the batching itself added a ' +
        'frame or more of latency between "user touched screen" and "native received it."\n' +
        '- **Type safety was not enforced end-to-end.** JSON has no way to guarantee the native side gets ' +
        'the shape JS thinks it sent.',
    },
    {
      id: 'b7',
      type: 'code',
      language: 'javascript',
      caption: 'A native module call — looks synchronous, is not',
      code: `// This reads like a normal function call, but under the hood: serialize args,
// queue, batch-flush, native executes, serialize result, deserialize on JS thread,
// resolve the promise — multiple event-loop ticks later.
const isAvailable = await SomeNativeModule.checkAvailability();`,
    },
    {
      id: 'b8',
      type: 'tip',
      text:
        'The Bridge was a reasonable design for 2015-era JS engines and mobile hardware. The New ' +
        'Architecture is not "the Bridge was a mistake" — it is "JSI removes a constraint (no shared ' +
        'runtime access) that no longer has to be there."',
    },
    { id: 'b9', type: 'heading', level: 2, text: 'What replaces it' },
    {
      id: 'b10',
      type: 'text',
      markdown:
        'JSI gives JS direct, synchronous references to native objects and functions — no serialization, ' +
        'no queue, no batching required. See the JSI lesson for exactly how that works and what it trades off.',
    },
    {
      id: 'b11',
      type: 'link',
      href: '/learn/subject/jsi',
      label: 'Continue to: JSI',
      description: 'How direct JS-to-native calls actually work under the New Architecture.',
    },
  ],
}
