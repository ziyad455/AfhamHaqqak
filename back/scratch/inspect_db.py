from storage import ScenarioRepository
from config import Settings
from sqlalchemy import select

def inspect_db():
    settings = Settings.from_env()
    print(f"Using MYSQL_URL: {settings.mysql_url}")
    repo = ScenarioRepository(settings.mysql_url)
    if not repo.engine:
        print(f"No DB engine initialized. Error: {repo.init_error}")
        return

    # Check 'scenario_cache' table entries
    query = select(repo.cache_table)
    with repo.engine.connect() as conn:
        print("Checking scenario_cache table...")
        rows = conn.execute(query).fetchall()
        print(f"Total entries in cache: {len(rows)}")
        for row in rows:
            # row: id, raw_input, normalized_input, response_json, scenario_type, created_at, updated_at
            print(f"ID: {row[0]}")
            print(f"Raw Input (first 50): {row[1][:50]}")
            print(f"Norm Input (first 50): {row[2][:50]}")
            print(f"Type: {row[4]}")
            print("-" * 20)

if __name__ == "__main__":
    inspect_db()
