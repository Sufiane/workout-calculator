import { globalIgnores } from 'eslint/config';


import eslint from '@eslint/js';
import tsEslint from 'typescript-eslint';

export default tsEslint.config(
    globalIgnores(['dist/*', 'worker-configuration.d.ts']),
    eslint.configs.recommended,
    tsEslint.configs.recommended,
    {
        rules: {
            "no-console": "error",
        }
    }
);
