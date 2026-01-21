
import os

path = r"e:\narayani-java\Saas\frontend\src\App.jsx"

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

found = False
for i, line in enumerate(lines[835:845], 835):
    if line.strip() == ")":
        print(f"Found closing paren at line {i+1}: {repr(line)}")
        # Insert </div> before )
        lines.insert(i, "    </div>\n")
        found = True
        break

if found:
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Successfully inserted final missing </div>")
else:
    print("Could not find insertion point near line 841.")
