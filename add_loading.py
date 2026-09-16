import os
import glob
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
        
    if 'isLoading' not in content or 'Spinner' not in content:
        return
        
    if 'LoadingProgress' in content:
        return # already added
        
    print(f"Processing {filepath}")
    
    # 1. Add LoadingProgress to import from '@/components/ui'
    content = re.sub(
        r"(import\s+\{[^}]*?)(\}\s+from\s+['\"]@/components/ui['\"])",
        r"\1, LoadingProgress\2",
        content
    )
    
    # 2. Find the if (isLoading) { return (...) } block and the main return
    pattern = re.compile(
        r"(\s*)if\s*\(\s*isLoading\s*\)\s*\{\s*return\s*\(\s*<div[^>]*>\s*<Spinner[^>]*/>\s*</div>\s*\);\s*\}\s*(.*?)\s*return\s*\(\s*(<div.*?)\);\s*\}",
        re.DOTALL
    )
    
    def replacer(match):
        indent = match.group(1)
        between = match.group(2)
        main_div = match.group(3)
        
        # We need to properly close the main_div wrapper and the React fragment
        # Since main_div goes until the end of the return statement before the final ); }
        
        new_return = f"""{indent}{between}
{indent}return (
{indent}  <>
{indent}    <LoadingProgress isLoading={{isLoading}} />
{indent}    {{isLoading ? (
{indent}      <div className="flex justify-center py-12">
{indent}        <Spinner size="lg" />
{indent}      </div>
{indent}    ) : (
{indent}      {main_div}
{indent}    )}}
{indent}  </>
{indent});
}}"""
        return new_return

    new_content = pattern.sub(replacer, content)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('frontend/app/admin'):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))

for root, dirs, files in os.walk('frontend/app/dealer'):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))

