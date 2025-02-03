import pytest
from src.models.factory import ModelFactory, ContentBasedFactory
from src.models.base import RecommenderModel

def test_content_based_factory():
    """
    Test ContentBasedFactory creates correct model instance
    Expected: 
    - Returns a valid RecommenderModel instance
    - Model has correct type (InterestSimilarityModel)
    Potential Issues:
    - Dependencies not properly initialized
    - Wrong model type returned
    """
    factory = ContentBasedFactory()
    model = factory.create_model()
    assert isinstance(model, RecommenderModel)
    assert model.__class__.__name__ == "InterestSimilarityModel" 