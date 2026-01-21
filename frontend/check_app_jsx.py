
import re

path = r"e:\narayani-java\Saas\frontend\src\App.jsx"

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

def check_balance(text):
    stack = []
    pairs = {'(': ')', '{': '}', '[': ']'}
    lines = text.split('\n')
    for i, line in enumerate(lines):
        for j, char in enumerate(line):
            if char in pairs:
                stack.append((char, i+1, j+1))
            elif char in pairs.values():
                if not stack:
                    print(f"Extra closing {char} at line {i+1}, col {j+1}")
                    continue
                top, li, co = stack.pop()
                if pairs[top] != char:
                    print(f"Mismatched {char} at line {i+1}, col {j+1} (matches {top} from line {li}, col {co})")
    
    for char, li, co in stack:
        print(f"Unclosed {char} from line {li}, col {co}")

print("Checking Braces/Parens Balance...")
check_balance(content)

def check_tags(text):
    # Very simple tag checker
    tags = re.findall(r'<(/?[a-zA-Z0-9]+(?:\s+[^>]*?)?)>', text)
    stack = []
    for tag_full in tags:
        tag_name = tag_full.split()[0]
        if tag_full.endswith('/') or tag_name in ['img', 'br', 'hr', 'input', 'rect', 'path', 'stop', 'stopColor', 'linearGradient', 'defs', 'rect', 'circle', 'svg']: 
            continue
        if tag_name.startswith('/'):
            name = tag_name[1:]
            if not stack:
                print(f"Extra closing tag </{name}>")
                continue
            top = stack.pop()
            if top != name:
                print(f"Mismatched closing tag </{name}> (expected </{top}>)")
        else:
            stack.append(tag_name)
    
    for tag in stack:
        print(f"Unclosed tag <{tag}>")

# Actually, let's just focus on renderTeams area
print("\nChecking Tags in renderTeams area...")
# Extract renderTeams
start_match = re.search(r'const renderTeams = \(\) => \(', content)
if start_match:
    start_pos = start_match.start()
    # Find next function
    end_match = re.search(r'const renderEmployees', content[start_pos:])
    if end_match:
        end_pos = start_pos + end_match.start()
        render_teams_code = content[start_pos:end_pos]
        check_tags(render_teams_code)
    else:
        print("Could not find end of renderTeams")
else:
    print("Could not find renderTeams")
