
import os

path = r"e:\narayani-java\Saas\frontend\src\App.jsx"

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

count = 0
for i, line in enumerate(lines):
    if i >= 634 and i <= 831:
        # Check for < and > balances
        open_tags = line.count('<') - line.count('</') - line.count('/>')
        close_tags = line.count('</')
        # This is too simple, let's just use manual count
        pass

# Let's count divs in renderTeams
div_count = 0
for i in range(634, 831):
    line = lines[i]
    div_count += line.count('<div')
    div_count -= line.count('</div')

print(f"Net div balance in renderTeams (lines 635-831): {div_count}")
