from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Recommendation service is running"}

@app.get("/recommend/friends")
async def recommend_friends(user_id: str):
    # TODO: Implement friend recommendations
    return {"recommendations": []} 