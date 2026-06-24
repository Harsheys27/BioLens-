import requests
import json

url = "https://api.platform.opentargets.org/api/v4/graphql"

query = """
{
  disease(efoId: "MONDO_0004975") {
    id
    name

    associatedTargets(
      page: { index: 0, size: 20 }
    ) {
      rows {
        score

        target {
          approvedSymbol
          approvedName
        }
      }
    }
  }
}
"""

response = requests.post(
    url,
    json={"query": query}
)

print(json.dumps(response.json(), indent=2))