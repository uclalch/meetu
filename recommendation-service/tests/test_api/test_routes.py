import pytest
from fastapi.testclient import TestClient
from src.api.routes import router, get_recommender_model
from src.models.base import RecommenderModel

client = TestClient(router)

def test_recommend_friends_endpoint():
    """
    Test friend recommendation API endpoint
    Expected:
    - Returns 200 status code
    - Returns list of recommendations
    - Correct response format
    Potential Issues:
    - Missing user_id
    - Invalid user_id format
    - Empty recommendations
    """
    response = client.get("/recommend/friends/test_user_id")
    assert response.status_code == 200
    assert "recommendations" in response.json()
    
    # Test invalid user_id
    response = client.get("/recommend/friends/")
    assert response.status_code == 404

def test_model_dependency_injection():
    """
    Test model dependency injection in routes
    Expected:
    - Correct model instance injected
    - Model properly configured
    Potential Issues:
    - Model not initialized
    - Wrong model type injected
    """
    test_model = get_recommender_model()
    assert isinstance(test_model, RecommenderModel) 