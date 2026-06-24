from neo4j import GraphDatabase
import requests

driver = GraphDatabase.driver(
    "bolt://localhost:7687",
    auth=("neo4j", "Godrej@111")
)

url = "https://api.platform.opentargets.org/api/v4/graphql"

disease_ids = [
    "MONDO_0004975",  # Alzheimer
    "MONDO_0005180",  # Parkinson
    "EFO_0000311",    # Breast Cancer
    "EFO_0001360",    # Type 2 Diabetes
    "EFO_0003767"     # COVID-19
]
for disease_id in disease_ids:

    query = f"""
    {{
      disease(efoId: "{disease_id}") {{
        name

        associatedTargets(
          page: {{ index: 0, size: 50 }}
        ) {{
          rows {{
            score

            target {{
              approvedSymbol
              approvedName
            }}
          }}
        }}
      }}
    }}
    """
    response = requests.post(
        url,
        json={"query": query}
    )

    data = response.json()

    disease = data["data"]["disease"]

    if not disease:
        print("Skipping:", disease_id)
        continue

    disease_name = disease["name"]

    print("Importing:", disease_name)

    with driver.session(database="biolens") as session:

        session.run(
            """
            MERGE (d:Disease {name:$name})
            """,
            name=disease_name
        )

        for row in disease["associatedTargets"]["rows"]:

            gene = row["target"]["approvedSymbol"]
            gene_name = row["target"]["approvedName"]
            score = row["score"]

            session.run(
                """
                MERGE (g:Gene {name:$gene})

                SET g.full_name = $gene_name

                WITH g

                MATCH (d:Disease {name:$disease})

                MERGE (d)-[r:ASSOCIATED_WITH]->(g)

                SET r.score = $score
                """,
                gene=gene,
                gene_name=gene_name,
                disease=disease_name,
                score=score
            )
            
            
print("ALL IMPORTS COMPLETE")