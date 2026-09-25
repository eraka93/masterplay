import type { Lesson } from '@/models'

export const javascriptEventLoopLesson: Lesson = {
  id: 'lesson-js-event-loop',
  moduleId: 'module-js-execution-model',
  subjectId: 'javascript-deep-dive',
  order: 1,
  title: 'The JavaScript Event Loop',
  summary:
    'How a single-threaded language runs async code without blocking — call stack, task queue, ' +
    'and microtasks, with the details that actually show up in interviews and real bugs.',
  difficulty: 'foundational',
  estimatedMinutes: 25,
  tags: ['javascript', 'event-loop', 'async'],
  quizId: 'quiz-js-event-loop',
  blocks: [
    {
      id: 'b1',
      type: 'heading',
      level: 2,
      text: 'JavaScript is single-threaded — so how does async work?',
    },
    {
      id: 'b2',
      type: 'text',
      markdown:
        'JavaScript runs on **one call stack**. It can only do one thing at a time. And yet you can ' +
        'fire a network request, keep scrolling a list, and have the response handled later without ' +
        'freezing the UI. The event loop is the mechanism that makes that possible — not by running ' +
        'things in parallel, but by carefully scheduling *when* queued work gets a turn on that one stack.',
    },
    { id: 'b3', type: 'heading', level: 2, text: 'The four pieces' },
    {
      id: 'b4',
      type: 'text',
      markdown:
        '- **Call stack** — synchronous execution, one frame at a time.\n' +
        '- **Web/Native APIs** — `setTimeout`, network requests, timers: these run *outside* JS, ' +
        'in the host environment (the browser, or the RN native runtime).\n' +
        '- **Callback (macrotask) queue** — where `setTimeout` callbacks, I/O callbacks, and UI events land.\n' +
        '- **Microtask queue** — where resolved Promise `.then()` callbacks and `queueMicrotask` land. ' +
        'Higher priority than the macrotask queue.',
    },
    {
      id: 'b5',
      type: 'diagram',
      title: 'One tick of the event loop',
      nodes: [
        'Call stack empties',
        'Drain the entire microtask queue',
        'Render/paint if applicable',
        'Take exactly one macrotask',
        'Back to call stack',
      ],
      description:
        'The microtask queue is fully drained — including microtasks queued by other microtasks — before a single macrotask runs.',
    },
    { id: 'b6', type: 'heading', level: 2, text: 'The classic gotcha' },
    {
      id: 'b7',
      type: 'code',
      language: 'javascript',
      caption: 'What order does this log in?',
      code: `console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');`,
    },
    {
      id: 'b8',
      type: 'text',
      markdown:
        'Output: `1, 4, 3, 2`. Synchronous code (`1`, `4`) always finishes first. Then the microtask ' +
        '(`3`) runs before the macrotask (`2`) — even though the timeout was scheduled with a 0ms delay. ' +
        '`setTimeout(fn, 0)` never means "run immediately"; it means "run after the current synchronous ' +
        'code and all pending microtasks."',
    },
    {
      id: 'b9',
      type: 'warning',
      text:
        'A microtask that keeps scheduling more microtasks (e.g. a Promise chain that recursively ' +
        'resolves itself) can starve the macrotask queue indefinitely — timers and rendering never get ' +
        'a turn. This is a real production bug pattern, not just a trivia question.',
    },
    { id: 'b10', type: 'heading', level: 2, text: 'Why this matters on React Native specifically' },
    {
      id: 'b11',
      type: 'text',
      markdown:
        "React Native's JS thread has its own event loop, separate from the UI thread. Long-running " +
        'synchronous JS work — a heavy `.map()`/`.filter()` chain, JSON.parse of a huge payload — blocks ' +
        'that call stack the same way it would in a browser tab, and nothing else on the JS thread (event ' +
        'handlers, state updates) can run until it finishes. This is one of the most common root causes of ' +
        '"my app feels janky" reports that turn out to have nothing to do with rendering at all.',
    },
    {
      id: 'b12',
      type: 'question',
      prompt:
        'A screen fetches data, then immediately schedules three chained `.then()` calls to transform ' +
        'it before setting state. A `setTimeout(..., 0)` elsewhere is meant to hide a spinner right after. ' +
        'Which finishes first: the spinner hide, or the third `.then()`?',
      discussion:
        'The third `.then()` — all three are microtasks and the full microtask queue drains before the ' +
        'macrotask queue gets a single turn, regardless of how many microtasks are queued.',
    },
    {
      id: 'b13',
      type: 'tip',
      text:
        'When debugging "why did this run in the wrong order," first classify each piece of code as ' +
        'sync, microtask, or macrotask — the answer is almost always determined by that classification alone.',
    },
  ],
}
