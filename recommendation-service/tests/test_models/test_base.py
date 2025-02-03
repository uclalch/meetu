import pytest
from src.models.base import RecommenderModel

def test_recommender_model_abstract():
    """
    Test that RecommenderModel cannot be instantiated directly
    Expected: TypeError when trying to instantiate abstract class
    """
    with pytest.raises(TypeError):
        RecommenderModel() 