import pandas as pd
import json

# Load the CSV file
df = pd.read_csv("data/processed/clinvar_cleaned.csv")

# Select relevant columns
df = df[['Chromosome', 'Position', 'ReferenceAllele', 'AlternateAllele', 'TraitAssociation']]

# Limit variants per chromosome to avoid overcrowding
# Adjust limit as needed
limit_per_chromosome = 50
filtered_data = df.groupby('Chromosome').apply(lambda x: x.head(limit_per_chromosome)).reset_index(drop=True)

# Normalize positions relative to chromosome length for visualization
# Here, using a fictional max position (adjust as needed for real scaling)
max_position = 2000000  # adjust if you have a more realistic length

# Convert to JSON format with relevant fields and normalized positions
output_data = []

for _, row in filtered_data.iterrows():
    variant = {
        "Chromosome": str(row['Chromosome']),
        "Position": row['Position'],
        "NormalizedPosition": (row['Position'] % max_position) / max_position * 100 - 50,  # Adjusted for 3D scaling
        "ReferenceAllele": row['ReferenceAllele'],
        "AlternateAllele": row['AlternateAllele'],
        "TraitAssociation": row['TraitAssociation'],
        "Color": "#FF5733" if "disease" in str(row['TraitAssociation']).lower() else "#33FF57"  # example color-coding
    }
    output_data.append(variant)

# Save to JSON
with open("clinvar_filtered.json", "w") as f:
    json.dump(output_data, f, indent=4)
