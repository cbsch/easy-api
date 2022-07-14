# Developing

Start postgres container

```bash
docker run --rm -it -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD=postgres postgres
```

Run dev script (it will automatically reload on changes)
```bash
npm run dev
```