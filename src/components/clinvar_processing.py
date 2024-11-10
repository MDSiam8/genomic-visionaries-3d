import pysam
import pandas as pd

# Define file paths
vcf_path = 'data/clinvar/clinvar.vcf.gz'
output_csv_path = 'data/processed/clinvar_cleaned.csv'

# Initialize lists to store data
chromosomes = []
positions = []
ref_alleles = []
alt_alleles = []
traits = []

# Open the VCF file with pysam
vcf_file = pysam.VariantFile(vcf_path)

for record in vcf_file:
    # Check for clinical significance in INFO field
    clnsig = record.info.get('CLNSIG', [])
    if 'Pathogenic' in clnsig or 'Likely_pathogenic' in clnsig:
        # Extract relevant information
        chromosomes.append(record.chrom)
        positions.append(record.pos)
        ref_alleles.append(record.ref)
        
        # Handle cases where ALT is None
        if record.alts is not None:
            alt_alleles.append(','.join(str(alt) for alt in record.alts))
        else:
            alt_alleles.append("N/A")
        
        # Handle traits, providing a default if not found
        traits.append(record.info.get('CLNDN', ['N/A'])[0])

# Create a DataFrame and save as CSV
df = pd.DataFrame({
    'Chromosome': chromosomes,
    'Position': positions,
    'ReferenceAllele': ref_alleles,
    'AlternateAllele': alt_alleles,
    'TraitAssociation': traits
})
df.to_csv(output_csv_path, index=False)
print(f"ClinVar data processed and saved to {output_csv_path}")
