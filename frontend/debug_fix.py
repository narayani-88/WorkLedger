
import os

path = r"e:\narayani-java\Saas\frontend\src\App.jsx"

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")
found = False
for i in range(len(lines)):
    line = lines[i]
    if i > 830 and i < 850:
        print(f"Examining line {i+1}: {repr(line)}")
        if line.strip() == ")" and "renderTeams" not in line:
            print(f"MATCH! Inserting div before line {i+1}")
            lines.insert(i, "    </div>\n")
            found = True
            break

if found:
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("SUCCESS")
else:
    print("FAILURE: Could not find the closing parenthesis.")
