import json
import os

# Input and output file paths
input_file = "../../public/assets/o1-gwas_filtered.json"
output_file = "../../public/assets/o1-gwas_cleaned.json"

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

# Clean data: Remove entries with invalid ConfidenceInterval
cleaned_data = [
    variant
    for variant in data
    if variant.get("ConfidenceInterval") and "NaN" not in str(variant["ConfidenceInterval"])
]

# Save the cleaned JSON file
os.makedirs(os.path.dirname(output_file), exist_ok=True)
try:
    with open(output_file, "w") as f:
        json.dump(cleaned_data, f, indent=4)
    print(f"Cleaned data saved to {output_file}.")
except Exception as e:
    print(f"Error saving cleaned JSON file: {e}")
    exit(1)
