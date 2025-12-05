const fs = require('fs');
const path = require('path');

function removeNonTitleComments(content) {
    const lines = content.split('\n');
    const result = [];
    let inMultiLineComment = false;
    let multiLineCommentLines = [];
    let isDocBlock = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (trimmed.startsWith('/**')) {
            inMultiLineComment = true;
            isDocBlock = true;
            multiLineCommentLines = [line];
            continue;
        }

        if (trimmed.startsWith('/*') && !trimmed.startsWith('/**')) {
            inMultiLineComment = true;
            isDocBlock = false;
            multiLineCommentLines = [line];
            continue;
        }

        if (inMultiLineComment) {
            multiLineCommentLines.push(line);
            if (trimmed.endsWith('*/')) {
                inMultiLineComment = false;
                if (isDocBlock) {
                    result.push(...multiLineCommentLines);
                }
                multiLineCommentLines = [];
                isDocBlock = false;
            }
            continue;
        }

        const commentIndex = line.indexOf('//');
        if (commentIndex !== -1) {
            const codeBeforeComment = line.substring(0, commentIndex);
            const hasCode = codeBeforeComment.trim().length > 0;

            if (hasCode) {
                result.push(codeBeforeComment.trimEnd());
            }
        } else {
            result.push(line);
        }
    }

    return result.join('\n');
}

function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const processed = removeNonTitleComments(content);
        fs.writeFileSync(filePath, processed, 'utf8');
        console.log(`Processed: ${filePath}`);
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

function processDirectory(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('dist')) {
                processDirectory(filePath, extensions);
            }
        } else if (extensions.some(ext => file.endsWith(ext))) {
            if (!file.includes('.test.') && !file.includes('.spec.')) {
                processFile(filePath);
            }
        }
    }
}

const backendSrc = path.join(__dirname, 'src');
const frontendSrc = path.join(__dirname, '../frontend/src');

console.log('Processing backend files...');
processDirectory(backendSrc);

console.log('\nProcessing frontend files...');
processDirectory(frontendSrc);

console.log('\nDone!');
