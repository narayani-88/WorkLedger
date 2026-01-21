
import os
import re

path = r"e:\narayani-java\Saas\frontend\src\App.jsx"

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern: end of projects loop, followed by closing divs, followed by ) and start of next function
pattern = r'(activeProjectsDetailed\.map.*?\}\))\s+</div>\s+</div>\s+\)\s+const renderEmployees'
# Wait, let's check the current content again.
# 838:         ))}
# 839:       </div>
# 840:     </div>
# 841:   )

# The pattern should match line 838 to 843
pattern = re.compile(r'(\}\))\s+</div>\s+</div>\s+\)\s+const renderEmployees', re.DOTALL)

if pattern.search(content):
    print("Pattern found! Replacing...")
    # Add one more </div>
    new_content = pattern.sub(r'\1\n      </div>\n    </div>\n  </div>\n  )\n\n  const renderEmployees', content)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("SUCCESS")
else:
    print("Pattern NOT found. Trying simpler one...")
    # Try just matching the end of the function
    pattern2 = re.compile(r'</div>\s+</div>\s+\)\s+const renderEmployees', re.DOTALL)
    if pattern2.search(content):
        print("Pattern 2 found! Replacing...")
        new_content = pattern2.sub(r'</div>\n      </div>\n    </div>\n  )\n\n  const renderEmployees', content)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("SUCCESS")
    else:
        print("FAILURE")
