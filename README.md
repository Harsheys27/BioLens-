# 🧬 BioLens

## AI-Powered Genomic Intelligence Platform

BioLens is a biomedical knowledge discovery platform that combines artificial intelligence, bioinformatics, and graph databases to help researchers explore relationships between genes, diseases, proteins, mutations, and drugs.

Built using React, FastAPI, and Neo4j, BioLens enables users to perform genomic searches, analyze mutations, investigate drug interactions, visualize protein information, and generate AI-assisted research insights through an interactive knowledge graph.

---

## Features

* DNA and Gene Search
* Drug Interaction Analysis
* Mutation Analysis
* Multi-Omics Data Exploration
* Protein Visualization
* AI Research Assistant
* Disease-Gene Relationship Discovery
* Patient Digital Twin Analysis
* Knowledge Graph-Based Biomedical Exploration

---

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Backend

* FastAPI
* Python

### Database

* Neo4j Graph Database

---

## Project Structure

```text
BioLens/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── routes/
│   ├── lib/
│   └── styles.css
│
├── biolens-backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── import_data.py
│   └── database/
│
├── package.json
└── README.md
```

---

## Installation

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
pip install -r biolens-backend/requirements.txt
uvicorn main:app --reload
```

---

## Core Modules

### DNA Search Panel

Search and analyze genes using sequence-based and graph-driven relationships.

### Drug Interaction Panel

Explore potential interactions between drugs and their associated biological entities.

### Mutation Analysis

Investigate mutation-specific impacts on genes, proteins, diseases, and therapeutic targets.

### Multi-Omics Explorer

Analyze transcriptomic, proteomic, metabolomic, and epigenetic information.

### Protein Viewer

Visualize protein-related information and biological associations.

### Patient Digital Twin

Generate personalized genomic insights based on patient-specific data.

### AI Research Agent

Assist researchers in exploring biomedical questions using graph-based reasoning and AI-generated insights.

---

## Future Enhancements

* Enhanced Biomedical Knowledge Graph Expansion
* Advanced Disease Prediction Models
* Real-Time Literature Integration
* Drug Repurposing Recommendations
* Improved Protein Structure Analysis
* Explainable AI-Based Research Workflows

---

## Contributors

Harshit Chaturvedi

---

## License

School of BioTechnology SRM,KTR

---

## Disclaimer

BioLens is intended for educational and research purposes only. The platform does not provide medical advice, diagnosis, or treatment recommendations. Any insights generated should be validated through appropriate scientific and clinical evaluation.
