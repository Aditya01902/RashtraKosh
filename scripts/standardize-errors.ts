import fs from 'fs';
import path from 'path';

const apiDir = path.join(process.cwd(), 'app', 'api');

function processDirectory(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (file === 'route.ts') {
            let content = fs.readFileSync(fullPath, 'utf8');

            // Check if file uses NextResponse('Internal Error')
            if (content.includes('new NextResponse("Internal Error"')) {
                // Add import if not present
                if (!content.includes('handleApiError')) {
                    const importStatement = "import { handleApiError } from '@/lib/api-response';\n";

                    // Add after the last import
                    const lines = content.split('\n');
                    const lastImportIndex = lines.reduce((acc, line, i) => line.startsWith('import ') ? i : acc, 0);
                    lines.splice(lastImportIndex + 1, 0, importStatement);
                    content = lines.join('\n');
                }

                // Replace error return
                content = content.replace(/return new NextResponse\(\"Internal Error\"\, \{ status\: 500 \}\)\;/g, 'return handleApiError(error);');

                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDirectory(apiDir);
console.log('Done.');
