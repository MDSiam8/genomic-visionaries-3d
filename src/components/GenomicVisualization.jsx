// src/components/GenomicVisualization.jsx
import React from 'react';
import Gene from './Gene';

function GenomicVisualization({ data }) {
  return (
    <>
      {data.genes.map((gene) => (
        <Gene key={gene.id} gene={gene} />
      ))}
    </>
  );
}

export default GenomicVisualization;
