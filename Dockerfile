FROM python:3.10-bullseye

RUN apt-get update && apt-get install -y \
    libgles2 \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
RUN pip install -r backend/requirements.txt

CMD cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT