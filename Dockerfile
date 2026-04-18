FROM python:3.10-slim

RUN apt-get update && apt-get install -y \
    libgles2-mesa \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

    
WORKDIR /app
COPY . .
RUN pip install -r backend/requirements.txt

CMD cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT