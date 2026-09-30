const fs = require('fs');

const path = './src/components/SuperAdmin.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove state variables
content = content.replace(/  const \[autoCloseTime, setAutoCloseTime\] = useState\(''\);\n  const \[savingAutoClose, setSavingAutoClose\] = useState\(false\);\n/, '');

// 2. Remove setting it from docSnap
content = content.replace(/        setAutoCloseTime\(docSnap\.data\(\)\.autoCloseTime \|\| ''\);\n/, '');

// 3. Remove handleSaveAutoClose function
const handleSaveRegex = /  const handleSaveAutoClose = async \(time\) => \{[\s\S]*?  \};\n\n/;
content = content.replace(handleSaveRegex, '');

// 4. Revert Monitor card header
const monitorHeaderRegex = /<div className="flex items-center gap-1\.5 bg-slate-50 px-2\.5 py-1\.5 rounded-lg border border-slate-200">[\s\S]*?<\/div>\n                <\/div>/;
const monitorHeaderReplace = `</div>`;
content = content.replace(monitorHeaderRegex, monitorHeaderReplace);

// Remove the remaining <div className="flex items-center justify-between mb-1"> wrapper since we removed the right side.
// Originally it was just:
/*
<div className="flex items-center gap-2 mb-1">
  <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
  </svg>
  <h3 className="font-bold text-slate-900 text-base">Monitor</h3>
</div>
*/

const oldHeaderRegex = /<div className="flex items-center justify-between mb-1">\s*<div className="flex items-center gap-2">\s*<svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">\s*<path d="M9\.75 17L9 20l-1 1h8l-1-1-\.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><\/path>\s*<\/svg>\s*<h3 className="font-bold text-slate-900 text-base">Monitor<\/h3>\s*<\/div>\s*<\/div>/;

const oldHeaderReplace = `<div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                  <h3 className="font-bold text-slate-900 text-base">Monitor</h3>
                </div>`;
content = content.replace(oldHeaderRegex, oldHeaderReplace);

fs.writeFileSync(path, content, 'utf8');
