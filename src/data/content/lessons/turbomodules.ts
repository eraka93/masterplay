import type { Lesson } from '@/models'

export const turboModulesLesson: Lesson = {
  id: 'lesson-turbomodules',
  moduleId: 'module-new-architecture-core',
  subjectId: 'turbomodules',
  order: 1,
  title: 'TurboModules',
  summary: 'Lazily-loaded, JSI-backed native modules with typed, generated interfaces.',
  difficulty: 'advanced',
  estimatedMinutes: 20,
  tags: ['turbomodules', 'jsi', 'react-native'],
  relatedLessonIds: ['lesson-jsi'],
  blocks: [
    { id: 'b1', type: 'heading', level: 2, text: 'What changed from classic native modules' },
    {
      id: 'b2',
      type: 'text',
      markdown:
        'Classic native modules were eagerly instantiated at app startup — every registered module ' +
        'initialized whether or not the app ever used it, and every method call was serialized across the ' +
        'Bridge. TurboModules fix both: methods are installed as JSI HostFunctions (see the JSI lesson), ' +
        'and modules are only initialized **the first time JS actually references them.**',
    },
    { id: 'b3', type: 'heading', level: 2, text: 'Typed specs, generated glue code' },
    {
      id: 'b4',
      type: 'text',
      markdown:
        'A TurboModule starts as a TypeScript (or Flow) interface describing its methods and types. ' +
        'Codegen reads that spec at build time and generates the native interface/glue code that wires ' +
        'each method to a HostFunction — the hand-written boilerplate that used to define the shape of a ' +
        'native module by convention is now generated and checked against a real type.',
    },
    {
      id: 'b5',
      type: 'code',
      language: 'typescript',
      caption: 'A TurboModule spec — the source Codegen reads',
      code: `import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  getBatteryLevel(): number;
  multiply(a: number, b: number): number;
}

export default TurboModuleRegistry.getEnforcing<Spec>('SampleTurboModule');`,
    },
    {
      id: 'b6',
      type: 'diagram',
      title: 'From spec to callable JS function',
      nodes: [
        'TS/Flow spec',
        'Codegen',
        'Generated native interface',
        'HostFunction installed via JSI',
        'Callable from JS',
      ],
    },
    {
      id: 'b7',
      type: 'tip',
      text:
        'Lazy loading is a real, measurable startup win for apps with many native modules — modules for ' +
        'a screen the user never visits this session simply never initialize.',
    },
  ],
}
