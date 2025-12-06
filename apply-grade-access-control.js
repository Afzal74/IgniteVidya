const fs = require('fs');
const path = require('path');

// List of grade pages to update
const gradePages = [
  { path: 'app/grade/9/page.tsx', grade: 9 },
  { path: 'app/grade/10/page.tsx', grade: 10 },
  { path: 'app/grade/11/page.tsx', grade: 11 },
  { path: 'app/grade/12/page.tsx', grade: 12 },
  { path: 'app/grade/6/mathematics/page.tsx', grade: 6 },
  { path: 'app/grade/6/science/page.tsx', grade: 6 },
  { path: 'app/grade/6/social-studies/page.tsx', grade: 6 }
];

function updateGradePage(filePath, grade) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already has GradeAccessGuard
    if (content.includes('GradeAccessGuard')) {
      console.log(`Already protected: ${filePath}`);
      return;
    }

    // Add import
    const importRegex = /^(import.*from.*["']framer-motion["'];?\s*$)/m;
    if (importRegex.test(content)) {
      content = content.replace(
        importRegex,
        '$1\nimport GradeAccessGuard from "@/components/grade-access-guard";'
      );
    } else {
      // Fallback: add after last import
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const nextLineIndex = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, nextLineIndex + 1) + 
                 'import GradeAccessGuard from "@/components/grade-access-guard";\n' + 
                 content.slice(nextLineIndex + 1);
      }
    }

    // Wrap return statement
    const returnRegex = /(\s+return \(\s*<div className="min-h-screen[^>]*>)/;
    if (returnRegex.test(content)) {
      content = content.replace(
        returnRegex,
        `$1\n    <GradeAccessGuard requiredGrade={${grade}}>\n      <div className="min-h-screen bg-white dark:bg-black">`
      );
    }

    // Close the guard before the last closing tags
    const endRegex = /(\s+<\/div>\s+<\/section>\s+<\/div>\s+\)\s+})/;
    if (endRegex.test(content)) {
      content = content.replace(
        endRegex,
        '$1\n      </div>\n    </GradeAccessGuard>\n  )\n}'
      );
    }

    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath} with Grade ${grade} access control`);
    
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

// Apply to all grade pages
gradePages.forEach(({ path: filePath, grade }) => {
  updateGradePage(filePath, grade);
});

console.log('Grade access control application complete!');