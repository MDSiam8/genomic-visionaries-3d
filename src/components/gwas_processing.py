import pandas as pd
import json
import os

# Define constants for filtering and normalization
P_VALUE_THRESHOLD = 1e-10  # Stricter p-value threshold
ODDS_RATIO_MIN = 1.5       # Minimum for strong risk alleles
ODDS_RATIO_MAX = 0.67      # Maximum for strong protective alleles
MAX_POSITION = 2000000      # Adjust based on realistic chromosome scaling
CHROMOSOME_LENGTHS = {
    '1': 248956422, '2': 242193529, '3': 198295559, '4': 190214555,
    '5': 181538259, '6': 170805979, '7': 159345973, '8': 145138636,
    '9': 138394717, '10': 133797422, '11': 135086622, '12': 133275309,
    '13': 114364328, '14': 107043718, '15': 101991189, '16': 90338345,
    '17': 83257441, '18': 80373285, '19': 58617616, '20': 64444167,
    '21': 46709983, '22': 50818468, 'X': 156040895, 'Y': 57227415,
    'MT': 16569
}

# Load GWAS Catalog TSV file
gwas_file = "src/components/data/gwas/gwas_catalog.tsv"
try:
    df = pd.read_csv(gwas_file, sep='\t', low_memory=False)
except FileNotFoundError:
    print(f"Error: GWAS file '{gwas_file}' not found.")
    exit(1)
except Exception as e:
    print(f"Error reading GWAS file: {e}")
    exit(1)

# Ensure necessary columns are present
required_columns = [
    'DISEASE/TRAIT', 'CHR_ID', 'CHR_POS', 'MAPPED_GENE',
    'STRONGEST SNP-RISK ALLELE', 'P-VALUE', 'OR or BETA', '95% CI (TEXT)'
]
missing_columns = [col for col in required_columns if col not in df.columns]
if missing_columns:
    print(f"Error: Missing columns in GWAS data: {missing_columns}")
    exit(1)

# Convert relevant columns to numeric, handling invalid entries
df['CHR_POS'] = pd.to_numeric(df['CHR_POS'], errors='coerce')
df['P-VALUE'] = pd.to_numeric(df['P-VALUE'], errors='coerce')
df['OR or BETA'] = pd.to_numeric(df['OR or BETA'], errors='coerce')

# Drop rows with invalid CHR_POS, P-VALUE, or OR or BETA values
df = df.dropna(subset=['CHR_POS', 'P-VALUE', 'OR or BETA'])

# Further ensure CHR_ID is string and handle special chromosomes
df['CHR_ID'] = df['CHR_ID'].astype(str).str.upper().str.strip()
df = df[df['CHR_ID'].isin(CHROMOSOME_LENGTHS.keys())]

# Apply filtering conditions
df_filtered = df[
    (df['P-VALUE'] < P_VALUE_THRESHOLD) &
    (
        (df['OR or BETA'] >= ODDS_RATIO_MIN) |
        (df['OR or BETA'] <= ODDS_RATIO_MAX)
    )
].copy()

# Normalize positions relative to chromosome length for visualization
def normalize_position(row):
    chrom_length = CHROMOSOME_LENGTHS.get(row['CHR_ID'], MAX_POSITION)
    return (row['CHR_POS'] / chrom_length) * 100 - 50  # Scale to -50 to +50

df_filtered['NormalizedPosition'] = df_filtered.apply(normalize_position, axis=1)

# Optional: Further quality control (e.g., removing duplicates, ensuring gene mapping)
df_filtered = df_filtered.drop_duplicates(subset=['CHR_ID', 'CHR_POS', 'STRONGEST SNP-RISK ALLELE'])

# Convert data to JSON format
output_data = []
for _, row in df_filtered.iterrows():
    # Parse Risk Allele to ensure it follows the format rsID-Allele
    risk_allele = row['STRONGEST SNP-RISK ALLELE']
    if '-' in risk_allele:
        rsid, allele = risk_allele.split('-', 1)
        risk_allele_formatted = f"{rsid}-{allele.upper()}"
    else:
        risk_allele_formatted = risk_allele.upper()
    
    variant = {
        "DiseaseOrTrait": row['DISEASE/TRAIT'],
        "Chromosome": row['CHR_ID'],
        "Position": int(row['CHR_POS']),
        "NormalizedPosition": round(row['NormalizedPosition'], 4),
        "MappedGene": row['MAPPED_GENE'],
        "RiskAllele": risk_allele_formatted,
        "PValue": row['P-VALUE'],
        "OddsRatio": round(row['OR or BETA'], 2),
        "ConfidenceInterval": row['95% CI (TEXT)'],
        "Color": "#FF5733" if row['OR or BETA'] > 1 else "#33FF57"  # Risk (red) or protective (green)
    }
    output_data.append(variant)

# Define output directory and ensure it exists
output_dir = "src/components/data/processed"
os.makedirs(output_dir, exist_ok=True)

# Save JSON file
output_file = os.path.join(output_dir, "o1-gwas_filtered.json")
try:
    with open(output_file, "w") as f:
        json.dump(output_data, f, indent=4)
    print(f"Filtered GWAS data saved as {output_file}")
except Exception as e:
    print(f"Error saving JSON file: {e}")
    exit(1)
