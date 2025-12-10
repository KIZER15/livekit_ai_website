### Backend installation

```
git clone https://github.com/shubhamINT/livekit_ai_website.git
cd livekit_ai_website/backend
python -m venv venv
pip install -r requirements.txt
python agent_session.py download-files
```

## Then in one terminal 
```
python server_run.py
```
Another terminal

```
python agent_session.py start
```

### For Frontend 

```
cd ../frontend
npm install
npm run dev
```