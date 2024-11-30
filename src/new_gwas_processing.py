import pandas as pd
import json
import os

# Define constants for filtering and normalization
P_VALUE_THRESHOLD = 1e-25  # Stricter p-value threshold
ODDS_RATIO_MIN = 2.0       # Minimum for very strong risk alleles
ODDS_RATIO_MAX = 0.5       # Maximum for very strong protective alleles
CHROMOSOME_LENGTHS = {
    '1': 248956422, '2': 242193529, '3': 198295559, '4': 190214555,
    '5': 181538259, '6': 170805979, '7': 159345973, '8': 145138636,
    '9': 138394717, '10': 133797422, '11': 135086622, '12': 133275309,
    '13': 114364328, '14': 107043718, '15': 101991189, '16': 90338345,
    '17': 83257441, '18': 80373285, '19': 58617616, '20': 64444167,
    '21': 46709983, '22': 50818468, 'X': 156040895, 'Y': 57227415,
    'MT': 16569
}

# Set maximum chromosome length for scaling
max_chrom_length = max(CHROMOSOME_LENGTHS.values())
SCALE_LENGTH = 100.0  # Units for the longest chromosome in visualization

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
    'STRONGEST SNP-RISK ALLELE', 'P-VALUE', 'OR or BETA'
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

# Apply stricter filtering conditions
df_filtered = df[
    (df['P-VALUE'] < P_VALUE_THRESHOLD) &
    (
        (df['OR or BETA'] >= ODDS_RATIO_MIN) |
        (df['OR or BETA'] <= ODDS_RATIO_MAX)
    )
].copy()

# Normalize positions relative to chromosome length for visualization
def normalize_position(row):
    chrom_length = CHROMOSOME_LENGTHS.get(row['CHR_ID'], None)
    if chrom_length is None:
        return None
    chrom_length_ratio = chrom_length / max_chrom_length  # between 0 and 1
    visual_chrom_length = chrom_length_ratio * SCALE_LENGTH  # scaled length
    normalized_pos = (row['CHR_POS'] / chrom_length) * visual_chrom_length - (visual_chrom_length / 2)
    return round(normalized_pos, 4)

df_filtered['NormalizedPosition'] = df_filtered.apply(normalize_position, axis=1)

# Drop rows where NormalizedPosition is None (in case of missing chromosome length)
df_filtered = df_filtered.dropna(subset=['NormalizedPosition'])

# Optional: Further quality control (e.g., removing duplicates)
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
        "NormalizedPosition": row['NormalizedPosition'],
        "MappedGene": row['MAPPED_GENE'],
        "RiskAllele": risk_allele_formatted,
        "PValue": row['P-VALUE'],
        "OddsRatio": round(row['OR or BETA'], 2),
        "Color": "#FF5733" if row['OR or BETA'] > 1 else "#33FF57"  # Risk (red) or protective (green)
    }
    output_data.append(variant)

# Define output directory and ensure it exists
output_dir = "src/components/data/processed"
os.makedirs(output_dir, exist_ok=True)

# Save JSON file
output_file = os.path.join(output_dir, "gwas_wrt_chr_size.json")
try:
    with open(output_file, "w") as f:
        json.dump(output_data, f, indent=4)
    print(f"Processed GWAS data saved as {output_file}")
except Exception as e:
    print(f"Error saving JSON file: {e}")
    exit(1)
