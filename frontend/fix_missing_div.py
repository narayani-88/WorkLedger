
import os

path = r"e:\narayani-java\Saas\frontend\src\App.jsx"

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# We want to find the line that ends renderTeams
# Looking at previous view:
# 838:         </div>
# 839:       </div>
# 840:       )

found = False
for i in range(len(lines) - 1, 600, -1):
    if "const renderEmployees" in lines[i]:
        # The line before should be ) or similar
        for j in range(i-1, i-5, -1):
            if ")" in lines[j] and "renderTeams" not in lines[j]:
                print(f"Found function end at line {j+1}: {repr(lines[j])}")
                # Replace with two closures and then )
                # Wait, we already have two </div> (838, 839). 
                # We need one MORE.
                # So before the ) line, we add one more </div>
                lines.insert(j, "    </div>\n")
                found = True
                break
    if found:
        break

if found:
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Successfully inserted missing </div>")
else:
    print("Could not find insertion point.")
