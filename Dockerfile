FROM python:3.10-bullseye

RUN apt-get update && apt-get install -y \
    libgles2 \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libegl1 \
    libglvnd0 \
    libglx0 \
    libgl1-mesa-glx \
    libgles2-mesa \
    && rm -rf /var/lib/apt/lists/*

RUN ln -sf /usr/lib/x86_64-linux-gnu/libGLESv2.so.2 /usr/lib/libGLESv2.so.2 || true
RUN ln -sf /usr/lib/x86_64-linux-gnu/libEGL.so.1 /usr/lib/libEGL.so.1 || true

WORKDIR /app
COPY . .
RUN pip install -r backend/requirements.txt

CMD cd backend && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}