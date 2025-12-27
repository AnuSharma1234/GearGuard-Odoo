# Just the fixes needed
import re

with open('app/routers/technicians.py', 'r') as f:
    content = f.read()

# Replace the list endpoint
content = re.sub(
    r'# Build detailed response.*?return result',
    'return [TechnicianDetailResponse.model_validate(tech) for tech in technicians]',
    content,
    flags=re.DOTALL
)

# Replace the get endpoint
content = re.sub(
    r'return TechnicianDetailResponse\([^)]+\)',
    'return TechnicianDetailResponse.model_validate(technician)',
    content
)

with open('app/routers/technicians.py', 'w') as f:
    f.write(content)

print("Fixed!")
