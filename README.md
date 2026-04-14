# AfhamHaqqak

Project structure:

- `front` contains the frontend app.
- `back` contains the backend API, ingestion scripts, datasets, and static tester.

Run the frontend:

```bash
cd front
npm install
npm run dev
```

Run the backend:

```bash
cd back
pip install -r requirements.txt
python api.py
```

Build backend artifacts if they are missing:

```bash
cd back
python ingestion.py
python indexing.py
```
