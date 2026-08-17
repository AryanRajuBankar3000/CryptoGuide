// This script copies and converts TSX components to JSX
const fs = require('fs');
const path = require('path');

const srcBase = path.join(__dirname, 'crypto_UI');
const destBase = __dirname;

const files = [
  // UI primitives
  ['components/crypto/ui/primitives.tsx', 'app/components/crypto/ui/primitives.jsx'],
  ['components/crypto/ui/stepper.tsx', 'app/components/crypto/ui/stepper.jsx'],
  // Core
  ['components/crypto/experience.tsx', 'app/components/crypto/experience.jsx'],
  ['components/crypto/landing.tsx', 'app/components/crypto/landing.jsx'],
  ['components/crypto/platform.tsx', 'app/components/crypto/platform.jsx'],
  ['components/crypto/store.tsx', 'app/components/crypto/store.jsx'],
  // Steps
  ['components/crypto/steps/objectives.tsx', 'app/components/crypto/steps/objectives.jsx'],
  ['components/crypto/steps/context.tsx', 'app/components/crypto/steps/context.jsx'],
  ['components/crypto/steps/review.tsx', 'app/components/crypto/steps/review.jsx'],
  ['components/crypto/steps/analysis.tsx', 'app/components/crypto/steps/analysis.jsx'],
  ['components/crypto/steps/recommendation.tsx', 'app/components/crypto/steps/recommendation.jsx'],
  // Sections
  ['components/crypto/sections/assistant.tsx', 'app/components/crypto/sections/assistant.jsx'],
  ['components/crypto/sections/knowledge-base.tsx', 'app/components/crypto/sections/knowledge-base.jsx'],
  ['components/crypto/sections/settings.tsx', 'app/components/crypto/sections/settings.jsx'],
  // Recommendation
  ['components/crypto/recommendation/posture.tsx', 'app/components/crypto/recommendation/posture.jsx'],
  ['components/crypto/recommendation/architecture-map.tsx', 'app/components/crypto/recommendation/architecture-map.jsx'],
  ['components/crypto/recommendation/compare.tsx', 'app/components/crypto/recommendation/compare.jsx'],
  ['components/crypto/recommendation/use-case-summary.tsx', 'app/components/crypto/recommendation/use-case-summary.jsx'],
  ['components/crypto/recommendation/crypto-detail-card.tsx', 'app/components/crypto/recommendation/crypto-detail-card.jsx'],
];

for (const [src, dest] of files) {
  const srcPath = path.join(srcBase, src);
  const destPath = path.join(destBase, dest);

  let content = fs.readFileSync(srcPath, 'utf-8');

  // Remove TypeScript type imports
  content = content.replace(/import\s+type\s+\{[^}]*\}\s+from\s+['"][^'"]+['"]\s*;?\n?/g, '');

  // Remove type annotations from function params: ({ x, y }: { ... }) => ({ x, y })
  content = content.replace(/\(\{([^}]+)\}\s*:\s*\{[^}]*\}\)/g, '({ $1 })');

  // Remove simple type annotations: (x: Type) => (x)
  content = content.replace(/:\s*(string|number|boolean|React\.ReactNode|React\.KeyboardEvent<[^>]*>|React\.MouseEvent|Step|Tab|View)\b/g, '');

  // Remove generic type params: useState<Type>() => useState()
  content = content.replace(/<(Tab|Step|View|Message\[\]|string\[\]|string|boolean|string \| null|Selections|\(typeof FILTERS\)\[number\]|StoreValue|Settings)>/g, '');

  // Remove type assertions: as Partial<Settings>
  content = content.replace(/\s+as\s+Partial<Settings>/g, '');

  // Remove Readonly<{ children: React.ReactNode }> wrapper
  content = content.replace(/Readonly<\{\s*children\s*\}>/g, '{ children }');

  // Fix import paths: @/lib/ -> @/lib/ (same), @/components/ -> @/app/components/
  // Actually, we need to fix the relative imports from the new location
  content = content.replace(/@\/lib\/crypto\//g, '@/lib/crypto/');
  content = content.replace(/@\/lib\/utils/g, '@/lib/utils');

  // Remove : type LucideIcon from lucide imports
  content = content.replace(/,\s*type\s+LucideIcon/g, '');

  // Remove type keyword from ROWS definition
  content = content.replace(/const ROWS:\s*\{[^}]*\}\[\]\s*=/g, 'const ROWS =');

  // Fix specific type annotations in TOGGLES
  content = content.replace(/const TOGGLES:\s*\{[^}]*\}\[\]\s*=/g, 'const TOGGLES =');

  // Fix VIEWS type
  content = content.replace(/const VIEWS:\s*\{[^}]*\}\[\]\s*=/g, 'const VIEWS =');

  // Fix FILTERS as const
  content = content.replace(/ as const/g, '');

  // Remove remaining inline type annotations in destructuring
  content = content.replace(/:\s*ContextState/g, '');
  content = content.replace(/:\s*Recommendation \| null/g, '');
  content = content.replace(/:\s*Selections/g, '');
  content = content.replace(/:\s*Settings/g, '');
  content = content.replace(/:\s*ToggleKey/g, '');
  content = content.replace(/:\s*ButtonVariant/g, '');

  // Clean up createContext<StoreValue | null>(null)
  content = content.replace(/createContext<StoreValue \| null>/g, 'createContext');

  // Clean up useContext return
  content = content.replace(/const ctx = useContext\(StoreContext\)/g, 'const ctx = useContext(StoreContext)');

  // Clean up useMemo<StoreValue>
  content = content.replace(/useMemo<StoreValue>/g, 'useMemo');

  // Remove Record type annotations
  content = content.replace(/const ICONS:\s*Record<[^>]+>\s*=/g, 'const ICONS =');
  content = content.replace(/const STATUS_STYLES:\s*Record<[^>]+>\s*=/g, 'const STATUS_STYLES =');
  content = content.replace(/const STEP_LABELS:\s*Record<[^>]+>\s*=/g, 'const STEP_LABELS =');

  // Remove type declarations
  content = content.replace(/^type\s+\w+\s*=\s*[^;]+;\s*$/gm, '');
  content = content.replace(/^export type\s+\w+\s*=\s*[^;]+;\s*$/gm, '');

  // Remove multiline type blocks
  content = content.replace(/^type\s+\w+\s*=\s*\{[\s\S]*?^\}$/gm, '');

  // Remove : (key 'hwAccel' | 'regulatory' | 'performance', value) patterns
  content = content.replace(/:\s*'hwAccel' \| 'regulatory' \| 'performance'/g, '');

  // Remove remaining TypeScript-specific constructs
  content = content.replace(/\bReadonly<\{/g, '({');

  // Clean up double spaces/empty lines caused by removals
  content = content.replace(/\n{3,}/g, '\n\n');

  fs.writeFileSync(destPath, content, 'utf-8');
  console.log(`✓ ${dest}`);
}

console.log('\nAll components converted successfully!');
