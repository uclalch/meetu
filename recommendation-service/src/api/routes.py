from fastapi import APIRouter, Depends
from ..models.factory import ModelFactory, ContentBasedFactory
from ..models.builder import ModelBuilder, ContentBasedBuilder
from ..models.director import ModelDirector
from ..models.base import RecommenderModel

router = APIRouter()

def get_recommender_model():
    factory = ContentBasedFactory()
    builder = ContentBasedBuilder()
    director = ModelDirector(builder)
    
    director.create_basic_model()
    model = builder.build()
    return model

@router.get("/recommend/friends/{user_id}")
async def recommend_friends(
    user_id: str,
    model: RecommenderModel = Depends(get_recommender_model)
):
    recommendations = model.predict(user_id)
    return {"recommendations": recommendations}
