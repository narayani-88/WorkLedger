
import os

path = r"e:\narayani-java\Saas\frontend\src\App.jsx"

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Normalize lines
lines = [line.rstrip() + '\n' for line in lines]

# Find the end of renderTeams
found = False
for i in range(len(lines)):
    if "const renderEmployees" in lines[i]:
        # We look backwards to find the closing )
        for j in range(i-1, 0, -1):
            if ")" in lines[j] and "=>" not in lines[j]:
                print(f"Syncing at line {j+1}")
                # Ensure we have exactly three </div> before the )
                # Wait, I'll just rewrite the block from 835 to 845
                found_idx = j
                break
        if found: break

# Actually, I'll just find the exact line and replace it
new_lines = []
for i, line in enumerate(lines):
    if "const renderEmployees" in line:
        # Before this line, we want to ensure everything is closed.
        # I'll backtrack and replace everything between the map end and here.
        pass

# SIMPLER: Use string replacement on the whole content
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Normalize whitespace
content = content.replace('\r\n', '\n')

# The goal is to reach this state:
#         </div>
#       </div>
#     </div>
#   )
#
#   const renderEmployees = () => (

# Let's find where current 'renderTeams' ends
import re
pattern = re.compile(r'(\}\))\s+</div>\s+</div>\s+\)\s+const renderEmployees', re.DOTALL)
if pattern.search(content):
    print("Pattern matched (2 divs). Adding third div.")
    content = pattern.sub(r'\1\n        </div>\n      </div>\n    </div>\n  )\n\n  const renderEmployees', content)
else:
    print("Pattern not matched for 2 divs. Trying 1 or 3...")

with open(path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Normalization and potential fix complete.")
