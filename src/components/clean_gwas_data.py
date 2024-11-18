import json
import os

# Input and output file paths
input_file = "../../public/assets/o1-gwas_cleaned.json"  # Adjusted for relative path
output_file = "../../public/assets/o1-gwas_strict_filtered.json"

# Define stricter filtering parameters
P_VALUE_THRESHOLD = 1e-25  # More restrictive p-value threshold
ODDS_RATIO_MIN = 2.0       # Minimum for very strong risk alleles
ODDS_RATIO_MAX = 0.5       # Maximum for very strong protective alleles

# Load the filtered JSON file
try:
    with open(input_file, "r") as f:
        data = json.load(f)
except FileNotFoundError:
    print(f"Error: Input file '{input_file}' not found.")
    exit(1)
except json.JSONDecodeError as e:
    print(f"Error decoding JSON: {e}")
    exit(1)

# Apply stricter filters and remove 'ConfidenceInterval'
filtered_data = []
for variant in data:
    # Check for valid P-Value
    if variant.get("PValue", float('inf')) >= P_VALUE_THRESHOLD:
        continue
    
    # Filter by OddsRatio (risk or protective variants)
    odds_ratio = variant.get("OddsRatio", None)
    if odds_ratio is not None and not (odds_ratio >= ODDS_RATIO_MIN or odds_ratio <= ODDS_RATIO_MAX):
        continue
    
    # Ensure RiskAllele is present and correctly formatted
    if not variant.get("RiskAllele"):
        continue

    # Add the cleaned variant to the filtered data
    filtered_data.append(variant)

# Save the filtered JSON file
os.makedirs(os.path.dirname(output_file), exist_ok=True)
try:
    with open(output_file, "w") as f:
        json.dump(filtered_data, f, indent=4)
    print(f"Strictly filtered data saved to {output_file}.")
except Exception as e:
    print(f"Error saving JSON file: {e}")
    exit(1)
