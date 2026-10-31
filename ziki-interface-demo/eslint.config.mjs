import {defineConfig} from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
export default defineConfig([
 ...nextVitals,
 {ignores:['.next/**','node_modules/**','demo/docs.tsx','components/**','lib/**','app/actions/**','app/(app)/**','demo/dashboard-original.jsx']},
 {files:['demo/**/*.{jsx,mjs}'],rules:{'react-hooks/set-state-in-effect':'off','react-hooks/refs':'off','react-hooks/preserve-manual-memoization':'off'}},
]);
